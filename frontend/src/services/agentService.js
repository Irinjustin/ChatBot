import axiosInstance from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

export const agentService = {
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

  syncWebsite: async () => {
    const response = await axiosInstance.post(ENDPOINTS.AGENT.SYNC);
    return response.data;
  }
};
