// src/context/AuthContext.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // Check if user is already logged in
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const savedToken = await AsyncStorage.getItem('token');
                const savedUser = await AsyncStorage.getItem('user');
                if (savedToken && savedUser) {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                }
            } catch (e) {
                console.log('Error checking login:', e);
            } finally {
                setLoading(false);
            }
        };
        checkLogin();
    }, []);

    const register = async (email, password, name) => {
        try {
            await authAPI.register(email, password, name);
            return await login(email, password);
        } catch (error) {
            console.log('REGISTER ERROR:', error);
            console.log('REGISTER RESPONSE:', error?.response?.data);
            throw error?.response?.data?.error || error?.message || 'Registration failed';
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);
            const { token, userId, name } = response.data;

            // Save token and user
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify({ userId, email, name }));

            setToken(token);
            setUser({ userId, email, name });
            return true;
        } catch (error) {
            throw error.response?.data?.error || 'Login failed';
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.log('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};