import axiosInstance from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

export const dashboardService = {
  getStats: async (days = 7) => {
    const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.STATS, {
      params: { days }
    });
    return response.data;
  }
};
