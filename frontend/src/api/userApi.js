import api from './api';

// Get user profile
export const getProfile = () => api.get('/users/me');

// Update user profile
export const updateProfile = (data) => api.put('/users/me', data);

// Update user password
export const updatePassword = (currentPassword, newPassword) => 
  api.put('/users/me/password', { currentPassword, newPassword });

// Delete user account
export const deleteAccount = () => api.delete('/users/me');



