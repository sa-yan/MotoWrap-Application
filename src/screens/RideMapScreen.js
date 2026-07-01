// src/screens/RideMapScreen.js

import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { OSMMap } from '../components/OSMMap';
import { useTheme } from '../context/ThemeContext';
import { rideAPI } from '../services/api';

export const RideMapScreen = ({ route, navigation }) => {
    const { rideId } = route.params;
    const { colors } = useTheme();
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [centerCoord, setCenterCoord] = useState({ latitude: 23.8103, longitude: 87.2804 });

    const s = styles(colors);

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

    const handleDelete = () => {
        Alert.alert(
            'Delete Ride',
            'This will permanently delete this ride and its route.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await rideAPI.deleteRide(rideId);
                            navigation.goBack();
                        } catch {
                            Alert.alert('Error', 'Failed to delete ride');
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
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
            <View style={s.centerContainer}>
                <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={s.loadingText}>Loading ride...</Text>
            </View>
        );
    }

    if (!ride) {
        return (
            <View style={s.centerContainer}>
                <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
                <Text style={s.errorText}>Ride not found</Text>
            </View>
        );
    }

    const coordinates = ride.route || [];
    const distance = Math.round((ride.distanceKm || 0) * 10) / 10;
    const avgSpeed = Math.round((ride.averageSpeed || 0) * 10) / 10;
    const maxSpeed = Math.round((ride.maxSpeed || 0) * 10) / 10;

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <OSMMap
                latitude={centerCoord.latitude}
                longitude={centerCoord.longitude}
                routeCoordinates={coordinates}
                zoom={14}
            />

            <View style={s.headerRow}>
                <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.headerBtnIcon}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.headerBtn} onPress={handleDelete} disabled={deleting}>
                    {deleting
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={s.headerBtnDeleteIcon}>✕</Text>
                    }
                </TouchableOpacity>
            </View>

            <View style={s.card}>
                <Text style={s.dateText}>{formatDate(ride.startTime)}</Text>

                <View style={s.statsRow}>
                    <View style={s.statCell}>
                        <Text style={s.statValue}>{distance}</Text>
                        <Text style={s.statUnit}>KM</Text>
                        <Text style={s.statLabel}>Distance</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statCell}>
                        <Text style={s.statValue}>{formatDuration(ride.durationSeconds)}</Text>
                        <Text style={s.statUnit}> </Text>
                        <Text style={s.statLabel}>Duration</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statCell}>
                        <Text style={s.statValue}>{avgSpeed}</Text>
                        <Text style={s.statUnit}>KM/H</Text>
                        <Text style={s.statLabel}>Avg Speed</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statCell}>
                        <Text style={[s.statValue, maxSpeed > 0 && s.maxSpeedValue]}>
                            {maxSpeed > 0 ? maxSpeed : '—'}
                        </Text>
                        <Text style={s.statUnit}>{maxSpeed > 0 ? 'KM/H' : ' '}</Text>
                        <Text style={s.statLabel}>Top Speed</Text>
                    </View>
                </View>

                <View style={s.dividerH} />
                <Text style={s.gpsPoints}>{coordinates.length} GPS points recorded</Text>
            </View>
        </View>
    );
};

const styles = (c) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg },
    loadingText: { marginTop: 12, color: c.textSecondary, fontSize: 14, fontWeight: '500' },
    errorText: { fontSize: 16, color: c.textSecondary, fontWeight: '500' },
    headerRow: {
        position: 'absolute',
        top: 52,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(15,15,23,0.75)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerBtnIcon: { fontSize: 26, color: '#fff', fontWeight: '300', lineHeight: 28 },
    headerBtnDeleteIcon: { fontSize: 16, color: '#ef4444', fontWeight: '700' },
    card: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: c.mapCardBg,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: c.borderStrong,
        elevation: 10,
        shadowColor: c.shadow,
        shadowOpacity: 0.5,
        shadowRadius: 16,
    },
    dateText: {
        fontSize: 11,
        fontWeight: '700',
        color: c.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 16,
    },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    statCell: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '800', color: c.textPrimary, lineHeight: 28 },
    statUnit: { fontSize: 10, fontWeight: '700', color: c.accent, letterSpacing: 0.5, marginTop: 2, marginBottom: 4 },
    statLabel: { fontSize: 11, fontWeight: '600', color: c.textSecondary, letterSpacing: 0.3 },
    statDivider: { width: 1, height: 44, backgroundColor: c.divider },
    maxSpeedValue: { color: c.orange },
    dividerH: { height: 1, backgroundColor: c.divider, marginBottom: 12 },
    gpsPoints: { fontSize: 12, color: c.textMuted, textAlign: 'center', fontWeight: '500' },
});
