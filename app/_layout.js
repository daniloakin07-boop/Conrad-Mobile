import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/nunito";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider } from "../src/AuthContext";
import { COLORS } from "../src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.navy },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontFamily: "Nunito_700Bold", fontSize: 16 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "Entrar" }} />
        <Stack.Screen name="cadastro" options={{ title: "Criar conta" }} />
        <Stack.Screen name="contato" options={{ title: "Fale conosco" }} />
        <Stack.Screen name="aluno" options={{ title: "Área do Aluno", headerBackVisible: false }} />
        <Stack.Screen
          name="educador"
          options={{ title: "Área do Educador", headerBackVisible: false }}
        />
      </Stack>
    </AuthProvider>
  );
}
