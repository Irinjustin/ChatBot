from services.chunk_service import split_text_into_chunks

text = "Hello World! " * 500

chunks = split_text_into_chunks(text)

print("Total Chunks:", len(chunks))

for i, chunk in enumerate(chunks):
    print(f"Chunk {i+1}: {len(chunk)} characters")