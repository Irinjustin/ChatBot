from sqlalchemy.orm import Session

from models import Conversation, Message


def get_conversation_by_session(db: Session, session_id: str):
    return (
        db.query(Conversation)
        .filter(Conversation.session_id == session_id)
        .first()
    )


def create_conversation(db: Session, session_id: str):

    conversation = Conversation(
        session_id=session_id
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def create_new_conversation(db: Session):

    import uuid

    session_id = str(uuid.uuid4())

    conversation = Conversation(
        session_id=session_id
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


def get_messages(db: Session, conversation_id: int):
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .all()
    )


def get_all_conversations(db: Session):
    return (
        db.query(Conversation)
        .order_by(Conversation.created_at.desc())
        .all()
    )


def get_conversation_messages(db: Session, session_id: str):

    conversation = get_conversation_by_session(db, session_id)

    if conversation is None:
        return None

    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
        .all()
    )


def delete_conversation_by_session(db: Session, session_id: str):

    conversation = get_conversation_by_session(db, session_id)

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
        .filter(Conversation.id == conversation_id)
        .first()
    )

    if conversation:
        conversation.title = title
        db.commit()
        db.refresh(conversation)

    return conversation