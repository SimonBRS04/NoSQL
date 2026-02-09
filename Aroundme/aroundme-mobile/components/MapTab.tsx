import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

type MapTabProps = {
  places: any[];
  lat?: number;
  lng?: number;
};

export default function MapTab({ places, lat, lng }: MapTabProps) {
  const mapRef = useRef<MapView>(null);

  // Centre par défaut sur Paris si pas de lieu
  const initialRegion = {
    latitude: lat || 48.8566,
    longitude: lng || 2.3522,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    // Si lat/lng sont fournis, centrer la map dessus
    if (lat && lng && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  }, [lat, lng]);

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
        {places.map((place, index) => {
          const coords = place.geometry?.coordinates || [];
          if (coords.length !== 2) return null;

          return (
            <Marker
              key={index}
              coordinate={{ latitude: coords[1], longitude: coords[0] }}
              title={place.properties?.name || "Sans nom"}
              description={place.properties?.amenity || place.properties?.shop || ""}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
