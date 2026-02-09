import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import MapTab from "../../components/MapTab";
import { useRouter, useLocalSearchParams } from "expo-router";
import { usePlaces } from "@/context/PlacesContext";

export default function MapViewScreen() {
  const router = useRouter();
  const { places } = usePlaces();
  const { lat, lng } = useLocalSearchParams();

  if (!places || places.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>Aucun lieu à afficher sur la carte.</Text>
        <Button title="Retour" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapTab places={places} lat={lat ? parseFloat(lat as string) : undefined} lng={lng ? parseFloat(lng as string) : undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
