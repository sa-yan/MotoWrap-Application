// src/App.js

import React, { useContext } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RecordRideScreen } from './src/screens/RecordRideScreen';
import { RideHistoryScreen } from './src/screens/RideHistoryScreen';
import { RideMapScreen } from './src/screens/RideMapScreen';
import { theme } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const RideHistoryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="RideHistoryList" component={RideHistoryScreen} />
      <Stack.Screen name="RideMap" component={RideMapScreen} />
    </Stack.Navigator>
  );
};

const TabIcon = ({ icon, color, label }) => (
  <View style={{ alignItems: 'center', gap: 2 }}>
    <Text style={{ fontSize: 24 }}>{icon}</Text>
  </View>
);

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray400,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.white,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Record"
        component={RecordRideScreen}
        options={{
          tabBarLabel: 'Record Ride',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏍️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={RideHistoryStack}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📊</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: theme.colors.textSecondary, fontWeight: '500' }}>
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