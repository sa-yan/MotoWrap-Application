// src/context/ThemeContext.js

import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme';

export const darkColors = {
    bg: '#0f0f17',
    bgCard: '#1c1c2a',
    bgInput: '#151520',
    bgTabBar: '#0f0f17',
    textPrimary: '#eeeef8',
    textSecondary: '#8888aa',
    textMuted: '#5e5e80',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,255,255,0.16)',
    divider: 'rgba(255,255,255,0.09)',
    accent: '#60a5fa',
    accentDark: '#3b82f6',
    orange: '#fb923c',
    placeholder: '#4a4a6a',
    statusBar: 'light-content',
    shadow: '#000',
    statsBarBg: 'rgba(15,15,23,0.92)',
    mapCardBg: '#1c1c2a',
};

export const lightColors = {
    bg: '#f4f4f8',
    bgCard: '#ffffff',
    bgInput: '#ededf5',
    bgTabBar: '#ffffff',
    textPrimary: '#18182e',
    textSecondary: '#5a5a78',
    textMuted: '#9090b0',
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.12)',
    divider: 'rgba(0,0,0,0.07)',
    accent: '#3b82f6',
    accentDark: '#2563eb',
    orange: '#f97316',
    placeholder: '#acacbc',
    statusBar: 'dark-content',
    shadow: '#8888aa',
    statsBarBg: 'rgba(244,244,248,0.93)',
    mapCardBg: '#ffffff',
};

const ThemeContext = createContext({
    isDark: true,
    colors: darkColors,
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem(THEME_KEY).then((val) => {
            if (val === 'light') setIsDark(false);
        });
    }, []);

    const toggleTheme = async () => {
        const next = !isDark;
        setIsDark(next);
        await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
