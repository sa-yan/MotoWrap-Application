// src/services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://motowrap-backend-1.onrender.com/api'; // production
// const API_URL = 'http://10.39.35.40:8080/api'; // dev — replace with your PC's local IP

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // increased to 30 seconds
});

// Add token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Callback registered by AuthContext so the UI can react to a forced logout.
let onUnauthorized = null;
export const setOnUnauthorized = (cb) => {
  onUnauthorized = cb;
};

// On 401/403, clear stored credentials so AuthContext redirects to login.
// Auth endpoints are skipped — a wrong password must not log anyone out.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  deleteAccount: () => api.delete('/users/me'),
};

export const bikeAPI = {
  getBikes: () => api.get('/bikes'),
  createBike: (data) => api.post('/bikes', data),
  updateBike: (id, data) => api.put(`/bikes/${id}`, data),
  deleteBike: (id) => api.delete(`/bikes/${id}`),
  setDefault: (id) => api.put(`/bikes/${id}/default`),
};

export const rideAPI = {
  startRide: () =>
    api.post('/rides/start'),

  endRide: () =>
    api.post('/rides/end', {}, { timeout: 60000 }), // 60 sec timeout for end ride

  // Single GPS point (kept for compatibility)
  addGpsPoint: (latitude, longitude, altitude, accuracy) =>
    api.post('/rides/gps', { latitude, longitude, altitude, accuracy }),

  // Batch GPS points — send array at once
  addGpsPointsBatch: (points) =>
    api.post('/rides/gps/batch', points, { timeout: 30000 }),

  getAllRides: () =>
    api.get('/rides'),

  getRideDetail: (rideId) =>
    api.get(`/rides/${rideId}`),

  deleteRide: (rideId) =>
    api.delete(`/rides/${rideId}`),

  getStats: () =>
    api.get('/rides/stats'),
};

export default api;