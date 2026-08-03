from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    # SUPER_ADMIN or ADMIN
    role = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    configuration = relationship(
        "AgentConfiguration",
        back_populates="admin",
        uselist=False,
        cascade="all, delete-orphan"
    )

    conversations = relationship(
        "Conversation",
        back_populates="admin",
        cascade="all, delete-orphan"
    )


class AgentConfiguration(Base):
    __tablename__ = "agent_configurations"

    id = Column(Integer, primary_key=True, index=True)

    admin_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    website_url = Column(Text)

    system_prompt = Column(Text)

    model_name = Column(
        String,
        default="gemini-flash-latest"
    )

    temperature = Column(
        Float,
        default=0.7
    )

    max_tokens = Column(
        Integer,
        default=1024
    )

    thinking = Column(
        Boolean,
        default=False
    )

    admin = relationship(
        "User",
        back_populates="configuration"
    )


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)

    admin_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    session_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    title = Column(
        String,
        nullable=False,
        default="New Chat"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    admin = relationship(
        "User",
        back_populates="conversations"
    )

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.id"
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id"),
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )

    content = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    conversation = relationship(
        "Conversation",
        back_populates="messages"
    )

class WebsiteContent(Base):
    __tablename__ = "website_contents"

    id = Column(Integer, primary_key=True, index=True)

    admin_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    website_url = Column(
        Text,
        nullable=False
    )

    content = Column(
        Text,
        nullable=False
    )

    scraped_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    admin = relationship("User")