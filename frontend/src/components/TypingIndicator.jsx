import React from "react";
import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 my-2 justify-start animate-fadeIn">
      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 mb-1">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-slate-800 border border-slate-700/80 text-slate-300 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
        <span className="text-xs font-medium mr-1 text-slate-400">AI is typing</span>
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
}
