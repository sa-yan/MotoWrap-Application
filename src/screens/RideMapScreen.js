// src/screens/RideMapScreen.js

import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { OSMMap } from '../components/OSMMap';
import { rideAPI } from '../services/api';

export const RideMapScreen = ({ route }) => {
    const { rideId } = route.params;
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [centerCoord, setCenterCoord] = useState({ latitude: 23.8103, longitude: 87.2804 });

    useEffect(() => { fetchRideDetail(); }, [rideId]);

    const fetchRideDetail = async () => {
        try {
            const response = await rideAPI.getRideDetail(rideId);
            const data = response.data;
            setRide(data);
            const coords = data.route || [];
            if (coords.length > 0) {
                const lats = coords.map(c => c.latitude);
                const lons = coords.map(c => c.longitude);
                setCenterCoord({
                    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
                    longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
                });
            }
        } catch {
            Alert.alert('Error', 'Failed to fetch ride details');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0m';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('en-IN', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading ride...</Text>
            </View>
        );
    }

    if (!ride) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
                <Text style={styles.errorText}>Ride not found</Text>
            </View>
        );
    }

    const coordinates = ride.route || [];
    const distance = Math.round((ride.distanceKm || 0) * 10) / 10;
    const avgSpeed = Math.round((ride.averageSpeed || 0) * 10) / 10;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <OSMMap
                latitude={centerCoord.latitude}
                longitude={centerCoord.longitude}
                routeCoordinates={coordinates}
                zoom={14}
            />

            <View style={styles.card}>
                <Text style={styles.dateText}>{formatDate(ride.startTime)}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statCell}>
                        <Text style={styles.statValue}>{distance}</Text>
                        <Text style={styles.statUnit}>KM</Text>
                        <Text style={styles.statLabel}>Distance</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCell}>
                        <Text style={styles.statValue}>{formatDuration(ride.durationSeconds)}</Text>
                        <Text style={styles.statUnit}> </Text>
                        <Text style={styles.statLabel}>Duration</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCell}>
                        <Text style={styles.statValue}>{avgSpeed}</Text>
                        <Text style={styles.statUnit}>KM/H</Text>
                        <Text style={styles.statLabel}>Avg Speed</Text>
                    </View>
                </View>

                <View style={styles.dividerH} />
                <Text style={styles.gpsPoints}>{coordinates.length} GPS points recorded</Text>
            </View>
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
    loadingText: {
        marginTop: 12,
        color: '#475569',
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
    },
    card: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: '#13131a',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 16,
    },
    dateText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statCell: { flex: 1, alignItems: 'center' },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#f1f5f9',
        lineHeight: 28,
    },
    statUnit: {
        fontSize: 10,
        fontWeight: '700',
        color: '#3b82f6',
        letterSpacing: 0.5,
        marginTop: 2,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
        letterSpacing: 0.3,
    },
    statDivider: {
        width: 1,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    dividerH: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginBottom: 12,
    },
    gpsPoints: {
        fontSize: 12,
        color: '#334155',
        textAlign: 'center',
        fontWeight: '500',
    },
});
