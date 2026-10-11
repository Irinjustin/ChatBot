import React, { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const QUICK_REPLIES = ['Admissions', 'Courses', 'Placements', 'Contact'];

export default function ChatMessages({ messages, isTyping, error, onSendMessage }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Welcome screen
  if (messages.length === 0 && !isTyping && !error) {
    return (
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        {/* Bot avatar */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(124,106,245,0.2), rgba(155,141,248,0.15))',
            border: '1px solid rgba(124,106,245,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            boxShadow: '0 8px 24px rgba(124,106,245,0.15)',
          }}
        >
          <Bot style={{ width: '26px', height: '26px', color: '#9B8DF8' }} />
        </div>

        <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#F1F5F9', textAlign: 'center' }}>
          AI Assistant
        </p>
        <p style={{ margin: '6px 0 28px', fontSize: '13px', color: 'rgba(255,255,255,0.38)', textAlign: 'center', lineHeight: 1.5 }}>
          How can I help you today?
        </p>

        {/* Quick reply chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {QUICK_REPLIES.map((label) => (
            <button
              key={label}
              onClick={() => onSendMessage(label)}
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                fontSize: '12.5px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.55)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F1F5F9';
                e.currentTarget.style.borderColor = 'rgba(124,106,245,0.45)';
                e.currentTarget.style.background = 'rgba(124,106,245,0.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        background: 'transparent',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}

      {isTyping && <TypingIndicator />}

      {error && (
        <div
          style={{
            padding: '10px 14px',
            margin: '8px 0',
            fontSize: '12px',
            color: '#F87171',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.18)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
