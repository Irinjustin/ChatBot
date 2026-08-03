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