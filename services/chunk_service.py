import re

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# Pretrained model used only for semantic chunking
semantic_model = SentenceTransformer("all-MiniLM-L6-v2")


def split_semantic_chunks(
    text: str,
    similarity_threshold: float = 0.55,
    max_chunk_size: int = 1200,
):
    """
    Split text into semantically related chunks using
    sentence embeddings and cosine similarity.

    Sentences with similar meanings are grouped together.
    A new chunk is created when semantic similarity drops
    below the specified threshold.

    max_chunk_size prevents individual chunks from becoming
    excessively large.
    """

    if not text:
        return []

    # --------------------------------------------------
    # 1. Normalize text
    # --------------------------------------------------

    text = text.strip()

    if not text:
        return []

    # --------------------------------------------------
    # 2. Split text into sentences
    # --------------------------------------------------

    sentences = re.split(
        r"(?<=[.!?])\s+",
        text
    )

    sentences = [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]

    if not sentences:
        return []

    # --------------------------------------------------
    # 3. Generate embeddings for each sentence
    # --------------------------------------------------

    embeddings = semantic_model.encode(
        sentences,
        normalize_embeddings=True
    )

    # --------------------------------------------------
    # 4. Build semantic chunks
    # --------------------------------------------------

    chunks = []

    current_chunk = [sentences[0]]
    current_length = len(sentences[0])

    for i in range(1, len(sentences)):

        previous_embedding = embeddings[i - 1]
        current_embedding = embeddings[i]

        similarity = cosine_similarity(
            [previous_embedding],
            [current_embedding]
        )[0][0]

        sentence = sentences[i]
        sentence_length = len(sentence)

        # Can this sentence safely be added?
        within_size_limit = (
            current_length + sentence_length + 1
            <= max_chunk_size
        )

        # Similar meaning + size is acceptable
        if (
            similarity >= similarity_threshold
            and within_size_limit
        ):
            current_chunk.append(sentence)
            current_length += sentence_length + 1

        else:
            # Semantic boundary detected
            chunks.append(
                " ".join(current_chunk).strip()
            )

            current_chunk = [sentence]
            current_length = sentence_length

    # --------------------------------------------------
    # 5. Save final chunk
    # --------------------------------------------------

    if current_chunk:
        chunks.append(
            " ".join(current_chunk).strip()
        )

        # --------------------------------------------------
        # DEBUG: Check semantic chunks
        # --------------------------------------------------

        print("\n========== SEMANTIC CHUNKING TEST ==========")
        print(f"Total sentences: {len(sentences)}")
        print(f"Total semantic chunks: {len(chunks)}")

        for i, chunk in enumerate(chunks[:20]):
            print(f"\nCHUNK {i}")
            print(f"Size: {len(chunk)} characters")
            print(chunk[:500])

        print("============================================\n")

        return chunks

def split_text_into_chunks(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200,
):
    """
    Split text into overlapping chunks.
    """

    if not text:
        return []

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:

        end = min(start + chunk_size, text_length)

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - overlap

    return chunks