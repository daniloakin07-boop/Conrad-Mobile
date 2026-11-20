import { Ionicons } from "@expo/vector-icons";
import { Redirect, Slot, Tabs, useRouter, useSegments } from "expo-router";
import { Pressable } from "react-native";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/AuthContext";
import HeaderLogoutButton from "../src/components/HeaderLogoutButton";
import { COLORS, FONTS } from "../src/theme";

const PUBLIC_ROUTES = new Set(["index", "login", "cadastro", "contato", "sobre"]);

function Voltar() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.replace("/mais")} hitSlop={12} style={{ paddingLeft: 12 }}>
      <Ionicons name="chevron-back" size={24} color="#fff" />
    </Pressable>
  );
}
const comVoltar = (title) => ({ title, href: null, headerLeft: () => <Voltar /> });

const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;

export default function RootLayout() {
  return (
    <AuthProvider>
      <TabsLayout />
    </AuthProvider>
  );
}

function TabsLayout() {
  const { usuario, checking } = useAuth();
  const segments = useSegments();

  if (segments.length === 0 || PUBLIC_ROUTES.has(segments[0])) {
    return <Slot />;
  }

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={COLORS.navy} />
      </View>
    );
  }
  if (!usuario) return <Redirect href="/login" />;

  const isEducador = usuario.tipo === "educador";

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.navy },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontFamily: FONTS.bodyBold, fontSize: 16 },
        headerShadowVisible: false,
        headerRight: () => <HeaderLogoutButton />,
        headerRightContainerStyle: { paddingRight: 12 },
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: "#8a94a6",
        tabBarLabelStyle: { fontFamily: FONTS.bodyBold, fontSize: 11 },
        tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.border },
        sceneStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Tabs.Screen name="aluno" options={{ title: "Painel", tabBarIcon: icon("home-outline"), href: isEducador ? null : undefined }} />
      <Tabs.Screen name="educador" options={{ title: "Painel", tabBarIcon: icon("home-outline"), href: isEducador ? undefined : null }} />
      <Tabs.Screen name="turmas" options={{ title: "Turmas", tabBarIcon: icon("people-outline") }} />
      <Tabs.Screen name="atividades" options={{ title: "Atividades", tabBarIcon: icon("document-text-outline") }} />
      <Tabs.Screen name="chat" options={{ title: "Bate-papo", tabBarIcon: icon("chatbubbles-outline") }} />
      <Tabs.Screen name="mais" options={{ title: "Mais", tabBarIcon: icon("menu-outline") }} />
      <Tabs.Screen name="boletim" options={comVoltar("Boletim")} />
      <Tabs.Screen name="horario" options={comVoltar("Horário das aulas")} />
      <Tabs.Screen name="salas" options={comVoltar("Salas de vídeo")} />
      <Tabs.Screen name="agenda" options={comVoltar("Agenda")} />
      <Tabs.Screen name="perfil" options={comVoltar("Meu perfil")} />
    </Tabs>
  );
}