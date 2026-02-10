import { View, Text, TextInput, Button, FlatList, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { usePlaces } from "@/context/PlacesContext";

const API_URL = "http://10.162.130.165:3000";

export default function SearchScreen() {
  const [searchName, setSearchName] = useState("");
  const [searchAmenity, setSearchAmenity] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setPlaces: setGlobalPlaces } = usePlaces();

  const searchPlaces = async () => {
    setLoading(true);
    try {
      // Construire la requête de recherche
      const filters: any = {};
      if (searchName) filters.name = searchName;
      if (searchAmenity) filters.amenity = searchAmenity;
      if (searchAddress) filters.address = searchAddress;

      // Créer l'URL avec les paramètres de recherche
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        params.append(key, filters[key]);
      });

      const url = `${API_URL}/api/places/search?${params.toString()}`;
      console.log("SEARCH API:", url);

      const res = await fetch(url);
      const text = await res.text();

      if (!res.ok) {
        throw new Error(text);
      }

      const json = JSON.parse(text);
      const placesData = Array.isArray(json) ? json : json.data || [];

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
    setSearchName("");
    setSearchAmenity("");
    setSearchAddress("");
    setResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rechercher des lieux</Text>

      <Text style={styles.label}>Par nom :</Text>
      <TextInput
        style={styles.input}
        value={searchName}
        onChangeText={setSearchName}
        placeholder="ex : Café, Restaurant..."
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Par type (amenity) :</Text>
      <TextInput
        style={styles.input}
        value={searchAmenity}
        onChangeText={setSearchAmenity}
        placeholder="ex : fuel, cafe, restaurant..."
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Par adresse :</Text>
      <TextInput
        style={styles.input}
        value={searchAddress}
        onChangeText={setSearchAddress}
        placeholder="ex : Rue de..., Boulevard..."
        placeholderTextColor="#999"
      />

      <View style={{ height: 8 }} />
      <Button
        title="Rechercher"
        onPress={searchPlaces}
        color="#2196F3"
      />
      <View style={{ height: 8 }} />
      <Button
        title="Effacer"
        onPress={clearSearch}
        color="#FF6B6B"
      />

      {loading && <Text style={styles.loading}>Recherche en cours...</Text>}

      {results.length > 0 && (
        <Text style={styles.resultCount}>
          {results.length} résultat{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
        </Text>
      )}

      <FlatList
        scrollEnabled={false}
        data={results}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
        renderItem={({ item }) => {
          const props = item.properties || {};
          const coords = item.geometry?.coordinates || [];

          return (
            <View style={styles.item}>
              {/* Titre + coords */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16, flex: 1 }}>
                  {props.name || "Sans nom"}
                </Text>
                {coords.length === 2 && (
                  <Text style={{
                    fontStyle: "italic",
                    fontSize: 11,
                    color: "#6a5acd",
                    marginLeft: 8
                  }}>
                    ({coords[1].toFixed(4)}, {coords[0].toFixed(4)})
                  </Text>
                )}
              </View>

              {/* Info principales */}
              {props.amenity && (
                <Text style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "600" }}>Type :</Text> {props.amenity}
                </Text>
              )}
              {props.address && (
                <Text style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "600" }}>Adresse :</Text> {props.address}
                </Text>
              )}
              {props.phone && (
                <Text style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "600" }}>Téléphone :</Text> {props.phone}
                </Text>
              )}
              {props.opening_hours && (
                <Text style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "600" }}>Horaires :</Text> {props.opening_hours}
                </Text>
              )}
            </View>
          );
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#f9f9f9"
  },
  loading: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 16
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
    marginVertical: 12,
    fontWeight: "600"
  },
  item: {
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6a5acd",
    backgroundColor: "#f5f5f5",
    borderRadius: 6
  },
});