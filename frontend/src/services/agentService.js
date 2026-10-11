import axiosInstance from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

export const agentService = {
  // ─── Agent Configuration ───────────────────────────────────

  getConfig: async () => {
    const response = await axiosInstance.get(ENDPOINTS.AGENT.CONFIG);
    return response.data;
  },

  saveConfig: async (configData) => {
    const response = await axiosInstance.post(ENDPOINTS.AGENT.CONFIG, configData);
    return response.data;
  },

  testAgent: async (message) => {
    const response = await axiosInstance.post(ENDPOINTS.AGENT.TEST, { message });
    return response.data;
  },

  // ─── Knowledge Base ────────────────────────────────────────

  /** GET /agent/knowledge-base → [{ id, website_url }, ...] */
  getKnowledgeBase: async () => {
    const response = await axiosInstance.get(ENDPOINTS.AGENT.KNOWLEDGE_BASE);
    return response.data;
  },

  /**
   * POST /agent/knowledge-base  → scrape + save + index in one call.
   * Returns { id, website_url }.
   */
  addWebsite: async (websiteUrl) => {
    const response = await axiosInstance.post(ENDPOINTS.AGENT.KNOWLEDGE_BASE, {
      website_url: websiteUrl,
    });
    return response.data;
  },

  /**
   * POST /agent/sync-website  → re-scrape a specific URL.
   * Returns { message, website_url, pages_scraped, characters }.
   */
  syncWebsite: async (websiteUrl) => {
    const response = await axiosInstance.post(ENDPOINTS.AGENT.SYNC, {
      website_url: websiteUrl,
    });
    return response.data;
  },
};
