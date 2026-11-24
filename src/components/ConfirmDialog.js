// ============================================================================
// src/components/ConfirmDialog.js — janela de confirmação (Modal do React Native)
// Usada para ações destrutivas: "Excluir minha conta" (app/perfil.js) e "Excluir atividade"
// (src/components/AcoesAtividade.js). Não usa Alert.alert porque, na versão web do Expo
// (react-native-web), o Alert não exibe nada — o Modal funciona em Android, iOS e web.
//
// Props:
//   visible          mostra/esconde a janela
//   titulo           título (ex.: "Excluir minha conta")
//   children         conteúdo extra (aviso, campo de senha...)
//   textoConfirmar   rótulo do botão principal (padrão "Confirmar")
//   onConfirmar      chamada ao tocar em confirmar
//   onCancelar       chamada ao cancelar/fechar (ignorada enquanto carregando = true)
//   carregando       true durante a requisição: botões travados (sem toques repetidos)
//   erro             mensagem de erro exibida dentro da janela
//   perigo           true (padrão) deixa o botão principal vermelho
// ============================================================================
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../theme";
import { makeStyles } from "../ui/estilos";
import Button from "./Button";
import Message from "./Message";

export default function ConfirmDialog({
  visible,
  titulo,
  children,
  textoConfirmar = "Confirmar",
  onConfirmar,
  onCancelar,
  carregando = false,
  erro = "",
  perigo = true,
}) {
  const styles = useStyles();
  // Durante a requisição o usuário não pode fechar a janela (nem pelo botão voltar do Android).
  const fechar = () => {
    if (!carregando) onCancelar?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={fechar} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.fundo} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Toque fora da caixa fecha (quando não está carregando) */}
        <Pressable style={styles.toqueFora} onPress={fechar} accessibilityLabel="Fechar janela" />
        <View style={styles.caixa} accessibilityViewIsModal>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18 }}>
            <Text style={[styles.titulo, perigo && { color: COLORS.error }]}>{titulo}</Text>
            {children}
            {erro ? <Message type="erro" text={erro} /> : null}
            <View style={{ height: 14 }} />
            <Button
              label={textoConfirmar}
              variant={perigo ? "danger" : "solid"}
              onPress={onConfirmar}
              loading={carregando}
            />
            <View style={{ height: 8 }} />
            <Button label="Cancelar" variant="outline" onPress={fechar} disabled={carregando} style={{ alignSelf: "stretch" }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const useStyles = makeStyles(() => ({
  fundo: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: "rgba(10,31,68,0.6)" },
  toqueFora: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  caixa: {
    maxHeight: "90%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  titulo: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.text, letterSpacing: 0.5, marginBottom: 8 },
}));
