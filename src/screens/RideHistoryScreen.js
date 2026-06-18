// src/screens/RideHistoryScreen.js

import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { RideCard } from '../components/RideCard';
import { AuthContext } from '../context/AuthContext';
import { rideAPI } from '../services/api';
import { theme } from '../theme';

const RideHistoryScreenComponent = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        setLoading(true);
        try {
            const response = await rideAPI.getAllRides();
            setRides(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch rides');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await rideAPI.getAllRides();
            setRides(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to refresh rides');
        } finally {
            setRefreshing(false);
        }
    };

    const handleRidePress = (rideId) => {
        navigation.navigate('RideMap', { rideId });
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Rides</Text>
                <Text style={styles.subtitle}>{rides.length} total rides</Text>
            </View>

            {rides.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No rides yet</Text>
                    <Text style={styles.emptySubtext}>Start your first ride!</Text>
                </View>
            ) : (
                <FlatList
                    data={rides}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <RideCard
                            ride={item}
                            onPress={() => handleRidePress(item.id)}
                        />
                    )}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.textTertiary,
    },
    listContent: {
        paddingVertical: theme.spacing.md,
    },
});

export const RideHistoryScreen = RideHistoryScreenComponent;
export default RideHistoryScreen;