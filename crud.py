from sqlalchemy.orm import Session

from models import User, AgentConfiguration, Conversation, Message


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
    else:

        configuration = AgentConfiguration(
            admin_id=admin_id,
            website_url=data.website_url,
            system_prompt=data.system_prompt,
            model_name=data.model_name,
            temperature=data.temperature,
            max_tokens=data.max_tokens,
            thinking=data.thinking,
            rag_enabled=data.rag_enabled

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
    content: str
):

    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content
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

from models import WebsiteContent


def get_website_content(db, admin_id: int):
    return (
        db.query(WebsiteContent)
        .filter(WebsiteContent.admin_id == admin_id)
        .first()
    )


def save_website_content(
    db,
    admin_id: int,
    website_url: str,
    content: str,
):
    website = get_website_content(db, admin_id)

    if website:
        website.website_url = website_url
        website.content = content
    else:
        website = WebsiteContent(
            admin_id=admin_id,
            website_url=website_url,
            content=content,
        )
        db.add(website)

    db.commit()
    db.refresh(website)

    return website

