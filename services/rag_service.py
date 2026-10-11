from services.milvus_service import search_chunks


def search_website(
    db,
    admin_id: int,
    question: str,
    top_k: int = 3,
    selected_website_ids: list[int] | None = None,
) -> str:
    """
    Search the website knowledge base and return relevant context
    as a plain string.

    Called by the Gemini Function Calling executor (function_service.py)
    when Gemini decides to invoke the search_knowledge tool.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session (reserved for future use).
    admin_id : int
        ID of the admin whose Milvus collection is searched.
    question : str
        The user's query, forwarded from Gemini's function call arguments.
    top_k : int
        Maximum number of chunks to retrieve from Milvus.
    selected_website_ids : list[int] | None
        IDs of the WebsiteContent rows to restrict the search to.
        If None or empty, all indexed websites for this admin are searched.

    Returns
    -------
    str
        Retrieved website context joined by double newlines,
        or an empty string if no results are found.
    """

    results = search_chunks(
        admin_id=admin_id,
        question=question,
        top_k=top_k,
        selected_website_ids=selected_website_ids,
    )

    if not results:
        return ""

    return "\n\n".join(
        result["chunk"]
        for result in results
    )