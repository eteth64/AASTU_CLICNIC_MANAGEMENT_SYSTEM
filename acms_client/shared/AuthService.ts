import axiosInstance from './axiosInstance';

export const login = (email: string, password: string) => {
  return axiosInstance.post('/auth/login', { email, password });
};

export const getMe = (token: string) => {
  return axiosInstance.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const changePassword = (token: string, currentPassword: string, newPassword: string) => {
  return axiosInstance.put(
    '/auth/change-password',
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const forgotPassword = (email: string) => {
  return axiosInstance.post('/auth/forgot-password', { email });
};

export const resetPassword = (token: string, newPassword: string) => {
  return axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
};
