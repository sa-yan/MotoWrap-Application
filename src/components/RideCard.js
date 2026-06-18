// src/components/RideCard.js

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

export const RideCard = ({
    ride,
    onPress
}) => {
    // Format duration: 1800 seconds → "30 min"
    const formatDuration = (seconds) => {
        if (!seconds) return '0 min';
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes} min`;
    };

    // Format date: "2026-06-03T10:30:00" → "Jun 3, 10:30 AM"
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const avgSpeed = ride.averageSpeed ? Math.round(ride.averageSpeed * 10) / 10 : 0;
    const distance = ride.distanceKm ? Math.round(ride.distanceKm * 10) / 10 : 0;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🏍️</Text>
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.date}>{formatDate(ride.startTime)}</Text>
                    <Text style={styles.status}>{ride.status}</Text>
                </View>
            </View>

            <View style={styles.stats}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>📍 Distance</Text>
                    <Text style={styles.statValue}>{distance} km</Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>⏱️ Duration</Text>
                    <Text style={styles.statValue}>{formatDuration(ride.durationSeconds)}</Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>⚡ Avg Speed</Text>
                    <Text style={styles.statValue}>{avgSpeed} km/h</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    date: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    status: {
        fontSize: 12,
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2563eb',
    },
});

export default RideCard;