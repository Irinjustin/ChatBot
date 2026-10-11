import React from "react";
import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        marginBottom: '8px',
        animation: 'fadeUp 200ms ease both',
      }}
    >
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
        }}
      >
        <Bot style={{ width: '13px', height: '13px', color: '#9B8DF8' }} />
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderRadius: '18px 18px 18px 4px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        {[0, 180, 360].map((delay) => (
          <span
            key={delay}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.35)',
              display: 'inline-block',
              animation: `dotBounce 1.1s ease ${delay}ms infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
