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
    """
    if client.has_collection(COLLECTION_NAME):
        return

    schema = client.create_schema(auto_id=True, enable_dynamic_field=False)
    schema.add_field(field_name="id",       datatype=DataType.INT64,         is_primary=True, auto_id=True)
    schema.add_field(field_name="admin_id", datatype=DataType.INT64)
    schema.add_field(field_name="chunk_text", datatype=DataType.VARCHAR,     max_length=65535)
    schema.add_field(field_name="embedding",  datatype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM)

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
    print(f"[Milvus] Collection '{COLLECTION_NAME}' created.")


def index_website(db, admin_id: int):
    """
    Read website content from PostgreSQL, split into chunks,
    generate embeddings, and store them in Milvus.
    Replaces any existing chunks for this admin_id.
    """
    client = get_client()

    # Delete existing data for this admin
    client.delete(
        collection_name=COLLECTION_NAME,
        filter=f"admin_id == {admin_id}",
    )

    website = crud.get_website_content(db, admin_id)
    if website is None:
        raise Exception("Website content not found.")

    chunks = split_text_into_chunks(website.content)
    print(f"[Milvus] Total chunks to index: {len(chunks)}")

    data = []
    for chunk in chunks:
        embedding = generate_embedding(chunk)
        data.append({
            "admin_id":   admin_id,
            "chunk_text": chunk,
            "embedding":  embedding,
        })

    client.insert(collection_name=COLLECTION_NAME, data=data)
    print(f"[Milvus] Website indexed successfully for admin_id={admin_id}.")


def search_chunks(admin_id: int, question: str, top_k: int = 3):
    """
    Search Milvus for the most relevant chunks for a given question.
    Returns a list of dicts with 'score', 'chunk', and 'admin_id'.
    """
    client = get_client()

    question_embedding = generate_embedding(question)

    results = client.search(
        collection_name=COLLECTION_NAME,
        data=[question_embedding],
        anns_field="embedding",
        search_params={"metric_type": "COSINE", "params": {}},
        limit=top_k,
        filter=f"admin_id == {admin_id}",
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