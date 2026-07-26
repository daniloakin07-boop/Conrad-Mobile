import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useAuth } from "../AuthContext";

export default function HeaderLogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <Pressable onPress={handleLogout} hitSlop={12} style={{ paddingHorizontal: 4 }}>
      <Ionicons name="log-out-outline" size={22} color="#fff" />
    </Pressable>
  );
}
