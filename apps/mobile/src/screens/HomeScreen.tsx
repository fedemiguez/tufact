import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../auth/AuthContext";

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: { navigation: Nav }) {
  const { signOut } = useAuth();

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>TUFACT</Text>
      <Text style={styles.sub}>Elegí una opción</Text>
      <Pressable style={styles.btn} onPress={() => navigation.navigate("NewInvoice")}>
        <Text style={styles.btnText}>Nueva factura (C)</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={() => navigation.navigate("Invoices")}>
        <Text style={styles.btnText}>Historial</Text>
      </Pressable>
      <Pressable style={styles.btnSec} onPress={() => navigation.navigate("Branding")}>
        <Text style={styles.btnSecText}>Marca y local</Text>
      </Pressable>
      <Pressable style={styles.btnSec} onPress={() => navigation.navigate("Fiscal")}>
        <Text style={styles.btnSecText}>Credenciales AFIP</Text>
      </Pressable>
      <Pressable style={styles.out} onPress={() => void signOut()}>
        <Text style={styles.outText}>Salir</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, backgroundColor: "#1a1a2e", paddingTop: 56 },
  title: { fontSize: 28, fontWeight: "800", color: "#eaeaea" },
  sub: { color: "#a0a0b8", marginBottom: 24 },
  btn: {
    backgroundColor: "#e94560",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  btnSec: {
    borderWidth: 1,
    borderColor: "#e94560",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  btnSecText: { color: "#e94560", fontWeight: "600" },
  out: { marginTop: 32, alignItems: "center" },
  outText: { color: "#888" },
});
