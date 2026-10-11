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
    <>
      <style>{`
        .chat-window {
          position: fixed;
          z-index: 49;
          display: flex;
          flex-direction: column;
          background: rgba(16,14,23,0.88);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 28px 72px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.07) inset;
          overflow: hidden;
          animation: chatWindowIn 240ms cubic-bezier(0.34,1.1,0.64,1) both;
          bottom: 0; right: 0;
          width: 100%; height: 100%;
          border-radius: 0;
        }
        @media (min-width: 640px) {
          .chat-window {
            bottom: 94px;
            right: 28px;
            width: 390px;
            height: 580px;
            max-height: 80vh;
            border-radius: 24px;
          }
        }
      `}</style>

      <div className="chat-window">
        <ChatHeader botName={botName} onMinimize={onClose} />
        <ChatMessages messages={messages} isTyping={isTyping} error={error} onSendMessage={onSendMessage} />
        <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
      </div>
    </>
  );
}
