// src/App.js

import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RecordRideScreen } from './src/screens/RecordRideScreen';
import { RideHistoryScreen } from './src/screens/RideHistoryScreen';
import { RideMapScreen } from './src/screens/RideMapScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const RideHistoryStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RideHistoryList" component={RideHistoryScreen} />
        <Stack.Screen name="RideMap" component={RideMapScreen} />
    </Stack.Navigator>
);

const AppTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#334155',
            tabBarStyle: {
                backgroundColor: '#0d0d14',
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.06)',
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
            name="Record"
            component={RecordRideScreen}
            options={{
                tabBarLabel: 'Record',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="navigate" color={color} size={22} />
                ),
            }}
        />
        <Tab.Screen
            name="History"
            component={RideHistoryStack}
            options={{
                tabBarLabel: 'History',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="time" color={color} size={22} />
                ),
            }}
        />
    </Tab.Navigator>
);

const RootNavigator = () => {
    const { token, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 16, fontSize: 15, color: '#475569', fontWeight: '600' }}>
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
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}
