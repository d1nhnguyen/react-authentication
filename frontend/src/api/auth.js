import axiosInstance from './axios';

export const authAPI = {
  signup: async (data) => {
    const response = await axiosInstance.post('/auth/signup', data);
    return response.data;
  },

  signin: async (data) => {
    const response = await axiosInstance.post('/auth/signin', data);
    return response.data;
  },

  signout: async () => {
    const response = await axiosInstance.post('/auth/signout');
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },
};