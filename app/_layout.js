// ============================================================================
// app/_layout.js — layout raiz e navegação (Expo Router)
// Define: carregamento de fontes, provedores globais (Tema e Sessão), rotas públicas,
// proteção de rotas por sessão e a barra de abas inferior (Painel, Turmas, Atividades,
// Bate-papo, Mais). A estrutura de arquivos em app/ define as rotas automaticamente.
// ============================================================================
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

// Telas que NÃO são abas (detalhes, perfil etc.): ficam registradas para poderem ser
// abertas com router.push, mas sem botão na barra inferior. Sem isto o Expo Router
// criaria uma aba para cada arquivo de app/. Se criar um arquivo novo em app/, registre-o aqui.
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

// Navegação do app.
//  • Telas públicas (index, login, cadastro, contato, sobre): <Slot/> com o cabeçalho público.
//  • Enquanto a sessão é verificada (checking): spinner.
//  • Sem usuário: redireciona para /login (rota protegida).
//  • Logado: abas inferiores (padrão mobile no lugar do menu lateral do Web). O painel do
//    aluno e o do educador são telas diferentes: apenas a do perfil do usuário aparece
//    (href: null esconde a outra). O cabeçalho é o mesmo em todas as telas (SiteHeader),
//    evitando saltos ao navegar.
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

// Camada interna: barra de status, AuthProvider e navegador de abas.
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

// Componente raiz do Expo Router: carrega as fontes e monta ThemeProvider → Raiz.
export default function RootLayout() {
  // Fontes usadas em todo o app (as mesmas do Web); sem elas o app cairia na fonte do sistema.
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
