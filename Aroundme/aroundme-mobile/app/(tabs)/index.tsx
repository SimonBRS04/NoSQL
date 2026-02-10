import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { useState } from "react";
import { usePlaces } from "@/context/PlacesContext";
import { useRouter } from "expo-router";

const API_URL = "http://10.162.130.165:3000";

export default function HomeScreen() {
  const router = useRouter();
  // lat/lng simulés par l'utilisateur
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { places: contextPlaces, setPlaces: setGlobalPlaces } = usePlaces();

  // --- fetch API comme avant ---
  const fetchPlaces = async () => {
    setLoading(true);
    try {
      // Convertir les virgules en points pour les coordonnées
      const normalizedLat = lat.replace(",", ".");
      const normalizedLng = lng.replace(",", ".");
      const url = `${API_URL}/api/places/nearby?lat=${normalizedLat}&lng=${normalizedLng}&radius=1000&limit=20`;
      console.log("CALL API:", url);

      const res = await fetch(url);

      // 🔍 lire la réponse brute
      const text = await res.text();
      console.log("API RAW RESPONSE:", text);

      if (!res.ok) {
        throw new Error(text);
      }

      // 🧠 parse JSON manuellement
      const json = JSON.parse(text);

      // 🔑 selon ton backend
      const placesData = Array.isArray(json) ? json : json.data;

      setPlaces(placesData || []);
      setGlobalPlaces(placesData || []);

    } catch (err: any) {
      console.error(err);
      alert("Erreur API : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- simulation de géolocalisation PC ---
  const simulateMyLocation = () => {
    const simulatedLat = "48.8566";
    const simulatedLng = "2.3522";
    setLat(simulatedLat);
    setLng(simulatedLng);
  };

  return (
    <View style={styles.container}>
      <View style={{ height: 50 }} />

      <Text style={styles.title}>AroundMe</Text>

      <Text>Latitude :</Text>
      <TextInput
        style={styles.input}
        value={lat}
        onChangeText={setLat}
        keyboardType="numeric"
        placeholder="ex : 48.8566"
        placeholderTextColor="#999"
      />

      <Text>Longitude :</Text>
      <TextInput
        style={styles.input}
        value={lng}
        onChangeText={setLng}
        keyboardType="numeric"
        placeholder="ex : 2.3522"
        placeholderTextColor="#999"
      />

      <Button
        title="Exemple de position simulée (Paris)"
        onPress={simulateMyLocation}
        color="#6a5acd"
      />
      <View style={{ height: 8 }} />
      <Button
        title="Aroundme"
        onPress={() => fetchPlaces()}
        color="#2196F3"
      />
      <View style={{ height: 8 }} />

      {loading && <Text>Chargement...</Text>}

      {contextPlaces.length > 0 && (
        <Button
          title="Voir la carte"
          color="#6a5acd"
          onPress={() => router.push({
            pathname: "./map",
            params: { 
              lat: lat.replace(",", "."),
              lng: lng.replace(",", ".")
            }
          })}
        />
      )}

      <FlatList
        data={places}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
        renderItem={({ item }) => {
          const props = item.properties || {};
          const coords = item.geometry?.coordinates || [];

          return (
            <View style={styles.item}>
              {/* Ligne titre + coords */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {props.name || "Sans nom"}
                </Text>
                {coords.length === 2 && (
                  <Text style={{
                    fontStyle: "italic",
                    fontSize: 12,
                    color: "#6a5acd", // bleu/violet
                    marginLeft: 8
                  }}>
                    ({coords[1].toFixed(5)} / {coords[0].toFixed(5)})
                  </Text>
                )}
              </View>

              {/* Infos complémentaires */}
              {Object.entries(props)
                .slice(0, 6)
                .map(([key, value]) => (
                  <Text key={key} style={{ fontSize: 14, marginBottom: 2 }}>
                    {key} : {String(value)}
                  </Text>
                ))}
            </View>

          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
});
