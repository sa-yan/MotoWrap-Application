// src/screens/RideHistoryScreen.js

import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { RideCard } from '../components/RideCard';
import { rideAPI } from '../services/api';

const RideHistoryScreenComponent = ({ navigation }) => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchRides(); }, []);

    const fetchRides = async () => {
        setLoading(true);
        try {
            const response = await rideAPI.getAllRides();
            setRides(response.data);
        } catch {
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
        } catch {
            Alert.alert('Error', 'Failed to refresh rides');
        } finally {
            setRefreshing(false);
        }
    };

    const totalDistance = Math.round(
        rides.reduce((sum, r) => sum + (r.distanceKm || 0), 0) * 10
    ) / 10;

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

            <View style={styles.header}>
                <Text style={styles.title}>Your Rides</Text>
                <View style={styles.statsRow}>
                    <View style={styles.headerStat}>
                        <Text style={styles.headerStatValue}>{rides.length}</Text>
                        <Text style={styles.headerStatLabel}>Total Rides</Text>
                    </View>
                    <View style={styles.headerStatDivider} />
                    <View style={styles.headerStat}>
                        <Text style={styles.headerStatValue}>{totalDistance}</Text>
                        <Text style={styles.headerStatLabel}>Total km</Text>
                    </View>
                </View>
            </View>

            {rides.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🏍️</Text>
                    <Text style={styles.emptyTitle}>No rides yet</Text>
                    <Text style={styles.emptySubtext}>Hit the road and record your first ride</Text>
                </View>
            ) : (
                <FlatList
                    data={rides}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <RideCard
                            ride={item}
                            onPress={() => navigation.navigate('RideMap', { rideId: item.id })}
                        />
                    )}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0f' },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0f',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#f1f5f9',
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerStat: { alignItems: 'flex-start' },
    headerStatValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#3b82f6',
        lineHeight: 26,
    },
    headerStatLabel: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
        marginTop: 2,
    },
    headerStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.07)',
        marginHorizontal: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: { fontSize: 56, marginBottom: 16 },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#1e293b',
        textAlign: 'center',
        lineHeight: 20,
    },
    listContent: { paddingVertical: 12, paddingBottom: 24 },
});

export const RideHistoryScreen = RideHistoryScreenComponent;
export default RideHistoryScreen;
