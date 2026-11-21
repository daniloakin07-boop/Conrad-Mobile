import { Ionicons } from "@expo/vector-icons";
import { Redirect, Slot, Tabs, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/AuthContext";
import HeaderLogoutButton from "../src/components/HeaderLogoutButton";
import { ehEducador } from "../src/format";
import { COLORS, FONTS } from "../src/theme";

const PUBLIC_ROUTES = new Set(["index", "login", "cadastro", "contato", "sobre"]);
const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;

// Navegação inferior (padrão mobile no lugar do menu lateral do Web).
// Painel do aluno e do educador são telas diferentes: só uma aparece.
function TabsNavigator() {
  const { usuario, checking } = useAuth();
  const segments = useSegments();
  const educador = ehEducador(usuario);

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

  if (!usuario) {
    return <Redirect href="/login" />;
  }

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
      <Tabs.Screen name="aluno" options={{ title: "Painel", tabBarIcon: icon("home-outline"), href: educador ? null : undefined }} />
      <Tabs.Screen name="educador" options={{ title: "Painel", tabBarIcon: icon("home-outline"), href: educador ? undefined : null }} />
      <Tabs.Screen name="turmas" options={{ title: "Turmas", tabBarIcon: icon("people-outline") }} />
      <Tabs.Screen name="atividades" options={{ title: "Atividades", tabBarIcon: icon("document-text-outline") }} />
      <Tabs.Screen name="chat" options={{ title: "Bate-papo", tabBarIcon: icon("chatbubbles-outline") }} />
      <Tabs.Screen name="mais" options={{ title: "Mais", tabBarIcon: icon("menu-outline") }} />
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <AuthProvider>
      <TabsNavigator />
    </AuthProvider>
  );
}
