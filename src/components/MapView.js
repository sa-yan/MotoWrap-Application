import MapView, { Polyline, Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

export const MapViewComponent = ({ coordinates = [], userLocation = null }) => {
    console.log("Map coordinates:", coordinates.length);
    console.log("User location:", userLocation);
    return (
        <MapView
            style={styles.map}
            initialRegion={{
                latitude: userLocation?.latitude || 23.8103,
                longitude: userLocation?.longitude || 87.2804,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
        >
            {userLocation && (
                <Marker
                    coordinate={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                    }}
                    title="You"
                />
            )}

            {coordinates.length > 1 && (
                <Polyline
                    coordinates={coordinates}
                    strokeColor="#2563eb"
                    strokeWidth={3}
                />
            )}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
});

export default MapViewComponent;