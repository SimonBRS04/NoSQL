import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { useState } from "react";

const API_URL = "http://localhost:3000";

export default function AddressTab() {
  const [street, setStreet] = useState("");
  const [postal, setPostal] = useState("75000");
  const [arrondissement, setArrondissement] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchByAddress = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        street,
        postal,
        arrondissement
      }).toString();

      const res = await fetch(`${API_URL}/api/places/by-address?${query}`);
      const data = await res.json();
      setPlaces(data.data);
    } catch (err) {
      alert("Erreur API : " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recherche par Adresse</Text>

      <Text>Nom de rue :</Text>
      <TextInput style={styles.input} value={street} onChangeText={setStreet} />

      <Text>Code postal :</Text>
      <TextInput style={styles.input} value={postal} onChangeText={setPostal} keyboardType="numeric" />

      <Text>Arrondissement :</Text>
      <TextInput style={styles.input} value={arrondissement} onChangeText={setArrondissement} keyboardType="numeric" />

      <Button title="Rechercher" onPress={fetchByAddress} />

      {loading && <Text>Chargement...</Text>}

      <FlatList
        data={places}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
        renderItem={({ item }) => {
          const props = item.properties || {};
          const coords = item.geometry?.coordinates || [];

          return (
            <View style={styles.item}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {props.name || "Sans nom"}
                </Text>
                {coords.length === 2 && (
                  <Text style={{ fontStyle: "italic", fontSize: 12, color: "#6a5acd", marginLeft: 8 }}>
                    ({coords[1].toFixed(5)} / {coords[0].toFixed(5)})
                  </Text>
                )}
              </View>

              {Object.entries(props).slice(0, 6).map(([k, v]) => (
                <Text key={k} style={{ fontSize: 14, marginBottom: 2 }}>
                  {k} : {String(v)}
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
});
