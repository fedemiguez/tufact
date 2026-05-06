import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useAuth } from "../auth/AuthContext";
import { apiFetch, apiUrl } from "../api/client";
import type { RootStackParamList } from "../navigation/types";
import type { InvoiceRow } from "../lib/receipt";
import { printThermalInvoice } from "../lib/thermalPrint";

type Nav = NativeStackNavigationProp<RootStackParamList, "InvoiceDetail">;
type Rt = RouteProp<RootStackParamList, "InvoiceDetail">;

export default function InvoiceDetailScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: Rt;
}) {
  const { token } = useAuth();
  const { id } = route.params;
  const [inv, setInv] = useState<InvoiceRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      if (!token) return;
      const res = await apiFetch(`/me/invoices/${id}`, token);
      const data = (await res.json()) as InvoiceRow;
      if (res.ok) setInv(data);
      setLoading(false);
    })();
  }, [token, id]);

  async function downloadPdf() {
    if (!token || !inv) return;
    try {
      const path = `${FileSystem.cacheDirectory ?? ""}tufact-${inv.cbteNro}.pdf`;
      const result = await FileSystem.downloadAsync(apiUrl(`/me/invoices/${inv.id}/pdf`), path, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (result.status !== 200) {
        Alert.alert("PDF", `Error HTTP ${result.status}`);
        return;
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, { mimeType: "application/pdf", dialogTitle: "TUFACT PDF" });
      } else {
        Alert.alert("PDF", result.uri);
      }
    } catch (e) {
      Alert.alert("PDF", e instanceof Error ? e.message : "Error");
    }
  }

  async function onPrint() {
    if (!inv) return;
    try {
      const msg = await printThermalInvoice(inv);
      Alert.alert("Impresión", msg);
    } catch (e) {
      Alert.alert("Impresión", e instanceof Error ? e.message : "Error");
    }
  }

  if (loading || !inv) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e94560" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.h}>Comprobante #{inv.cbteNro}</Text>
      <Text style={styles.t}>Total: ${inv.impTotal}</Text>
      <Text style={styles.m}>CAE: {inv.cae}</Text>
      <Text style={styles.m}>Vto CAE: {inv.caeFchVto}</Text>
      {inv.items?.map((it, i) => (
        <Text key={i} style={styles.m}>
          {it.description} — {it.quantity} × {it.unitPrice} = {it.amount}
        </Text>
      ))}
      <Pressable style={styles.btn} onPress={downloadPdf}>
        <Text style={styles.btnT}>Exportar PDF</Text>
      </Pressable>
      {Platform.OS !== "web" ? (
        <Pressable style={styles.btnSec} onPress={onPrint}>
          <Text style={styles.btnSecT}>Imprimir térmica (BLE)</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Volver</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#1a1a2e" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", backgroundColor: "#1a1a2e" },
  h: { fontSize: 22, fontWeight: "700", color: "#eaeaea" },
  t: { color: "#fff", fontSize: 18, marginVertical: 8 },
  m: { color: "#a0a0b8", marginBottom: 4 },
  btn: {
    backgroundColor: "#e94560",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  btnT: { color: "#fff", fontWeight: "700" },
  btnSec: {
    borderWidth: 1,
    borderColor: "#e94560",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  btnSecT: { color: "#e94560", fontWeight: "600" },
  back: { color: "#888", textAlign: "center", marginTop: 24 },
});
