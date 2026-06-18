// src/services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://motowrap-backend-1.onrender.com/api'; // change to your backend URL

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

export const authAPI = {
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
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
};

export default api;