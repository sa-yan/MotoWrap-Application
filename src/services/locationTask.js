// src/services/locationTask.js
//
// Ride GPS tracking via a background task + Android foreground service.
// watchPositionAsync is foreground-only: Android suspends it seconds after
// the screen locks, killing tracking mid-ride. startLocationUpdatesAsync with
// a foregroundService keeps the process (and JS timers) alive for the whole
// ride, with the system notification Android requires.
//
// TaskManager.defineTask must run at module scope before the app finishes
// launching — this module is imported from index.js to guarantee that.

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

export const RIDE_LOCATION_TASK = 'motowrap-ride-location-task';

const listeners = new Set();

// Subscribe to location updates from the ride task. Returns an unsubscribe fn.
export const addLocationListener = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

TaskManager.defineTask(RIDE_LOCATION_TASK, ({ data, error }) => {
  if (error || !data?.locations) return;
  for (const location of data.locations) {
    listeners.forEach((cb) => {
      try {
        cb(location);
      } catch (e) {
        // one bad listener must not break delivery to the others
      }
    });
  }
});

export const startRideTracking = async () => {
  await Location.startLocationUpdatesAsync(RIDE_LOCATION_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000,
    // Must stay 0: a non-zero value makes the OS stop delivering updates
    // while stationary, which starves the auto-pause check.
    distanceInterval: 0,
    foregroundService: {
      notificationTitle: 'MotoWrap is recording your ride',
      notificationBody: 'GPS tracking is active. Tap to return to the app.',
      notificationColor: '#16a34a',
      killServiceOnDestroy: true,
    },
    // iOS equivalents (harmless on Android)
    activityType: Location.ActivityType.AutomotiveNavigation,
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: false,
  });
};

export const stopRideTracking = async () => {
  try {
    const started = await Location.hasStartedLocationUpdatesAsync(RIDE_LOCATION_TASK);
    if (started) await Location.stopLocationUpdatesAsync(RIDE_LOCATION_TASK);
  } catch (e) {
    // best-effort teardown — never block ride end on this
  }
};
