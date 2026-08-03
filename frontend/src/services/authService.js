import axiosInstance from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

export const authService = {
  login: async (email, password) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },
  
  register: async (username, email, password) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, {
      username,
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
