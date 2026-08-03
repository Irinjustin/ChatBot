from pymilvus import Collection
from services.milvus_service import connect_milvus

connect_milvus()

collection = Collection("website_chunks")

index_params = {
    "metric_type": "COSINE",
    "index_type": "AUTOINDEX",
    "params": {}
}

collection.create_index(
    field_name="embedding",
    index_params=index_params
)

print("✅ Index Created")