from services.embedding_service import generate_embedding

embedding = generate_embedding("Hello World")

print(type(embedding))
print(len(embedding))
print(embedding[:10])