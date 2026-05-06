import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import NewInvoiceScreen from "./src/screens/NewInvoiceScreen";
import InvoicesScreen from "./src/screens/InvoicesScreen";
import InvoiceDetailScreen from "./src/screens/InvoiceDetailScreen";
import BrandingScreen from "./src/screens/BrandingScreen";
import FiscalScreen from "./src/screens/FiscalScreen";
import type { RootStackParamList } from "./src/navigation/types";

const AuthStack = createNativeStackNavigator<{ Login: undefined; Register: undefined }>();
const AppStack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#1a1a2e",
    card: "#1a1a2e",
    primary: "#e94560",
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: "#16213e" }, headerTintColor: "#eaeaea" }}
    >
      <AuthStack.Screen name="Login" options={{ headerShown: false }}>
        {({ navigation }) => <LoginScreen onGoRegister={() => navigation.navigate("Register")} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register" options={{ title: "Registro" }}>
        {({ navigation }) => <RegisterScreen onBack={() => navigation.goBack()} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: "#16213e" }, headerTintColor: "#eaeaea" }}
    >
      <AppStack.Screen name="Home" component={HomeScreen} options={{ title: "TUFACT" }} />
      <AppStack.Screen name="NewInvoice" component={NewInvoiceScreen} options={{ title: "Nueva factura" }} />
      <AppStack.Screen name="Invoices" component={InvoicesScreen} options={{ title: "Historial" }} />
      <AppStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: "Detalle" }} />
      <AppStack.Screen name="Branding" component={BrandingScreen} options={{ title: "Marca" }} />
      <AppStack.Screen name="Fiscal" component={FiscalScreen} options={{ title: "AFIP" }} />
    </AppStack.Navigator>
  );
}

function Gate() {
  const { token, ready } = useAuth();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1a1a2e", justifyContent: "center" }}>
        <ActivityIndicator color="#e94560" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
