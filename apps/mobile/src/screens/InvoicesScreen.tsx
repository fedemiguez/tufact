import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import type { RootStackParamList } from "../navigation/types";
import type { InvoiceRow } from "../lib/receipt";

type Nav = NativeStackNavigationProp<RootStackParamList, "Invoices">;

export default function InvoicesScreen({ navigation }: { navigation: Nav }) {
  const { token } = useAuth();
  const [list, setList] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        if (!token) return;
        setLoading(true);
        try {
          const res = await apiFetch("/me/invoices", token);
          const data = (await res.json()) as InvoiceRow[];
          setList(Array.isArray(data) ? data : []);
        } finally {
          setLoading(false);
        }
      })();
    }, [token]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e94560" />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>Historial</Text>
      <FlatList
        data={list}
        keyExtractor={(x) => x.id}
        ListEmptyComponent={<Text style={styles.empty}>Sin comprobantes</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("InvoiceDetail", { id: item.id })}
          >
            <Text style={styles.nro}>#{item.cbteNro}</Text>
            <Text style={styles.total}>${item.impTotal}</Text>
            <Text style={styles.meta}>{item.cae?.slice(0, 8)}…</Text>
          </Pressable>
        )}
      />
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#1a1a2e", padding: 20, paddingTop: 48 },
  center: { flex: 1, justifyContent: "center", backgroundColor: "#1a1a2e" },
  h: { fontSize: 22, fontWeight: "700", color: "#eaeaea", marginBottom: 16 },
  card: {
    backgroundColor: "#16213e",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  nro: { color: "#e94560", fontWeight: "700", fontSize: 18 },
  total: { color: "#eaeaea", fontSize: 16 },
  meta: { color: "#888", fontSize: 12 },
  empty: { color: "#888", textAlign: "center", marginTop: 24 },
  back: { color: "#888", textAlign: "center", marginTop: 16 },
});
