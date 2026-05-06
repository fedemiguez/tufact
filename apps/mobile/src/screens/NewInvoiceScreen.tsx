import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "NewInvoice">;

type Item = { description: string; quantity: string; unitPrice: string };

export default function NewInvoiceScreen({ navigation }: { navigation: Nav }) {
  const { token } = useAuth();
  const [cliente, setCliente] = useState<"cf" | "cuit">("cf");
  const [cuitCliente, setCuitCliente] = useState("");
  const [items, setItems] = useState<Item[]>([
    { description: "Servicio / producto", quantity: "1", unitPrice: "0" },
  ]);
  const [loading, setLoading] = useState(false);

  function addLine() {
    setItems([...items, { description: "", quantity: "1", unitPrice: "0" }]);
  }

  async function submit() {
    if (!token) return;
    setLoading(true);
    try {
      const body = {
        clienteTipo: cliente === "cf" ? "consumidor_final" : "cuit",
        cuitCliente: cliente === "cuit" ? cuitCliente : undefined,
        items: items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      };
      const res = await apiFetch("/me/invoices", token, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("AFIP / API", (data as { error?: string }).error ?? JSON.stringify(data));
        return;
      }
      const id = (data as { id: string }).id;
      Alert.alert("Listo", "Factura autorizada", [
        { text: "OK", onPress: () => navigation.replace("InvoiceDetail", { id }) },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.h}>Nueva factura C</Text>
      <Text style={styles.label}>Cliente</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.chip, cliente === "cf" && styles.chipOn]}
          onPress={() => setCliente("cf")}
        >
          <Text style={cliente === "cf" ? styles.chipOnT : styles.chipT}>Consumidor final</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, cliente === "cuit" && styles.chipOn]}
          onPress={() => setCliente("cuit")}
        >
          <Text style={cliente === "cuit" ? styles.chipOnT : styles.chipT}>CUIT</Text>
        </Pressable>
      </View>
      {cliente === "cuit" ? (
        <TextInput
          style={styles.input}
          placeholder="CUIT sin guiones"
          keyboardType="numeric"
          value={cuitCliente}
          onChangeText={setCuitCliente}
        />
      ) : null}
      <Text style={styles.label}>Ítems</Text>
      {items.map((it, idx) => (
        <View key={idx} style={styles.itemBox}>
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={it.description}
            onChangeText={(v) => {
              const n = [...items];
              n[idx].description = v;
              setItems(n);
            }}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="Cant."
              keyboardType="decimal-pad"
              value={it.quantity}
              onChangeText={(v) => {
                const n = [...items];
                n[idx].quantity = v;
                setItems(n);
              }}
            />
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="P. unitario"
              keyboardType="decimal-pad"
              value={it.unitPrice}
              onChangeText={(v) => {
                const n = [...items];
                n[idx].unitPrice = v;
                setItems(n);
              }}
            />
          </View>
        </View>
      ))}
      <Pressable style={styles.add} onPress={addLine}>
        <Text style={styles.addT}>+ línea</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Emitir</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Volver</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#1a1a2e" },
  content: { padding: 20, paddingBottom: 48 },
  h: { fontSize: 22, fontWeight: "700", color: "#eaeaea", marginBottom: 16 },
  label: { color: "#a0a0b8", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 12,
  },
  chipOn: { borderColor: "#e94560", backgroundColor: "#2a1a24" },
  chipT: { color: "#ccc" },
  chipOnT: { color: "#e94560", fontWeight: "600" },
  input: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    marginBottom: 8,
  },
  half: { flex: 1 },
  itemBox: { marginBottom: 12, borderLeftWidth: 2, borderColor: "#e94560", paddingLeft: 8 },
  add: { alignSelf: "flex-start", marginBottom: 16 },
  addT: { color: "#e94560" },
  btn: {
    backgroundColor: "#e94560",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  back: { color: "#888", textAlign: "center", marginTop: 20 },
});
