// src/App.js

import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BikeFormScreen } from './src/screens/BikeFormScreen';
import { RecordRideScreen } from './src/screens/RecordRideScreen';
import { RideHistoryScreen } from './src/screens/RideHistoryScreen';
import { RideMapScreen } from './src/screens/RideMapScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DashboardHome" component={DashboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="BikeForm" component={BikeFormScreen} />
    </Stack.Navigator>
);

const RideHistoryStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RideHistoryList" component={RideHistoryScreen} />
        <Stack.Screen name="RideMap" component={RideMapScreen} />
    </Stack.Navigator>
);

const AppTabs = () => {
    const { colors } = useTheme();
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.bgTabBar,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: 64,
                    paddingBottom: 10,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.3,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardStack}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" color={color} size={22} />
                    ),
                }}
            />
            <Tab.Screen
                name="Record"
                component={RecordRideScreen}
                options={{
                    tabBarLabel: 'Record',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="navigate" color={color} size={22} />
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={RideHistoryStack}
                options={{
                    tabBarLabel: 'History',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="time" color={color} size={22} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const RootNavigator = () => {
    const { token, loading } = useContext(AuthContext);
    const { colors } = useTheme();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={{ marginTop: 16, fontSize: 15, color: colors.textSecondary, fontWeight: '600' }}>
                    Loading...
                </Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {token ? (
                <AppTabs />
            ) : (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <RootNavigator />
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
