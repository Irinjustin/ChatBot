const API_BASE_URL = "http://localhost:8000/widget";

export const widgetApi = {
  /**
   * Starts a new conversation for a given agent/admin ID.
   * @param {number} agentId
   * @returns {Promise<{session_id: string}>}
   */
  async startConversation(agentId = 1) {
    const response = await fetch(`${API_BASE_URL}/conversation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent_id: agentId }),
    });

    if (!response.ok) {
      throw new Error("Failed to start conversation.");
    }

    return await response.json();
  },

  /**
   * Fetches message history for an existing session_id.
   * @param {string} sessionId
   * @returns {Promise<Array<{role: string, content: string, created_at: string}>>}
   */
  async getMessages(sessionId) {
    const response = await fetch(`${API_BASE_URL}/conversation/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch messages.");
    }

    return await response.json();
  },

  /**
   * Sends a message and processes the streamed response via callback.
   * @param {string} sessionId
   * @param {string} message
   * @param {function(string): void} onChunk
   * @returns {Promise<void>}
   */
  async streamChat(sessionId, message, onChunk) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message.");
    }

    if (!response.body) {
      throw new Error("Response body is not readable.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        onChunk(chunk);
      }
    }
  },
};
