// src/screens/RecordRideScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, StatusBar, AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { OSMMap } from '../components/OSMMap';
import { rideAPI } from '../services/api';

// Haversine distance in meters between two {latitude, longitude} points
const haversineDistance = (p1, p2) => {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(p2.latitude - p1.latitude);
  const dLon = toRad(p2.longitude - p1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.latitude)) * Math.cos(toRad(p2.latitude)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Points worse than this are discarded (horizontal accuracy in meters)
const MAX_ACCURACY_METERS = 25;
// Points closer than this to the previous accepted point are discarded (jitter gate)
const MIN_DISTANCE_METERS = 5;
// Points implying a speed faster than this are discarded (GPS teleportation spike)
const MAX_SPEED_KMH = 250;

export const RecordRideScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [duration, setDuration] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  const locationSubscription = useRef(null);
  const durationInterval = useRef(null);
  const batchInterval = useRef(null);
  const mapRef = useRef(null);

  // Holds last accepted GPS point + its timestamp for speed-spike detection
  const lastAcceptedPoint = useRef(null);
  // Buffer holds points not yet sent to backend
  const pointBuffer = useRef([]);

  const locationAcquired = useRef(false);

  const initLocation = async () => {
    if (locationAcquired.current) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required.');
      return;
    }
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      Alert.alert('Location Services Off', 'Enable location services then return to the app.');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      locationAcquired.current = true;
      setUserLocation(loc.coords);
      setGpsAccuracy(loc.coords.accuracy);
    } catch (e) {
      console.log('Location error:', e.message);
    }
  };

  useEffect(() => {
    initLocation();
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') initLocation();
    });
    return () => {
      stopAllTracking();
      appStateSub.remove();
    };
  }, []);

  const stopAllTracking = () => {
    if (locationSubscription.current) locationSubscription.current.remove();
    if (durationInterval.current) clearInterval(durationInterval.current);
    if (batchInterval.current) clearInterval(batchInterval.current);
  };

  // Send buffered points to backend every 10 seconds
  const flushPointBuffer = async () => {
    if (pointBuffer.current.length === 0) return;
    const toSend = [...pointBuffer.current];
    pointBuffer.current = [];
    try {
      await rideAPI.addGpsPointsBatch(toSend);
    } catch (e) {
      console.log('Batch send failed, will retry next flush:', e.message);
      pointBuffer.current = [...toSend, ...pointBuffer.current];
    }
  };

  const startRide = async () => {
    setLoading(true);
    try {
      await rideAPI.startRide();
      setIsRecording(true);
      setRouteCoordinates([]);
      setDuration(0);
      setDistanceKm(0);
      setCurrentSpeedKmh(0);
      pointBuffer.current = [];
      lastAcceptedPoint.current = null;

      // Watch GPS location
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,       // 1s — tighter tracking at speed
          distanceInterval: 5,      // skip OS-level events for moves < 5m
        },
        (location) => {
          const { latitude, longitude, altitude, accuracy, speed } = location.coords;
          const timestamp = location.timestamp;

          // Always update accuracy display
          setGpsAccuracy(accuracy);

          // 1. Accuracy filter — discard low-confidence fixes
          if (accuracy !== null && accuracy > MAX_ACCURACY_METERS) return;

          // 2. Speed-spike filter — discard GPS teleportation glitches
          let segmentDistM = 0;
          if (lastAcceptedPoint.current) {
            segmentDistM = haversineDistance(lastAcceptedPoint.current, { latitude, longitude });
            const dtHours = (timestamp - lastAcceptedPoint.current.timestamp) / 3_600_000;
            if (dtHours > 0) {
              const impliedSpeedKmh = segmentDistM / 1000 / dtHours;
              if (impliedSpeedKmh > MAX_SPEED_KMH) return;
              // Update live speed display
              setCurrentSpeedKmh(Math.round(impliedSpeedKmh * 10) / 10);
            }

            // 3. Distance gate — belt-and-suspenders jitter guard
            if (segmentDistM < MIN_DISTANCE_METERS) return;

            // Accumulate distance
            setDistanceKm((prev) => Math.round((prev + segmentDistM / 1000) * 1000) / 1000);
          }

          lastAcceptedPoint.current = { latitude, longitude, timestamp };

          setUserLocation({ latitude, longitude });
          setRouteCoordinates((prev) => [...prev, { latitude, longitude }]);

          pointBuffer.current.push({
            latitude,
            longitude,
            altitude: altitude ?? null,
            accuracy: accuracy ?? null,
          });
        }
      );

      // Send batch every 10 seconds
      batchInterval.current = setInterval(flushPointBuffer, 10000);

      // Duration timer
      durationInterval.current = setInterval(() => setDuration((p) => p + 1), 1000);

    } catch (e) {
      Alert.alert('Error', 'Failed to start ride. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  const endRide = async () => {
    setLoading(true);
    try {
      // Stop tracking first
      stopAllTracking();

      // Flush any remaining buffered points before ending
      if (pointBuffer.current.length > 0) {
        try {
          await rideAPI.addGpsPointsBatch([...pointBuffer.current]);
          pointBuffer.current = [];
        } catch (e) {
          console.log('Final flush failed:', e.message);
          // Continue ending ride even if final flush fails
        }
      }

      // Show full route on map
      if (mapRef.current) {
        mapRef.current.injectJavaScript('showFullRoute(); true;');
      }

      // End the ride
      const response = await rideAPI.endRide();

      const dist = Math.round((response.data.distanceKm || 0) * 10) / 10;
      const mins = Math.floor((response.data.durationSeconds || 0) / 60);
      const speed = Math.round((response.data.averageSpeed || 0) * 10) / 10;

      Alert.alert(
        '🏍️ Ride Complete!',
        `Distance: ${dist} km\nDuration: ${mins} min\nAvg Speed: ${speed} km/h`,
        [{
          text: 'OK',
          onPress: () => {
            setIsRecording(false);
            setRouteCoordinates([]);
            setDuration(0);
            setDistanceKm(0);
            setCurrentSpeedKmh(0);
            if (userLocation && mapRef.current) {
              mapRef.current.injectJavaScript(
                `resetMap(${userLocation.latitude}, ${userLocation.longitude}); true;`
              );
            }
          }
        }]
      );
    } catch (e) {
      console.log('End ride error:', e);
      Alert.alert('Error', `Failed to end ride: ${e.message}`);
      setIsRecording(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {userLocation ? (
        <OSMMap
          ref={mapRef}
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          routeCoordinates={routeCoordinates}
          zoom={16}
        />
      ) : (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.placeholderText}>Acquiring GPS...</Text>
        </View>
      )}

      {/* Top stats bar */}
      <SafeAreaView style={styles.topOverlay}>
        <View style={styles.statsBar}>
          {/* Row 1: main ride metrics */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DURATION</Text>
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>
                {distanceKm >= 1
                  ? `${distanceKm.toFixed(2)} km`
                  : `${Math.round(distanceKm * 1000)} m`}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SPEED</Text>
              <Text style={styles.statValue}>{currentSpeedKmh.toFixed(1)} km/h</Text>
            </View>
          </View>

          {/* Thin separator */}
          <View style={styles.rowDivider} />

          {/* Row 2: GPS status */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>GPS ACCURACY</Text>
              <Text style={[
                styles.statValueSmall,
                gpsAccuracy === null ? styles.idle
                  : gpsAccuracy <= MAX_ACCURACY_METERS ? styles.goodAccuracy
                  : styles.badAccuracy,
              ]}>
                {gpsAccuracy === null ? '---' : `±${Math.round(gpsAccuracy)}m`}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>STATUS</Text>
              <Text style={[styles.statValueSmall, isRecording ? styles.recording : styles.idle]}>
                {isRecording ? '● REC' : '○ IDLE'}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom button */}
      <View style={styles.bottomContainer}>
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.rideButton, styles.startButton, (!userLocation || loading) && styles.disabled]}
            onPress={startRide}
            disabled={loading || !userLocation}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Text style={styles.buttonIcon}>🏍️</Text><Text style={styles.buttonText}>Start Ride</Text></>
            }
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.rideButton, styles.stopButton, loading && styles.disabled]}
            onPress={endRide}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Text style={styles.buttonIcon}>⏹️</Text><Text style={styles.buttonText}>End Ride</Text></>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  placeholderText: { color: '#64748b', marginTop: 14, fontSize: 14, letterSpacing: 1 },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  statsBar: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    marginHorizontal: 16, marginTop: 50,
    borderRadius: 14, paddingVertical: 10, paddingHorizontal: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statsRow: { flexDirection: 'row' },
  rowDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 9, letterSpacing: 1.2, marginBottom: 3 },
  statValue: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  statValueSmall: { color: '#f1f5f9', fontSize: 13, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 2 },
  recording: { color: '#ef4444' },
  idle: { color: '#64748b' },
  goodAccuracy: { color: '#22c55e' },
  badAccuracy: { color: '#f59e0b' },
  bottomContainer: { position: 'absolute', bottom: 36, left: 20, right: 20 },
  rideButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  startButton: { backgroundColor: '#16a34a' },
  stopButton: { backgroundColor: '#dc2626' },
  disabled: { opacity: 0.5 },
  buttonIcon: { fontSize: 20 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});