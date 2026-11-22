import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Redirect, Slot, Tabs, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/AuthContext";
import SiteHeader from "../src/components/SiteHeader";
import { ehEducador } from "../src/format";
import { ThemeProvider, useTema } from "../src/ThemeContext";
import { COLORS, FONTS } from "../src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

const PUBLIC_ROUTES = new Set(["index", "login", "cadastro", "contato", "sobre"]);
const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;

// Telas que NÃO são abas (detalhes, perfil, etc.): ficam registradas para poder ser
// abertas com router.push, mas sem botão na barra inferior. Sem isto o Expo Router
// cria uma aba para cada arquivo de app/.
const OCULTAS = {
  perfil: "Meu perfil",
  boletim: "Boletim",
  agenda: "Agenda",
  horario: "Horário das aulas",
  salas: "Salas de vídeo",
  conversa: "Conversa",
  "atividade/nova": "Nova atividade",
  "atividade/[id]/index": "Atividade",
  "atividade/[id]/entregas": "Entregas",
  "turma/[id]": "Turma",
};
const PUBLICAS_OCULTAS = ["index", "login", "cadastro", "contato", "sobre"];
const ABAS = new Set(["aluno", "educador", "turmas", "atividades", "chat", "mais"]);

// Navegação inferior (padrão mobile no lugar do menu lateral do Web).
// Painel do aluno e do educador são telas diferentes: só uma aparece.
function TabsNavigator() {
  const { usuario, checking } = useAuth();
  const { tema } = useTema();
  const segments = useSegments();
  const router = useRouter();
  const educador = ehEducador(usuario);
  const painel = educador ? "/educador" : "/aluno";

  if (segments.length === 0 || PUBLIC_ROUTES.has(segments[0])) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <SiteHeader />
        <Slot />
      </View>
    );
  }

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.text} />
      </View>
    );
  }

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        header: ({ route, options, navigation }) => (
          <SiteHeader
            modo="app"
            titulo={options.title ?? OCULTAS[route.name] ?? route.name}
            voltar={
              ABAS.has(route.name)
                ? undefined
                : () => (navigation.canGoBack() ? navigation.goBack() : router.replace(painel))
            }
          />
        ),
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle: { fontFamily: FONTS.bodyBold, fontSize: 11 },
        tabBarStyle: { backgroundColor: COLORS.tabBar, borderTopColor: COLORS.border },
        sceneStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Tabs.Screen name="aluno" options={{ title: "Painel", tabBarIcon: icon("home-outline"), href: educador ? null : undefined }} />
      <Tabs.Screen name="educador" options={{ title: "Painel", tabBarIcon: icon("home-outline"), href: educador ? undefined : null }} />
      <Tabs.Screen name="turmas" options={{ title: "Turmas", tabBarIcon: icon("people-outline") }} />
      <Tabs.Screen name="atividades" options={{ title: "Atividades", tabBarIcon: icon("document-text-outline") }} />
      <Tabs.Screen name="chat" options={{ title: "Bate-papo", tabBarIcon: icon("chatbubbles-outline") }} />
      <Tabs.Screen name="mais" options={{ title: "Mais", tabBarIcon: icon("menu-outline") }} />
      {Object.entries(OCULTAS).map(([name, title]) => (
        <Tabs.Screen key={name} name={name} options={{ title, href: null }} />
      ))}
      {PUBLICAS_OCULTAS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}

function Raiz() {
  const { tema } = useTema();
  // Esconde a splash só quando fontes E tema salvo já estão prontos.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  return (
    <>
      <StatusBar style={tema === "claro" ? "dark" : "light"} />
      <AuthProvider>
        <TabsNavigator />
      </AuthProvider>
    </>
  );
}

export default function RootLayout() {
  // As fontes usadas em todo o app (as mesmas do Web). Antes nunca eram carregadas,
  // então o app caía na fonte do sistema.
  const [fontsLoaded, fontError] = useFonts({
    BebasNeue_400Regular,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <Raiz />
    </ThemeProvider>
  );
}
