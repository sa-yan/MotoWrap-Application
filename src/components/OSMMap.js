// src/screens/OSMMap.js
// Free CartoDB Dark Matter tiles via WebView + Leaflet
// No API key. No signup. 100% free.

import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export const OSMMap = forwardRef(({
  latitude = 23.8103,
  longitude = 87.2804,
  routeCoordinates = [],
  zoom = 15, // Esri Dark Gray caps at z16
}, ref) => {
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
        html, body, #map { width: 100%; height: 100%; background: #0d0d14; }

        /* Hide Leaflet zoom control default style, restyle it */
        .leaflet-control-zoom a {
          background: rgba(15,23,42,0.85) !important;
          color: #94a3b8 !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(30,41,59,0.95) !important;
          color: #f1f5f9 !important;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.5) !important;
        }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.5) !important;
          color: #475569 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #64748b !important; }

        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 1; }
          70%  { transform: scale(2.8); opacity: 0; }
          100% { transform: scale(1);   opacity: 0; }
        }
        .pulse-ring {
          position: absolute;
          top: 50%; left: 50%;
          width: 14px; height: 14px;
          margin: -7px 0 0 -7px;
          border-radius: 50%;
          background: rgba(96,165,250,0.5);
          animation: pulse 1.8s ease-out infinite;
        }
        .pulse-dot {
          position: relative;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #60a5fa;
          border: 2.5px solid #fff;
          box-shadow: 0 0 0 2px rgba(96,165,250,0.4), 0 2px 8px rgba(0,0,0,0.5);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: true,
          attributionControl: true,
        }).setView([${latitude}, ${longitude}], ${zoom});

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
          maxZoom: 16,
        }).addTo(map);

        var routePoints = [${routeLatLons}];
        var glowLine = null;
        var coreLine = null;
        var startMarker = null;
        var endMarker = null;
        var posMarker = null;

        function drawRoute() {
          if (routePoints.length < 2) return;

          if (glowLine) map.removeLayer(glowLine);
          if (coreLine) map.removeLayer(coreLine);

          // Outer glow
          glowLine = L.polyline(routePoints, {
            color: '#3b82f6',
            weight: 10,
            opacity: 0.25,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          // Inner sharp line
          coreLine = L.polyline(routePoints, {
            color: '#60a5fa',
            weight: 3.5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          // Start marker
          if (startMarker) map.removeLayer(startMarker);
          startMarker = L.divIcon({
            html: '<div style="background:#22c55e;width:12px;height:12px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 6px rgba(34,197,94,0.7),0 2px 6px rgba(0,0,0,0.5)"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            className: '',
          });
          L.marker(routePoints[0], { icon: startMarker }).addTo(map);

          // End marker
          if (endMarker) map.removeLayer(endMarker);
          endMarker = L.divIcon({
            html: '<div style="background:#f43f5e;width:12px;height:12px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 6px rgba(244,63,94,0.7),0 2px 6px rgba(0,0,0,0.5)"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            className: '',
          });
          L.marker(routePoints[routePoints.length - 1], { icon: endMarker }).addTo(map);
        }

        function drawCurrentPos(lat, lon) {
          if (posMarker) map.removeLayer(posMarker);
          var icon = L.divIcon({
            html: '<div class="pulse-ring"></div><div class="pulse-dot"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
            className: '',
          });
          posMarker = L.marker([lat, lon], { icon: icon }).addTo(map);
        }

        // Exposed for injectJavaScript
        function showFullRoute() {
          if (routePoints.length >= 2) {
            drawRoute();
            map.fitBounds(L.polyline(routePoints).getBounds(), { padding: [40, 40] });
          }
        }

        function resetMap(lat, lon) {
          map.setView([lat, lon], ${zoom});
          drawCurrentPos(lat, lon);
        }

        // Initial render
        drawRoute();
        if (routePoints.length <= 1) {
          drawCurrentPos(${latitude}, ${longitude});
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={ref}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});
