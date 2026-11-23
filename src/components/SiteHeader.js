// ============================================================================
// src/components/SiteHeader.js — cabeçalho do app
// Dois modos: "publico" (telas abertas: logo, Início/Sobre/Contato, tema, Entrar/Criar conta)
// e "app" (telas logadas: botão voltar, logo, título da tela, tema, perfil e Sair).
// Usa useSafeAreaInsets para respeitar o entalhe/barra de status. Chamado por app/_layout.js.
// ============================================================================
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../AuthContext";
import { ehEducador } from "../format";
import { COLORS, FONTS, RADIUS } from "../theme";
import { makeStyles } from "../ui/estilos";
import ThemeToggle from "./ThemeToggle";

// Cabeçalho do CONRAD Web (.topo / .topo-home de index.html) em versão nativa.
//  - Logo CONRAD, links Início / Sobre / Contato, botão de tema e ações da conta.
//  - Deslogado: "Entrar" e "Criar conta". Logado: acesso ao painel, ao perfil e "Sair",
//    conforme o tipo de usuário (aluno/educador) do AuthContext.
//  - Telas estreitas (<= 760px no Web): logo + ações na 1ª linha, menu na 2ª.
//  - modo="app": cabeçalho das telas logadas (abas inferiores): logo, título da
//    tela, tema, perfil e sair — mesma identidade visual, sem o menu público.
const LINKS = [
  ["Início", "/"],
  ["Sobre", "/sobre"],
  ["Contato", "/contato"],
];

export default function SiteHeader({ modo = "publico", titulo, voltar }) {
  const styles = useStyles();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { usuario, logout } = useAuth();

  const educador = ehEducador(usuario);
  const painel = educador ? "/educador" : "/aluno";
  const compacto = width < 760;
  const apertado = width < 360;
  const primeiroNome = usuario?.nome ? String(usuario.nome).trim().split(/\s+/)[0] : "";
  const iniciais = usuario?.nome
    ? String(usuario.nome).trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "";

  async function sair() {
    await logout();
    router.replace("/login");
  }

  const logo = (
    <Pressable
      onPress={() => router.replace(usuario && modo === "app" ? painel : "/")}
      accessibilityRole="link"
      accessibilityLabel="CONRAD, página inicial"
      hitSlop={8}
    >
      <Text style={styles.logo}>CONRAD</Text>
    </Pressable>
  );

  const botaoPerfil = usuario ? (
    <Pressable
      onPress={() => router.push("/perfil")}
      accessibilityRole="button"
      accessibilityLabel={`Meu perfil, ${primeiroNome}`}
      style={styles.perfil}
      hitSlop={6}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarT}>{iniciais}</Text>
      </View>
      {!apertado && modo !== "app" ? (
        <Text style={styles.perfilNome} numberOfLines={1}>
          {primeiroNome}
        </Text>
      ) : null}
    </Pressable>
  ) : null;

  const botaoSair = (
    <Pressable onPress={sair} accessibilityRole="button" accessibilityLabel="Sair" hitSlop={8} style={styles.sair}>
      <Ionicons name="log-out-outline" size={20} color={COLORS.headerText} />
    </Pressable>
  );

  // ---------- cabeçalho das telas logadas ----------
  if (modo === "app") {
    return (
      <View style={[styles.topo, { paddingTop: insets.top + 8 }]}>
        <View style={styles.linha}>
          <View style={styles.esquerda}>
            {voltar ? (
              <Pressable onPress={voltar} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={10} style={styles.voltar}>
                <Ionicons name="chevron-back" size={22} color={COLORS.headerText} />
              </Pressable>
            ) : null}
            {logo}
            {titulo ? (
              <Text style={styles.tituloTela} numberOfLines={1}>
                {titulo}
              </Text>
            ) : null}
          </View>
          <View style={styles.acoes}>
            <ThemeToggle size={34} />
            {botaoPerfil}
            {botaoSair}
          </View>
        </View>
      </View>
    );
  }

  // ---------- cabeçalho público ----------
  const menu = (
    <View style={[styles.menu, compacto && styles.menuCompacto]}>
      {LINKS.map(([rotulo, rota]) => {
        const ativo = pathname === rota || (rota === "/" && pathname === "/index");
        return (
          <Pressable key={rota} onPress={() => router.push(rota)} accessibilityRole="link" hitSlop={8}>
            <Text style={[styles.menuLink, ativo && styles.menuAtivo]}>{rotulo}</Text>
          </Pressable>
        );
      })}
      <ThemeToggle size={36} />
    </View>
  );

  const acoes = usuario ? (
    <View style={styles.acoes}>
      <Pressable onPress={() => router.push(painel)} accessibilityRole="button" style={[styles.btnLink, apertado && styles.btnApertado]}>
        <Text style={[styles.btnLinkT, apertado && styles.btnApertadoT]}>Meu painel</Text>
      </Pressable>
      {botaoPerfil}
      {botaoSair}
    </View>
  ) : (
    <View style={styles.acoes}>
      <Pressable onPress={() => router.push("/login")} accessibilityRole="button" style={[styles.btnLink, apertado && styles.btnApertado]}>
        <Text style={[styles.btnLinkT, apertado && styles.btnApertadoT]}>Entrar</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/cadastro")} accessibilityRole="button" style={[styles.btnPrimario, apertado && styles.btnApertado]}>
        <Text style={[styles.btnPrimarioT, apertado && styles.btnApertadoT]}>Criar conta</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.topo, { paddingTop: insets.top + 10 }]}>
      {compacto ? (
        <>
          <View style={styles.linha}>
            {logo}
            {acoes}
          </View>
          {menu}
        </>
      ) : (
        <View style={styles.linha}>
          {logo}
          {menu}
          {acoes}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  topo: {
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  linha: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  esquerda: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  voltar: { marginRight: -4 },
  logo: { fontFamily: FONTS.display, fontSize: 28, letterSpacing: 1, color: COLORS.headerText },
  tituloTela: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.headerText, opacity: 0.85, flexShrink: 1 },
  menu: { flexDirection: "row", alignItems: "center", gap: 20 },
  menuCompacto: { justifyContent: "center", marginTop: 10, gap: 22 },
  menuLink: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.headerText },
  menuAtivo: { color: COLORS.orange },
  acoes: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 },
  // .topo-acoes .btn-link / .btn-primario do Web
  btnLink: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    backgroundColor: COLORS.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLinkT: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.headerText },
  btnPrimario: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimarioT: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.white },
  btnApertado: { paddingHorizontal: 10 },
  btnApertadoT: { fontSize: 12 },
  perfil: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: 120 },
  perfilNome: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.headerText, flexShrink: 1 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarT: { fontFamily: FONTS.bodyExtraBold, fontSize: 13, color: COLORS.white },
  sair: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
}));
