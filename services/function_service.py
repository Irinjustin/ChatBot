from sqlalchemy.orm import Session

from google.genai import types

from services.rag_service import search_website


# ------------------------------------
# FunctionDeclaration
# ------------------------------------

# Defined once at module level so it is never re-created on every request.
SEARCH_KNOWLEDGE_DECLARATION = types.FunctionDeclaration(
    name="search_knowledge",
    description=(
        "Search the website knowledge base for information related to the "
        "user's question. "
        "Use this tool whenever the user asks about the company, its products, "
        "services, courses, pricing, team, contact details, location, or any "
        "other topic that would be found on the website. "
        "Do NOT use this tool for general knowledge questions such as "
        "definitions, weather, time, sports, or unrelated topics."
    ),
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "query": types.Schema(
                type=types.Type.STRING,
                description=(
                    "The user's question or topic to search for "
                    "in the website knowledge base."
                ),
            ),
        },
        required=["query"],
    ),
)


def build_search_knowledge_tool() -> types.Tool:
    """
    Returns a types.Tool containing the search_knowledge FunctionDeclaration.

    Pass the returned tool in the `tools` list to generate_response()
    when rag_enabled is True.
    """

    return types.Tool(
        function_declarations=[SEARCH_KNOWLEDGE_DECLARATION]
    )


def build_tool_executor(
    db: Session,
    admin_id: int,
    selected_website_ids: list[int] | None = None,
) -> dict:
    """
    Returns a dict that maps each registered function name to its
    Python implementation.

    The inner callable captures `db`, `admin_id`, and
    `selected_website_ids` from the outer scope so that Gemini only
    needs to provide the search query.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session.
    admin_id : int
        ID of the admin whose knowledge base is searched.
    selected_website_ids : list[int] | None
        IDs of the WebsiteContent rows to restrict RAG search to.
        If None or empty, all indexed websites for this admin are searched.

    Usage
    -----
    executor = build_tool_executor(db, current_user.id, config.selected_website_ids)
    # Then pass to generate_response(tool_executor=executor)
    """

    def search_knowledge(query: str) -> str:
        """
        Execute a Milvus similarity search and return the
        relevant website context as a plain string.
        """

        return search_website(
            db=db,
            admin_id=admin_id,
            question=query,
            selected_website_ids=selected_website_ids,
        )

    return {
        "search_knowledge": search_knowledge,
    }