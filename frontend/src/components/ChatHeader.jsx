import React from "react";
import { Minus, Bot } from "lucide-react";

export default function ChatHeader({
  botName = "AI Assistant",
  isOnline = true,
  onMinimize,
}) {
  return (
    <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between rounded-t-2xl border-b border-slate-800 shadow-md select-none">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 shadow-inner">
            <Bot className="w-6 h-6 text-indigo-400" />
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-base leading-tight text-slate-100">{botName}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            Online
          </p>
        </div>
      </div>

      <button
        onClick={onMinimize}
        aria-label="Minimize Chat"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none"
      >
        <Minus className="w-5 h-5" />
      </button>
    </div>
  );
}
