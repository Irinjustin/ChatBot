import React from "react";
import { Minus, Bot } from "lucide-react";

export default function ChatHeader({ botName = "AI Assistant", isOnline = true, onMinimize }) {
  return (
    <div
      style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.2)',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Bot avatar */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(124,106,245,0.25), rgba(155,141,248,0.2))',
              border: '1px solid rgba(124,106,245,0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot style={{ width: '18px', height: '18px', color: '#9B8DF8' }} />
          </div>
          {/* Online dot */}
          <span
            style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: '#34D399',
              border: '2px solid rgba(8,10,16,0.9)',
            }}
          />
        </div>

        {/* Name + status */}
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#F1F5F9', lineHeight: 1.3 }}>
            {botName}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34D399', display: 'inline-block', animation: 'pulseGlow 2s ease infinite' }} />
            Online — typically replies instantly
          </p>
        </div>
      </div>

      {/* Minimize button */}
      <button
        onClick={onMinimize}
        aria-label="Minimize Chat"
        style={{
          padding: '7px',
          borderRadius: '10px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.28)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#F1F5F9'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <Minus style={{ width: '16px', height: '16px' }} />
      </button>
    </div>
  );
}
