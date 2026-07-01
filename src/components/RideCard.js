// src/components/RideCard.js

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const RideCard = ({ ride, onPress }) => {
    const { colors } = useTheme();
    const s = styles(colors);

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
    const maxSpeed = Math.round((ride.maxSpeed || 0) * 10) / 10;
    const distance = Math.round((ride.distanceKm || 0) * 10) / 10;
    const duration = formatDuration(ride.durationSeconds);

    return (
        <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.72}>
            <View style={s.accentBar} />
            <View style={s.content}>
                {/* Top row: date + badge */}
                <View style={s.topRow}>
                    <Text style={s.date}>{formatDate(ride.startTime)}</Text>
                    <View style={s.badge}>
                        <Text style={s.badgeText}>{ride.status ?? 'completed'}</Text>
                    </View>
                </View>

                {/* Hero: distance */}
                <View style={s.distanceRow}>
                    <Text style={s.distanceNumber}>{distance}</Text>
                    <Text style={s.distanceUnit}>km</Text>
                </View>

                {/* Info row: duration · avg · top */}
                <View style={s.infoRow}>
                    <Text style={s.infoText}>{duration}</Text>
                    <Text style={s.infoDot}>·</Text>
                    <Text style={s.infoText}>{avgSpeed} km/h avg</Text>
                    {maxSpeed > 0 && (
                        <>
                            <Text style={s.infoDot}>·</Text>
                            <Text style={[s.infoText, s.infoTopSpeed]}>
                                {maxSpeed} top
                            </Text>
                        </>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = (c) => StyleSheet.create({
    card: {
        backgroundColor: c.bgCard,
        borderRadius: 18,
        marginHorizontal: 16,
        marginVertical: 6,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: c.shadow,
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    accentBar: { width: 5, backgroundColor: c.accentDark },
    content: { flex: 1, paddingHorizontal: 16, paddingVertical: 14 },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    date: { fontSize: 12, fontWeight: '500', color: c.textSecondary },
    badge: {
        backgroundColor: c.accent + '18',
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: c.accent,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    distanceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
        gap: 4,
    },
    distanceNumber: {
        fontSize: 38,
        fontWeight: '900',
        color: c.textPrimary,
        letterSpacing: -1,
        lineHeight: 42,
    },
    distanceUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: c.textSecondary,
        marginBottom: 2,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    infoText: { fontSize: 13, color: c.textSecondary, fontWeight: '500' },
    infoDot: { fontSize: 13, color: c.textMuted },
    infoTopSpeed: { color: c.orange, fontWeight: '600' },
});

export default RideCard;
