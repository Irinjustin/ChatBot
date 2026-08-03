import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatMessages({ messages, isTyping, error }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-slate-950/95 space-y-2">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 my-auto">
          <p className="text-sm">👋 Hi there! How can I help you today?</p>
        </div>
      )}

      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}

      {isTyping && <TypingIndicator />}

      {error && (
        <div className="p-3 my-2 text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded-xl text-center">
          {error}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
