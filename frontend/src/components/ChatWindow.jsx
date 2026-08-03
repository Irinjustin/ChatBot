import React from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  isOpen,
  onClose,
  messages,
  isTyping,
  error,
  onSendMessage,
  botName,
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden
      /* Responsive Sizing */
      bottom-0 right-0 w-full h-full sm:bottom-24 sm:right-6 sm:w-[380px] sm:h-[580px] sm:max-h-[80vh]
      animate-in fade-in slide-in-from-bottom-5`}
    >
      <ChatHeader botName={botName} onMinimize={onClose} />

      <ChatMessages messages={messages} isTyping={isTyping} error={error} />

      <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
    </div>
  );
}
