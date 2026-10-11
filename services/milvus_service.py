import crud
from services.embedding_service import generate_embedding
from services.chunk_service import split_text_into_chunks
from pymilvus import MilvusClient, DataType


MILVUS_URI = "http://localhost:19530"
COLLECTION_NAME = "website_chunks"
EMBEDDING_DIM = 3072

# Module-level singleton client — created once, reused on every request
_client: MilvusClient | None = None


def get_client() -> MilvusClient:
    """
    Return the shared MilvusClient, creating it once on first call.
    MilvusClient manages its own connection pool internally.
    """
    global _client
    if _client is None:
        _client = MilvusClient(uri=MILVUS_URI)
        _ensure_collection(_client)
        print("[Milvus] Client initialized and collection ready.")
    return _client


def _ensure_collection(client: MilvusClient):
    """
    Create the collection and index if they do not already exist.

    If the collection exists but is missing the `website_content_id`
    field (old schema), it is dropped and recreated automatically.
    All previously indexed data will need to be re-synced by the admin.
    """
    if client.has_collection(COLLECTION_NAME):
        # Inspect fields of the existing collection
        desc = client.describe_collection(COLLECTION_NAME)
        field_names = [f["name"] for f in desc["fields"]]

        if "website_content_id" in field_names:
            # Schema is up to date — nothing to do
            return

        # Old schema detected — drop and recreate with the new field
        print(
            "[Milvus] Old schema detected (missing 'website_content_id'). "
            "Dropping collection and recreating with updated schema. "
            "Please re-sync all websites."
        )
        client.drop_collection(COLLECTION_NAME)

    # Build schema with website_content_id for per-website filtering
    schema = client.create_schema(auto_id=True, enable_dynamic_field=False)
    schema.add_field(field_name="id",                 datatype=DataType.INT64,         is_primary=True, auto_id=True)
    schema.add_field(field_name="admin_id",           datatype=DataType.INT64)
    schema.add_field(field_name="website_content_id", datatype=DataType.INT64)
    schema.add_field(field_name="chunk_text",         datatype=DataType.VARCHAR,        max_length=65535)
    schema.add_field(field_name="embedding",          datatype=DataType.FLOAT_VECTOR,   dim=EMBEDDING_DIM)

    index_params = client.prepare_index_params()
    index_params.add_index(
        field_name="embedding",
        index_type="AUTOINDEX",
        metric_type="COSINE",
    )

    client.create_collection(
        collection_name=COLLECTION_NAME,
        schema=schema,
        index_params=index_params,
    )
    print(f"[Milvus] Collection '{COLLECTION_NAME}' created with updated schema.")


def index_website(db, admin_id: int, website_url: str):
    """
    Index a specific website URL for the given admin.

    - Reads the WebsiteContent row for this URL from PostgreSQL.
    - Deletes only the chunks that belong to this website_content_id
      (other websites for the same admin are untouched).
    - Splits content into chunks, generates embeddings, and inserts them
      tagged with website_content_id for per-website RAG filtering.
    """
    client = get_client()

    # Resolve website_url → WebsiteContent row
    website = crud.get_website_content(db, admin_id, website_url)
    if website is None:
        raise Exception(f"Website content not found for URL: {website_url}")

    # Delete only the chunks for this specific website (leave others intact)
    client.delete(
        collection_name=COLLECTION_NAME,
        filter=f"website_content_id == {website.id}",
    )

    chunks = split_text_into_chunks(website.content)
    print(f"[Milvus] Indexing {len(chunks)} chunks for website_content_id={website.id}")

    # Synchronize PostgreSQL chunks
    crud.delete_website_chunks(db, website.id)
    crud.save_website_chunks(db, website.id, chunks)

    if not chunks:
        print(f"[Milvus] No chunks to index for website_content_id={website.id}")
        return

    data = []
    for chunk in chunks:
        embedding = generate_embedding(chunk)
        data.append({
            "admin_id":           admin_id,
            "website_content_id": website.id,
            "chunk_text":         chunk,
            "embedding":          embedding,
        })

    client.insert(collection_name=COLLECTION_NAME, data=data)
    print(f"[Milvus] Indexed {len(data)} chunks for website_content_id={website.id}, admin_id={admin_id}.")


def search_chunks(
    admin_id: int,
    question: str,
    top_k: int = 3,
    selected_website_ids: list[int] | None = None,
):
    """
    Search Milvus for the most relevant chunks for a given question.

    Parameters
    ----------
    admin_id : int
        Scopes the search to this admin's data.
    question : str
        The user query to embed and search.
    top_k : int
        Maximum number of chunks to return.
    selected_website_ids : list[int] | None
        If provided, only chunks from these WebsiteContent IDs are searched.
        If None or empty, all websites for this admin are searched.

    Returns a list of dicts with 'score', 'chunk', and 'admin_id'.
    """
    client = get_client()

    question_embedding = generate_embedding(question)

    # Build Milvus filter expression
    if selected_website_ids:
        ids_str = ", ".join(str(i) for i in selected_website_ids)
        filter_expr = (
            f"admin_id == {admin_id} "
            f"&& website_content_id in [{ids_str}]"
        )
    else:
        # No selection → search across all indexed websites for this admin
        filter_expr = f"admin_id == {admin_id}"

    results = client.search(
        collection_name=COLLECTION_NAME,
        data=[question_embedding],
        anns_field="embedding",
        search_params={"metric_type": "COSINE", "params": {}},
        limit=top_k,
        filter=filter_expr,
        output_fields=["chunk_text", "admin_id"],
    )

    chunks = []
    for hit in results[0]:
        chunks.append({
            "score":    hit["distance"],
            "chunk":    hit["entity"]["chunk_text"],
            "admin_id": hit["entity"]["admin_id"],
        })

    return chunks