import React, { useState, useRef } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSendMessage, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        flexShrink: 0,
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        disabled={disabled}
        style={{
          flex: 1,
          resize: 'none',
          background: 'rgba(255,255,255,0.05)',
          color: '#F1F5F9',
          fontSize: '13.5px',
          lineHeight: 1.55,
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '14px',
          padding: '10px 14px',
          maxHeight: '120px',
          outline: 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          opacity: disabled ? 0.5 : 1,
          fontFamily: 'inherit',
          backdropFilter: 'blur(8px)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(124,106,245,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,245,0.08)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
      />

      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send Message"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '13px',
          background: canSend ? 'linear-gradient(135deg, #7C6AF5, #9B8DF8)' : 'rgba(255,255,255,0.06)',
          border: 'none',
          color: canSend ? '#fff' : 'rgba(255,255,255,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canSend ? 'pointer' : 'not-allowed',
          flexShrink: 0,
          transition: 'all 160ms ease',
          boxShadow: canSend ? '0 4px 14px rgba(124,106,245,0.3)' : 'none',
        }}
        onMouseEnter={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <Send style={{ width: '15px', height: '15px' }} />
      </button>
    </form>
  );
}
