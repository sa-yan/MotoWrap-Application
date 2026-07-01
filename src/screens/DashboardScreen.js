// src/screens/DashboardScreen.js

import { useCallback, useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { rideAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';

const formatDuration = (seconds) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

export const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const { colors, isDark, toggleTheme } = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const s = styles(colors);

    const fetchStats = async () => {
        try {
            const response = await rideAPI.getStats();
            setStats(response.data);
        } catch (e) {
            Alert.alert('Error', getErrorMessage(e, 'Failed to load stats'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchStats(); }, []));

    const onRefresh = () => { setRefreshing(true); fetchStats(); };

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const totalKm = stats ? Math.round(stats.totalDistanceKm * 10) / 10 : 0;
    const avgSpeed = stats ? Math.round(stats.overallAvgSpeed * 10) / 10 : 0;
    const topSpeed = stats ? Math.round(stats.overallMaxSpeed * 10) / 10 : 0;

    return (
        <View style={s.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

            <ScrollView
                contentContainerStyle={s.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={s.header}>
                    <View style={s.headerLeft}>
                        <Text style={s.greeting}>{greeting()}</Text>
                        <Text style={s.name}>{user?.name ?? 'Rider'}</Text>
                    </View>
                    <View style={s.headerButtons}>
                        <TouchableOpacity style={s.iconBtn} onPress={toggleTheme} activeOpacity={0.7}>
                            <Text style={s.iconBtnText}>{isDark ? '☀️' : '🌙'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
                            <Text style={s.iconBtnText}>👤</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hero stats — no card border */}
                <View style={s.heroSection}>
                    {loading ? (
                        <View style={s.loadingBox}>
                            <ActivityIndicator color={colors.accent} size="large" />
                        </View>
                    ) : (
                        <>
                            {/* Big distance number */}
                            <View style={s.heroBlock}>
                                <Text style={s.heroNumber}>{totalKm}</Text>
                                <Text style={s.heroUnit}>km ridden</Text>
                            </View>

                            {/* Rides + time chips */}
                            <View style={s.chipsRow}>
                                <View style={s.chip}>
                                    <Text style={s.chipValue}>{stats?.totalRides ?? 0}</Text>
                                    <Text style={s.chipLabel}> rides</Text>
                                </View>
                                <View style={s.chipDot} />
                                <View style={s.chip}>
                                    <Text style={s.chipValue}>{formatDuration(stats?.totalDurationSeconds)}</Text>
                                    <Text style={s.chipLabel}> on road</Text>
                                </View>
                            </View>

                            {/* Speed cards */}
                            <View style={s.speedRow}>
                                <View style={s.speedCard}>
                                    <Text style={s.speedValue}>{avgSpeed}</Text>
                                    <Text style={s.speedUnit}>km/h</Text>
                                    <Text style={s.speedLabel}>Avg Speed</Text>
                                </View>
                                <View style={[s.speedCard, s.speedCardOrange]}>
                                    <Text style={[s.speedValue, s.speedValueOrange]}>{topSpeed > 0 ? topSpeed : '—'}</Text>
                                    <Text style={[s.speedUnit, s.speedUnitOrange]}>{topSpeed > 0 ? 'km/h' : ''}</Text>
                                    <Text style={[s.speedLabel, s.speedLabelOrange]}>Top Speed</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Quick actions — no outer card, just rows */}
                <View style={s.actionsSection}>
                    <TouchableOpacity style={s.actionRow} onPress={() => navigation.navigate('Record')} activeOpacity={0.75}>
                        <View style={[s.actionIconWrap, { backgroundColor: colors.accent + '18' }]}>
                            <Text style={s.actionEmoji}>🏍️</Text>
                        </View>
                        <View style={s.actionText}>
                            <Text style={s.actionTitle}>Start a Ride</Text>
                            <Text style={s.actionSub}>Record your next journey</Text>
                        </View>
                        <Text style={s.actionChevron}>›</Text>
                    </TouchableOpacity>

                    <View style={s.actionDivider} />

                    <TouchableOpacity style={s.actionRow} onPress={() => navigation.navigate('History')} activeOpacity={0.75}>
                        <View style={[s.actionIconWrap, { backgroundColor: colors.orange + '18' }]}>
                            <Text style={s.actionEmoji}>📋</Text>
                        </View>
                        <View style={s.actionText}>
                            <Text style={s.actionTitle}>Ride History</Text>
                            <Text style={s.actionSub}>View all past rides</Text>
                        </View>
                        <Text style={s.actionChevron}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.7}>
                    <Text style={s.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = (c) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingBottom: 48 },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 32,
    },
    headerLeft: { flex: 1 },
    greeting: { fontSize: 14, color: c.textSecondary, fontWeight: '500', marginBottom: 4 },
    name: { fontSize: 32, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.8 },
    headerButtons: { flexDirection: 'row', gap: 10 },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: c.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: c.border,
    },
    iconBtnText: { fontSize: 18 },

    // Hero stats
    heroSection: {
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    loadingBox: { paddingVertical: 60, alignItems: 'center' },
    heroBlock: { marginBottom: 16 },
    heroNumber: {
        fontSize: 64,
        fontWeight: '900',
        color: c.accent,
        letterSpacing: -2,
        lineHeight: 68,
    },
    heroUnit: {
        fontSize: 16,
        color: c.textSecondary,
        fontWeight: '500',
        marginTop: 2,
    },

    chipsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    chip: { flexDirection: 'row', alignItems: 'baseline' },
    chipValue: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    chipLabel: { fontSize: 13, color: c.textSecondary, fontWeight: '400' },
    chipDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: c.textMuted,
        marginHorizontal: 12,
    },

    speedRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    speedCard: {
        flex: 1,
        backgroundColor: c.bgCard,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: c.border,
    },
    speedCardOrange: {
        borderColor: c.orange + '33',
        backgroundColor: c.orange + '0e',
    },
    speedValue: {
        fontSize: 28,
        fontWeight: '800',
        color: c.accent,
        letterSpacing: -0.5,
    },
    speedValueOrange: { color: c.orange },
    speedUnit: {
        fontSize: 11,
        fontWeight: '600',
        color: c.accent,
        opacity: 0.7,
        marginTop: 1,
        marginBottom: 6,
    },
    speedUnitOrange: { color: c.orange },
    speedLabel: { fontSize: 12, color: c.textSecondary, fontWeight: '500' },
    speedLabelOrange: { color: c.orange + 'cc' },

    // Quick actions
    actionsSection: {
        marginHorizontal: 24,
        marginTop: 24,
        marginBottom: 16,
        backgroundColor: c.bgCard,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.border,
        overflow: 'hidden',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 14,
    },
    actionIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionEmoji: { fontSize: 22 },
    actionText: { flex: 1 },
    actionTitle: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    actionSub: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    actionChevron: { fontSize: 24, color: c.textMuted, fontWeight: '300' },
    actionDivider: { height: 1, backgroundColor: c.divider, marginHorizontal: 16 },

    // Logout
    logoutBtn: {
        marginHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.22)',
        alignItems: 'center',
    },
    logoutText: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
});

export default DashboardScreen;
