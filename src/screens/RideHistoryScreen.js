// src/screens/RideHistoryScreen.js

import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RideCard } from '../components/RideCard';
import { useTheme } from '../context/ThemeContext';
import { rideAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';

const RideHistoryScreenComponent = ({ navigation }) => {
    const { colors } = useTheme();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const s = styles(colors);
    const hasLoadedOnce = useRef(false);

    useFocusEffect(
        useCallback(() => { fetchRides(); }, [])
    );

    const fetchRides = async () => {
        if (!hasLoadedOnce.current) setLoading(true);
        try {
            const response = await rideAPI.getAllRides();
            setRides(response.data);
        } catch (e) {
            Alert.alert('Error', getErrorMessage(e, 'Failed to fetch rides'));
        } finally {
            hasLoadedOnce.current = true;
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await rideAPI.getAllRides();
            setRides(response.data);
        } catch (e) {
            Alert.alert('Error', getErrorMessage(e, 'Failed to refresh rides'));
        } finally {
            setRefreshing(false);
        }
    };

    const totalDistance = Math.round(rides.reduce((sum, r) => sum + (r.distanceKm || 0), 0) * 10) / 10;
    const topSpeed = Math.round(Math.max(...rides.map(r => r.maxSpeed || 0), 0) * 10) / 10;

    if (loading) {
        return (
            <View style={s.centerContainer}>
                <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={s.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

            <View style={s.header}>
                <Text style={s.title}>Your Rides</Text>
                <View style={s.summaryRow}>
                    <View style={s.summaryStat}>
                        <Text style={s.summaryValue}>{rides.length}</Text>
                        <Text style={s.summaryLabel}>rides</Text>
                    </View>
                    <Text style={s.summaryDot}>·</Text>
                    <View style={s.summaryStat}>
                        <Text style={s.summaryValue}>{totalDistance}</Text>
                        <Text style={s.summaryLabel}> km</Text>
                    </View>
                    <Text style={s.summaryDot}>·</Text>
                    <View style={s.summaryStat}>
                        <Text style={[s.summaryValue, { color: colors.orange }]}>
                            {topSpeed > 0 ? topSpeed : '—'}
                        </Text>
                        <Text style={s.summaryLabel}> top km/h</Text>
                    </View>
                </View>
            </View>

            {rides.length === 0 ? (
                <View style={s.empty}>
                    <Text style={s.emptyEmoji}>🏍️</Text>
                    <Text style={s.emptyTitle}>No rides yet</Text>
                    <Text style={s.emptyBody}>Get out there and record your first one!</Text>
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
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = (c) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg },

    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: c.textPrimary,
        letterSpacing: -1,
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    summaryStat: { flexDirection: 'row', alignItems: 'baseline' },
    summaryValue: {
        fontSize: 18,
        fontWeight: '800',
        color: c.accent,
    },
    summaryLabel: {
        fontSize: 13,
        color: c.textSecondary,
        fontWeight: '500',
    },
    summaryDot: {
        fontSize: 14,
        color: c.textMuted,
        marginHorizontal: 10,
    },

    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyEmoji: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: c.textSecondary, marginBottom: 8 },
    emptyBody: { fontSize: 14, color: c.textMuted, textAlign: 'center', lineHeight: 22 },

    list: { paddingTop: 8, paddingBottom: 24 },
});

export const RideHistoryScreen = RideHistoryScreenComponent;
export default RideHistoryScreen;
