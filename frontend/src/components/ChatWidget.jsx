import React, { useState } from "react";
import FloatingChatButton from "./FloatingChatButton";
import ChatWindow from "./ChatWindow";
import { widgetApi } from "../services/widgetApi";

export default function ChatWidget({ agentId = 1, botName = "AI Assistant" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);



  const ensureSession = async () => {
    if (sessionId) return sessionId;

    try {
      const data = await widgetApi.startConversation(agentId);
      const newSessionId = data.session_id;
      setSessionId(newSessionId);
      return newSessionId;
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError("Unable to connect to AI Assistant. Please try again.");
      throw err;
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSessionId(null);
    setMessages([]);
    setIsTyping(false);
    setError(null);
  };

  const handleSendMessage = async (text) => {
    setError(null);

    // 1. Add User Message locally immediately
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Set Typing Indicator before first chunk
    setIsTyping(true);

    try {
      const activeSessionId = await ensureSession();

      let hasReceivedFirstChunk = false;

      // 3. Stream Response
      await widgetApi.streamChat(activeSessionId, text, (chunk) => {
        if (!hasReceivedFirstChunk) {
          hasReceivedFirstChunk = true;
          setIsTyping(false); // Hide typing indicator once chunks start arriving

          // Append empty model message to start accumulating text
          setMessages((prev) => [...prev, { role: "model", content: "" }]);
        }

        // Append chunk to the last (model) message
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === "model") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + chunk,
            };
          }
          return updated;
        });
      });
    } catch (err) {
      console.error("Error streaming chat:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <FloatingChatButton
        isOpen={isOpen}
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setIsOpen(true);
          }
        }}
      />

      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
        messages={messages}
        isTyping={isTyping}
        error={error}
        onSendMessage={handleSendMessage}
        botName={botName}
      />
    </>
  );
}
