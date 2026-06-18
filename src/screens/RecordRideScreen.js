// src/screens/RecordRideScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView, StatusBar,
} from 'react-native';
import * as Location from 'expo-location';
import { OSMMap } from '../components/OSMMap';
import { rideAPI } from '../services/api';

export const RecordRideScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  const locationSubscription = useRef(null);
  const durationInterval = useRef(null);
  const batchInterval = useRef(null);
  const mapRef = useRef(null);

  // Buffer holds points not yet sent to backend
  const pointBuffer = useRef([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation(loc.coords);
    })();
    return () => stopAllTracking();
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
    pointBuffer.current = []; // clear buffer immediately
    try {
      await rideAPI.addGpsPointsBatch(toSend);
    } catch (e) {
      console.log('Batch send failed, will retry next flush:', e.message);
      // Put points back in buffer to retry
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
      pointBuffer.current = [];

      // Watch GPS location
      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 0 },
        (location) => {
          const { latitude, longitude, altitude, accuracy } = location.coords;
          setUserLocation({ latitude, longitude });

          // Add to visual route
          setRouteCoordinates((prev) => [...prev, { latitude, longitude }]);

          // Add to send buffer
          pointBuffer.current.push({
            latitude,
            longitude,
            altitude: altitude || 0,
            accuracy: accuracy || 0,
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
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>GPS PTS</Text>
            <Text style={styles.statValue}>{routeCoordinates.length}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>STATUS</Text>
            <Text style={[styles.statValue, isRecording ? styles.recording : styles.idle]}>
              {isRecording ? '● REC' : '○ IDLE'}
            </Text>
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
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.82)',
    marginHorizontal: 16, marginTop: 50,
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 10, letterSpacing: 1.2, marginBottom: 4 },
  statValue: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  recording: { color: '#ef4444' },
  idle: { color: '#64748b' },
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