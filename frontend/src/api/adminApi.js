import api from './api';

// Dashboard/Analytics
export const getDashboardStats = () => api.get('/admin/dashboard');

// Users Management
export const getAllUsers = () => api.get('/admin/users');
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const toggleUserBlock = (id) => api.put(`/admin/users/${id}/block`);
export const updateUserRole = (id, isAdmin) => api.put(`/admin/users/${id}/role`, { isAdmin });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// Orders Management
export const getAllOrders = () => api.get('/admin/orders');
export const getOrderById = (id) => api.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status });

// Products Management
export const createProduct = (data) => api.post('/admin/products', data);
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const getProductsByCategory = (category) => api.get(`/admin/products/category/${category}`);

// Coupons Management
export const getAllCoupons = () => api.get('/admin/coupons');
export const createCoupon = (data) => api.post('/admin/coupons', data);
export const updateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data);
export const deleteCoupon = (id) => api.delete(`/admin/coupons/${id}`);

// Complaints Management
export const getAllComplaints = () => api.get('/admin/complaints');
export const getComplaintById = (id) => api.get(`/admin/complaints/${id}`);
export const updateComplaintStatus = (id, data) => api.put(`/admin/complaints/${id}/status`, data);

// Categories Management
export const getAllCategories = () => api.get('/admin/categories');
export const createCategory = (data) => api.post('/admin/categories', data);
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

