import React from "react";
import { Bot } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        marginBottom: '8px',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'fadeUp 200ms ease both',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(124,106,245,0.2), rgba(155,141,248,0.15))',
            border: '1px solid rgba(124,106,245,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginBottom: '2px',
          }}
        >
          <Bot style={{ width: '13px', height: '13px', color: '#9B8DF8' }} />
        </div>
      )}

      <div
        style={{
          maxWidth: '78%',
          padding: '11px 15px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          fontSize: '13.5px',
          lineHeight: 1.55,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          ...(isUser
            ? {
                background: 'linear-gradient(135deg, #7C6AF5, #9B8DF8)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(124,106,245,0.28)',
              }
            : {
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: '#E2E8F0',
                backdropFilter: 'blur(8px)',
              }
          ),
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
