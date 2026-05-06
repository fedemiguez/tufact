import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";

export default function LoginScreen({ onGoRegister }: { onGoRegister: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    try {
      const res = await apiFetch("/auth/login", null, {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok) {
        Alert.alert("Error", data.error ?? "No se pudo iniciar sesión");
        return;
      }
      if (data.token) await signIn(data.token);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>TUFACT</Text>
      <Text style={styles.sub}>Facturación electrónica ARCA/AFIP</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.btn} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Entrar</Text>}
      </Pressable>
      <Pressable onPress={onGoRegister} style={styles.link}>
        <Text style={styles.linkText}>Crear cuenta</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#1a1a2e" },
  title: { fontSize: 32, fontWeight: "800", color: "#eaeaea", textAlign: "center" },
  sub: { color: "#a0a0b8", textAlign: "center", marginBottom: 28 },
  input: {
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 14,
    color: "#fff",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#e94560",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  link: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#e94560" },
});
