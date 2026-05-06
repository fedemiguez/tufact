import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "Branding">;

export default function BrandingScreen({ navigation }: { navigation: Nav }) {
  const { token } = useAuth();
  const [tradeName, setTradeName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!token) return;
      const res = await apiFetch("/me/branding", token);
      if (!res.ok) return;
      const data = (await res.json()) as { tradeName?: string | null; address?: string | null };
      if (data.tradeName) setTradeName(data.tradeName);
      if (data.address) setAddress(data.address);
    })();
  }, [token]);

  async function save() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch("/me/branding", token, {
        method: "PATCH",
        body: JSON.stringify({ tradeName: tradeName || null, address: address || null }),
      });
      if (!res.ok) {
        const e = await res.json();
        Alert.alert("Error", (e as { error?: string }).error ?? "No se pudo guardar");
        return;
      }
      Alert.alert("Listo", "Marca actualizada");
    } finally {
      setLoading(false);
    }
  }

  async function pickLogo() {
    if (!token) return;
    const pick = await DocumentPicker.getDocumentAsync({ type: "image/*", copyToCacheDirectory: true });
    if (pick.canceled || !pick.assets?.[0]) return;
    const asset = pick.assets[0];
    const form = new FormData();
    form.append("file", {
      uri: asset.uri,
      name: asset.name ?? "logo.png",
      type: asset.mimeType ?? "image/png",
    } as unknown as Blob);
    const res = await apiFetch("/me/logo", token, { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      Alert.alert("Logo", (data as { error?: string }).error ?? "Error");
      return;
    }
    Alert.alert("Logo", `Subido: ${(data as { logoUrl: string }).logoUrl}`);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>Marca del local</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre comercial"
        placeholderTextColor="#666"
        value={tradeName}
        onChangeText={setTradeName}
      />
      <TextInput
        style={[styles.input, styles.tall]}
        placeholder="Dirección"
        placeholderTextColor="#666"
        multiline
        value={address}
        onChangeText={setAddress}
      />
      <Pressable style={styles.btn} onPress={save} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnT}>Guardar texto</Text>}
      </Pressable>
      <Pressable style={styles.btnSec} onPress={pickLogo}>
        <Text style={styles.btnSecT}>Subir logo (imagen)</Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#1a1a2e", padding: 20, paddingTop: 48 },
  h: { fontSize: 22, fontWeight: "700", color: "#eaeaea", marginBottom: 16 },
  input: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    marginBottom: 12,
  },
  tall: { minHeight: 80, textAlignVertical: "top" },
  btn: {
    backgroundColor: "#e94560",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
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
