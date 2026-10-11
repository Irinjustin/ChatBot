from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from models import User, AgentConfiguration, Conversation, Message, WebsiteContent, WebsiteChunk


# ===========================
# USER
# ===========================

def get_user_by_email(db: Session, email: str):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def get_user_by_username(db: Session, username: str):
    return (
        db.query(User)
        .filter(User.username == username)
        .first()
    )


def create_user(
    db: Session,
    username: str,
    email: str,
    password: str,
    role: str
):

    user = User(
        username=username,
        email=email,
        password=password,
        role=role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ===========================
# AGENT CONFIGURATION
# ===========================

def get_agent_configuration(
    db: Session,
    admin_id: int
):
    return (
        db.query(AgentConfiguration)
        .filter(
            AgentConfiguration.admin_id == admin_id
        )
        .first()
    )


def save_agent_configuration(
    db: Session,
    admin_id: int,
    data
):

    configuration = get_agent_configuration(
        db,
        admin_id
    )

    if configuration:

        configuration.website_url = data.website_url
        configuration.system_prompt = data.system_prompt
        configuration.model_name = data.model_name
        configuration.temperature = data.temperature
        configuration.max_tokens = data.max_tokens
        configuration.thinking = data.thinking
        configuration.rag_enabled = data.rag_enabled
        configuration.selected_website_ids = data.selected_website_ids
    else:

        configuration = AgentConfiguration(
            admin_id=admin_id,
            website_url=data.website_url,
            system_prompt=data.system_prompt,
            model_name=data.model_name,
            temperature=data.temperature,
            max_tokens=data.max_tokens,
            thinking=data.thinking,
            rag_enabled=data.rag_enabled,
            selected_website_ids=data.selected_website_ids,
        )

        db.add(configuration)

    db.commit()
    db.refresh(configuration)

    return configuration


# ===========================
# CONVERSATIONS
# ===========================

def get_conversation_by_session(
    db: Session,
    session_id: str
):
    return (
        db.query(Conversation)
        .filter(
            Conversation.session_id == session_id
        )
        .first()
    )


def create_conversation(
    db: Session,
    session_id: str,
    admin_id: int
):

    conversation = Conversation(
        session_id=session_id,
        admin_id=admin_id
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def create_new_conversation(
    db: Session,
    admin_id: int
):

    import uuid

    session_id = str(uuid.uuid4())

    conversation = Conversation(
        session_id=session_id,
        admin_id=admin_id
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def save_message(
    db: Session,
    conversation_id: int,
    role: str,
    content: str,
    response_time_ms: float = None
):

    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        response_time_ms=response_time_ms
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


def get_messages(
    db: Session,
    conversation_id: int
):
    return (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id
        )
        .order_by(Message.created_at)
        .all()
    )


def get_all_conversations(
    db: Session,
    admin_id: int
):
    return (
        db.query(Conversation)
        .filter(
            Conversation.admin_id == admin_id
        )
        .order_by(Conversation.created_at.desc())
        .all()
    )


def get_conversation_messages(
    db: Session,
    session_id: str
):

    conversation = get_conversation_by_session(
        db,
        session_id
    )

    if conversation is None:
        return None

    return (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation.id
        )
        .order_by(Message.created_at)
        .all()
    )


def delete_conversation_by_session(
    db: Session,
    session_id: str
):

    conversation = get_conversation_by_session(
        db,
        session_id
    )

    if conversation is None:
        return False

    db.delete(conversation)
    db.commit()

    return True


def update_conversation_title(
    db: Session,
    conversation_id: int,
    title: str
):

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id
        )
        .first()
    )

    if conversation:

        conversation.title = title

        db.commit()
        db.refresh(conversation)

    return conversation


def get_website_content(
    db,
    admin_id: int,
    website_url: str
):
    return (
        db.query(WebsiteContent)
        .filter(
            WebsiteContent.admin_id == admin_id,
            WebsiteContent.website_url == website_url
        )
        .first()
    )


def save_website_content(
    db,
    admin_id: int,
    website_url: str,
    content: str,
):
    website = get_website_content(
        db,
        admin_id,
        website_url
    )

    if website:
        # Website already exists → update only the content
        website.content = content
    else:
        # New website → insert a new row
        website = WebsiteContent(
            admin_id=admin_id,
            website_url=website_url,
            content=content,
        )
        db.add(website)

    db.commit()
    db.refresh(website)

    return website


# ===========================
# KNOWLEDGE BASE (WebsiteContent)
# ===========================

def get_all_website_contents(db, admin_id: int):
    """
    Return all WebsiteContent rows for an admin (metadata only query is fine;
    SQLAlchemy loads the full row but the router projects only id + website_url).
    """
    return (
        db.query(WebsiteContent)
        .filter(WebsiteContent.admin_id == admin_id)
        .order_by(WebsiteContent.id)
        .all()
    )


def get_website_content_by_id(db, website_content_id: int, admin_id: int):
    """
    Fetch a single WebsiteContent row by its primary key,
    scoped to the given admin so admins cannot access each other's data.
    """
    return (
        db.query(WebsiteContent)
        .filter(
            WebsiteContent.id == website_content_id,
            WebsiteContent.admin_id == admin_id,
        )
        .first()
    )

def delete_website_chunks(db: Session, website_content_id: int):
    db.query(WebsiteChunk).filter(WebsiteChunk.website_content_id == website_content_id).delete()
    db.commit()

def save_website_chunks(db: Session, website_content_id: int, chunks: list[str]):
    objects = []
    for i, chunk_text in enumerate(chunks):
        objects.append(
            WebsiteChunk(
                website_content_id=website_content_id,
                chunk_index=i,
                chunk_text=chunk_text,
                chunk_size=len(chunk_text)
            )
        )
    db.bulk_save_objects(objects)
    db.commit()


# ===========================
# DASHBOARD ANALYTICS
# ===========================

def get_dashboard_stats(db: Session, admin_id: int, days: int = 7):
    # 1. Total conversations for current user
    total_conversations = (
        db.query(func.count(Conversation.id))
        .filter(Conversation.admin_id == admin_id)
        .scalar() or 0
    )

    # 2. Total messages for current user's conversations
    total_messages = (
        db.query(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .filter(Conversation.admin_id == admin_id)
        .scalar() or 0
    )

    # 3. Average response time (seconds) for assistant messages
    avg_ms = (
        db.query(func.avg(Message.response_time_ms))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .filter(
            Conversation.admin_id == admin_id,
            Message.role == "model",
            Message.response_time_ms.isnot(None)
        )
        .scalar()
    )
    average_response_time = round(float(avg_ms) / 1000.0, 2) if avg_ms is not None else None

    # 4. Knowledge documents count (indexed WebsiteContent rows)
    knowledge_documents = (
        db.query(func.count(WebsiteContent.id))
        .filter(WebsiteContent.admin_id == admin_id)
        .scalar() or 0
    )

    # 5. Recent conversations (top 5 by created_at desc)
    recent_conv_rows = (
        db.query(Conversation)
        .filter(Conversation.admin_id == admin_id)
        .order_by(Conversation.created_at.desc())
        .limit(5)
        .all()
    )

    recent_conversations = []
    for conv in recent_conv_rows:
        msg_count = (
            db.query(func.count(Message.id))
            .filter(Message.conversation_id == conv.id)
            .scalar() or 0
        )
        recent_conversations.append({
            "id": conv.id,
            "session_id": conv.session_id,
            "title": conv.title or "Untitled Chat",
            "message_count": msg_count,
            "created_at": conv.created_at.isoformat() if conv.created_at else None
        })

    # 6. Messages over time (past N days including today)
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days - 1)

    daily_counts_raw = (
        db.query(
            func.date(Message.created_at).label("msg_date"),
            func.count(Message.id).label("count")
        )
        .join(Conversation, Message.conversation_id == Conversation.id)
        .filter(
            Conversation.admin_id == admin_id,
            func.date(Message.created_at) >= start_date
        )
        .group_by(func.date(Message.created_at))
        .all()
    )

    counts_by_date = {}
    for d, count in daily_counts_raw:
        counts_by_date[str(d)] = count

    messages_over_time = []
    current_d = start_date
    while current_d <= today:
        d_str = current_d.strftime("%Y-%m-%d")
        label_str = current_d.strftime("%b %d")
        messages_over_time.append({
            "date": d_str,
            "label": label_str,
            "message_count": counts_by_date.get(d_str, 0)
        })
        current_d += timedelta(days=1)

    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "average_response_time_seconds": average_response_time,
        "knowledge_documents": knowledge_documents,
        "recent_conversations": recent_conversations,
        "messages_over_time": messages_over_time
    }