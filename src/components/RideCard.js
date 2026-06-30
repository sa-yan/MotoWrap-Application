// src/components/RideCard.js

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const RideCard = ({ ride, onPress }) => {
    const formatDuration = (seconds) => {
        if (!seconds) return '0m';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const avgSpeed = Math.round((ride.averageSpeed || 0) * 10) / 10;
    const distance = Math.round((ride.distanceKm || 0) * 10) / 10;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
            <View style={styles.accentBar} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.date}>{formatDate(ride.startTime)}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{ride.status || 'completed'}</Text>
                    </View>
                </View>

                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{distance}</Text>
                        <Text style={styles.statUnit}>KM</Text>
                        <Text style={styles.statLabel}>Distance</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{formatDuration(ride.durationSeconds)}</Text>
                        <Text style={styles.statUnit}> </Text>
                        <Text style={styles.statLabel}>Duration</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{avgSpeed}</Text>
                        <Text style={styles.statUnit}>KM/H</Text>
                        <Text style={styles.statLabel}>Avg Speed</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#13131a',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    accentBar: {
        width: 4,
        backgroundColor: '#2563eb',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    date: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94a3b8',
    },
    badge: {
        backgroundColor: 'rgba(37,99,235,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(37,99,235,0.2)',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#3b82f6',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#f1f5f9',
        lineHeight: 24,
    },
    statUnit: {
        fontSize: 10,
        fontWeight: '700',
        color: '#2563eb',
        letterSpacing: 0.4,
        marginTop: 1,
        marginBottom: 3,
    },
    statLabel: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
});

export default RideCard;
