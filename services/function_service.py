from sqlalchemy.orm import Session

from services.rag_service import search_website


def create_search_website_tool(
    db: Session,
    admin_id: int,
):
    """
    Creates a Gemini function tool for searching
    the website knowledge base.

    The returned function captures the current
    database session and admin ID, so Gemini only
    needs to provide the user's question.
    """

    def search_website_tool(question: str) -> str:
        """
        Search the website knowledge base for
        information related to the user's question.

        Use this tool whenever the answer depends on
        the website's content.
        """

        return search_website(
            db=db,
            admin_id=admin_id,
            question=question,
        )

    return search_website_tool