import React from "react";
import { MessageSquare, X } from "lucide-react";

export default function FloatingChatButton({ isOpen, onClick, unreadCount = 0 }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close Chat" : "Open Chat"}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-950/50 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 border border-indigo-400/20"
    >
      <div className="relative flex items-center justify-center">
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300 rotate-0 hover:rotate-90" />
        ) : (
          <MessageSquare className="w-6 h-6 transition-transform duration-300" />
        )}

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">
            {unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}
