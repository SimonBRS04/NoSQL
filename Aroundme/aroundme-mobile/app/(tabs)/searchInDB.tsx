import { View, Text, TextInput, Button, FlatList, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { usePlaces } from "@/context/PlacesContext";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

const API_URL = "http://10.162.130.165:3000";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setPlaces: setGlobalPlaces } = usePlaces();
  const router = useRouter();

  const search = async () => {
    const q = query.trim();
    if (!q) {
      alert("Merci de saisir un terme de recherche.");
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/api/places/search?q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      const json = JSON.parse(text);
      const placesData = Array.isArray(json) ? json : json.data || [];

      // Pas de déduplication côté client — backend should return unique rows
      setResults(placesData);
      setGlobalPlaces(placesData);
    } catch (err: any) {
      console.error(err);
      alert("Erreur recherche : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setGlobalPlaces([]);
  };

  const openOnMap = (place: any) => {
    const coords = place.geometry?.coordinates || [];
    if (coords.length !== 2) {
      alert("Coordonnées absentes pour ce lieu.");
      return;
    }
    // coords are [lng, lat] — normalize commas to dots
    const lngRaw = String(coords[0]).replace(",", ".");
    const latRaw = String(coords[1]).replace(",", ".");

    router.push({ pathname: "./map", params: { lat: latRaw, lng: lngRaw } });
  };

  const searchNearby = async (place: any) => {
    const coords = place.geometry?.coordinates || [];
    if (coords.length !== 2) {
      alert("Coordonnées absentes pour ce lieu.");
      return;
    }

    const latRaw = String(coords[1]).replace(",", ".");
    const lngRaw = String(coords[0]).replace(",", ".");

    setLoading(true);
    try {
      const url = `${API_URL}/api/places/nearby?lat=${latRaw}&lng=${lngRaw}&radius=1000&limit=50`;
      const res = await fetch(url);
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      const json = JSON.parse(text);
      const placesData = Array.isArray(json) ? json : json.data || [];

      setGlobalPlaces(placesData);
      router.push({ pathname: "./map", params: { lat: latRaw, lng: lngRaw } });
    } catch (err: any) {
      console.error(err);
      alert("Erreur recherche nearby : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ height: 50 }} />

      <Text style={styles.title}>Recherche générale</Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="ex : café, boulangerie, rue..."
        placeholderTextColor="#999"
      />

      <View style={{ height: 8 }} />
      <Button title="Rechercher" onPress={search} color="#2196F3" />
      <View style={{ height: 8 }} />
      <Button title="Effacer" onPress={clearSearch} color="#FF6B6B" />

      {loading && <Text style={styles.loading}>Recherche en cours...</Text>}

      {results.length > 0 && (
        <Text style={styles.resultCount}>{results.length} résultat{results.length > 1 ? "s" : ""}</Text>
      )}

      {!loading && query && results.length === 0 && (
        <Text style={styles.noResults}>Aucun résultat trouvé pour "{query}"</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
        renderItem={({ item }) => {
          const props = item.properties || {};
          const coords = item.geometry?.coordinates || [];
          return (
            <View style={styles.item}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16, flex: 1 }}>
                  {props.name || "Sans nom"}
                </Text>
                {coords.length === 2 && (
                  <Text style={{ fontStyle: "italic", fontSize: 12, color: "#6a5acd", marginLeft: 8 }}>
                    ({Number(coords[1]).toFixed(4)}, {Number(coords[0]).toFixed(4)})
                  </Text>
                )}
              </View>

              {props.amenity && <Text style={styles.meta}>Type : {props.amenity}</Text>}
              {props.address && <Text style={styles.meta}>Adresse : {props.address}</Text>}
              {props.phone && <Text style={styles.meta}>Tel : {props.phone}</Text>}

              <View style={{ height: 8 }} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button
                  title="Map"
                  onPress={() => openOnMap(item)}
                  color="#6a5acd"
                  disabled={coords.length !== 2}
                />
                <Button
                  title="Aroundthis"
                  onPress={() => searchNearby(item)}
                  color="#2196F3"
                  disabled={coords.length !== 2}
                />
              </View>
            </View>
          );
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  loading: { textAlign: "center", color: "#2196F3", marginVertical: 12 },
  resultCount: { fontSize: 14, color: "#666", marginVertical: 8, fontWeight: "600" },
  noResults: { textAlign: "center", color: "#999", marginVertical: 24, fontSize: 16 },
  item: { padding: 12, marginVertical: 8, borderLeftWidth: 4, borderLeftColor: "#6a5acd", backgroundColor: "#f5f5f5", borderRadius: 6 },
  meta: { fontSize: 13, color: "#666", marginBottom: 4 },
});