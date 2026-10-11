from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Integer,
    String,
    Float,
    Boolean,
    ForeignKey,
    Text,
    DateTime,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    username: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False
    )

    password: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    # SUPER_ADMIN or ADMIN
    role: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    configuration: Mapped[AgentConfiguration | None] = relationship(
        "AgentConfiguration",
        back_populates="admin",
        uselist=False,
        cascade="all, delete-orphan"
    )

    conversations: Mapped[list[Conversation]] = relationship(
        "Conversation",
        back_populates="admin",
        cascade="all, delete-orphan"
    )


class AgentConfiguration(Base):
    __tablename__ = "agent_configurations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    admin_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    website_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # List of WebsiteContent IDs selected as RAG sources
    selected_website_ids: Mapped[list[int] | None] = mapped_column(
        JSON,
        nullable=True,
        default=list
    )

    system_prompt: Mapped[str | None] = mapped_column(
        Text
    )

    model_name: Mapped[str | None] = mapped_column(
        String,
        default="gemini-flash-latest"
    )

    temperature: Mapped[float | None] = mapped_column(
        Float,
        default=0.7
    )

    max_tokens: Mapped[int | None] = mapped_column(
        Integer,
        default=1024
    )

    thinking: Mapped[bool | None] = mapped_column(
        Boolean,
        default=False
    )

    rag_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    admin: Mapped[User] = relationship(
        "User",
        back_populates="configuration"
    )


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    admin_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    session_id: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="New Chat"
    )

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    admin: Mapped[User] = relationship(
        "User",
        back_populates="conversations"
    )

    messages: Mapped[list[Message]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.id"
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    conversation_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("conversations.id"),
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    response_time_ms: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    conversation: Mapped[Conversation] = relationship(
        "Conversation",
        back_populates="messages"
    )


class WebsiteContent(Base):
    __tablename__ = "website_contents"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    admin_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    website_url: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    scraped_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    admin: Mapped[User] = relationship(
        "User"
    )

    chunks: Mapped[list[WebsiteChunk]] = relationship(
        "WebsiteChunk",
        back_populates="website_content",
        cascade="all, delete-orphan"
    )


class WebsiteChunk(Base):
    __tablename__ = "website_chunks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    website_content_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "website_contents.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    chunk_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    chunk_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    website_content: Mapped[WebsiteContent] = relationship(
        "WebsiteContent",
        back_populates="chunks"
    )