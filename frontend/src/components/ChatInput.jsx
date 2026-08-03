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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-slate-900 border-t border-slate-800 flex items-end gap-2 rounded-b-2xl"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 resize-none bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl px-3.5 py-2.5 max-h-32 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Send Message"
        className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:active:scale-100 shrink-0 shadow-md shadow-indigo-950/40"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
