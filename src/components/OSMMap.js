// src/components/OSMMap.js
// Free OpenStreetMap via WebView + Leaflet
// No API key. No CC. No signup. 100% free forever.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export const OSMMap = ({
  latitude = 23.8103,
  longitude = 87.2804,
  routeCoordinates = [],  // [{ latitude, longitude }, ...]
  zoom = 15,
}) => {
  // Build route as JS array string for Leaflet
  const routeLatLons = routeCoordinates
    .map((c) => `[${c.latitude}, ${c.longitude}]`)
    .join(',');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: true }).setView([${latitude}, ${longitude}], ${zoom});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Draw route if points exist
        var routePoints = [${routeLatLons}];
        if (routePoints.length >= 2) {
          var polyline = L.polyline(routePoints, {
            color: '#2563eb',
            weight: 4,
            opacity: 0.85
          }).addTo(map);

          // Fit map to show entire route
          map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

          // Green start marker
          var greenIcon = L.divIcon({
            html: '<div style="background:#16a34a;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>',
            iconSize: [14, 14],
            className: ''
          });
          L.marker(routePoints[0], { icon: greenIcon })
            .bindPopup('Start')
            .addTo(map);

          // Red end marker
          var redIcon = L.divIcon({
            html: '<div style="background:#dc2626;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>',
            iconSize: [14, 14],
            className: ''
          });
          L.marker(routePoints[routePoints.length - 1], { icon: redIcon })
            .bindPopup('End')
            .addTo(map);
        }

        // Blue dot for current user position (single point / live tracking)
        if (routePoints.length === 0 || routePoints.length === 1) {
          var blueIcon = L.divIcon({
            html: '<div style="background:#2563eb;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(37,99,235,0.6)"></div>',
            iconSize: [14, 14],
            className: ''
          });
          L.marker([${latitude}, ${longitude}], { icon: blueIcon })
            .addTo(map);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});