// src/screens/RideMapScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { OSMMap } from '../components/OSMMap';
import { rideAPI } from '../services/api';
import { theme } from '../theme';

export const RideMapScreen = ({ route }) => {
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [centerCoord, setCenterCoord] = useState({ latitude: 23.8103, longitude: 87.2804 });

  useEffect(() => {
    fetchRideDetail();
  }, [rideId]);

  const fetchRideDetail = async () => {
    try {
      const response = await rideAPI.getRideDetail(rideId);
      const data = response.data;
      setRide(data);

      const coords = data.route || [];
      if (coords.length > 0) {
        const lats = coords.map((c) => c.latitude);
        const lons = coords.map((c) => c.longitude);
        setCenterCoord({
          latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
          longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch ride details');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading ride...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ride not found</Text>
      </View>
    );
  }

  const coordinates = ride.route || [];
  const distance = Math.round((ride.distanceKm || 0) * 10) / 10;
  const avgSpeed = Math.round((ride.averageSpeed || 0) * 10) / 10;

  return (
    <View style={styles.container}>
      <OSMMap
        latitude={centerCoord.latitude}
        longitude={centerCoord.longitude}
        routeCoordinates={coordinates}
        zoom={14}
      />

      <View style={styles.detailsCard}>
        <Text style={styles.date}>{formatDate(ride.startTime)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distance} km</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatDuration(ride.durationSeconds)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg Speed</Text>
            <Text style={styles.statValue}>{avgSpeed} km/h</Text>
          </View>
        </View>
        <Text style={styles.gpsPoints}>{coordinates.length} GPS points recorded</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: { 
    marginTop: theme.spacing.md, 
    color: theme.colors.textSecondary, 
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: { 
    fontSize: 16, 
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailsCard: {
    position: 'absolute',
    bottom: 20, 
    left: theme.spacing.lg, 
    right: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  date: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: theme.colors.textSecondary, 
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statItem: { 
    flex: 1, 
    alignItems: 'center',
  },
  statLabel: { 
    fontSize: 11, 
    color: theme.colors.textTertiary, 
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: theme.colors.primary,
  },
  divider: { 
    width: 1, 
    height: 30, 
    backgroundColor: theme.colors.border,
  },
  gpsPoints: { 
    fontSize: 12, 
    color: theme.colors.textTertiary, 
    textAlign: 'center',
    fontWeight: '500',
  },
});