import React from "react";
import { Bot, User } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-end gap-2 my-2 transition-all duration-300 animate-fadeIn ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 mb-1">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80"
        }`}
      >
        {message.content}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mb-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
