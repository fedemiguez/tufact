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

type Nav = NativeStackNavigationProp<RootStackParamList, "Fiscal">;

export default function FiscalScreen({ navigation }: { navigation: Nav }) {
  const { token } = useAuth();
  const [cuit, setCuit] = useState("");
  const [puntoVenta, setPuntoVenta] = useState("1");
  const [production, setProduction] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [certUri, setCertUri] = useState<string | null>(null);
  const [keyUri, setKeyUri] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!token) return;
      const res = await apiFetch("/me/fiscal-status", token);
      const data = (await res.json()) as {
        configured: boolean;
        cuit?: string;
        puntoVenta?: number;
        production?: boolean;
      };
      if (data.configured && data.cuit) {
        setStatus(`Configurado: CUIT ${data.cuit}, PV ${data.puntoVenta}, prod=${data.production}`);
        setCuit(data.cuit);
        setPuntoVenta(String(data.puntoVenta ?? 1));
        setProduction(!!data.production);
      } else {
        setStatus("Credenciales pendientes (homologación recomendada al inicio)");
      }
    })();
  }, [token]);

  async function pickCert() {
    const pick = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!pick.canceled && pick.assets?.[0]) setCertUri(pick.assets[0].uri);
  }

  async function pickKey() {
    const pick = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!pick.canceled && pick.assets?.[0]) setKeyUri(pick.assets[0].uri);
  }

  async function upload() {
    if (!token || !certUri || !keyUri) {
      Alert.alert("Faltan archivos", "Seleccioná certificado (.crt/.pem) y clave privada (.key)");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("cuit", cuit.replace(/\D/g, ""));
      form.append("puntoVenta", puntoVenta);
      form.append("production", production ? "true" : "false");
      form.append("certificate", {
        uri: certUri,
        name: "cert.pem",
        type: "application/x-pem-file",
      } as unknown as Blob);
      form.append("privateKey", {
        uri: keyUri,
        name: "key.key",
        type: "application/x-pem-file",
      } as unknown as Blob);

      const res = await apiFetch("/me/fiscal-credentials", token, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", (data as { error?: string }).error ?? JSON.stringify(data));
        return;
      }
      Alert.alert("Listo", "Credenciales guardadas cifradas en el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>AFIP / ARCA</Text>
      <Text style={styles.st}>{status}</Text>
      <TextInput
        style={styles.input}
        placeholder="CUIT emisor"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={cuit}
        onChangeText={setCuit}
      />
      <TextInput
        style={styles.input}
        placeholder="Punto de venta"
        placeholderTextColor="#666"
        keyboardType="number-pad"
        value={puntoVenta}
        onChangeText={setPuntoVenta}
      />
      <Pressable
        style={[styles.chip, production && styles.chipOn]}
        onPress={() => setProduction(!production)}
      >
        <Text style={production ? styles.chipOnT : styles.chipT}>
          Producción (off = homologación)
        </Text>
      </Pressable>
      <Pressable style={styles.btnSec} onPress={pickCert}>
        <Text style={styles.btnSecT}>Certificado PEM {certUri ? "✓" : ""}</Text>
      </Pressable>
      <Pressable style={styles.btnSec} onPress={pickKey}>
        <Text style={styles.btnSecT}>Clave privada PEM {keyUri ? "✓" : ""}</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={upload} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnT}>Guardar</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#1a1a2e", padding: 20, paddingTop: 48 },
  h: { fontSize: 22, fontWeight: "700", color: "#eaeaea", marginBottom: 8 },
  st: { color: "#a0a0b8", marginBottom: 16 },
  input: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    marginBottom: 12,
  },
  chip: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 12,
  },
  chipOn: { borderColor: "#e94560", backgroundColor: "#2a1a24" },
  chipT: { color: "#ccc" },
  chipOnT: { color: "#e94560" },
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
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center",
  },
  btnSecT: { color: "#e94560" },
  back: { color: "#888", textAlign: "center", marginTop: 24 },
});
