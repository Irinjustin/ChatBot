import React from "react";
import { MessageSquare, X } from "lucide-react";

export default function FloatingChatButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close Chat" : "Open Chat"}
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 50,
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7C6AF5, #9B8DF8)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 8px 28px rgba(124,106,245,0.35), 0 2px 8px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 180ms cubic-bezier(0.34,1.2,0.64,1), box-shadow 180ms ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.07)';
        e.currentTarget.style.boxShadow = '0 10px 32px rgba(124,106,245,0.45), 0 2px 8px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,106,245,0.35), 0 2px 8px rgba(0,0,0,0.4)';
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; }}
    >
      <div style={{ transition: 'transform 220ms ease', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', display: 'flex' }}>
        {isOpen
          ? <X style={{ width: '21px', height: '21px' }} />
          : <MessageSquare style={{ width: '21px', height: '21px' }} />
        }
      </div>
    </button>
  );
}
