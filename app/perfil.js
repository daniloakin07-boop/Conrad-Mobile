// ============================================================================
// app/perfil.js — PERFIL (aluno e educador)
// Equivale a pages/perfil-aluno.html + JS/perfil-aluno.js. GET/PUT /perfil: nome, e-mail,
// "sobre mim", interesses, habilidades (separados por vírgula) e foto (expo-image-picker →
// data URL JPEG). No Web o perfil do EDUCADOR é só demonstrativo; a rota do servidor serve
// a qualquer usuário logado, então o app permite editar o perfil nos dois tipos.
//
// EXCLUIR MINHA CONTA (aluno e educador): botão na parte de baixo → janela de confirmação
// (ConfirmDialog) explicando que é permanente → senha atual → AuthContext.excluirConta() →
// DELETE /conta no servidor (reconfere a senha com bcrypt e apaga em transação). Só depois da
// confirmação do servidor o usuário é desconectado e levado ao login; nenhuma mensagem de
// sucesso aparece antes disso, e o botão fica travado durante o envio.
// ============================================================================
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";
import { useAuth } from "../src/AuthContext";
import Button from "../src/components/Button";
import ConfirmDialog from "../src/components/ConfirmDialog";
import Message from "../src/components/Message";
import TextField from "../src/components/TextField";
import { COLORS, FONTS } from "../src/theme";
import Page, { Card, Title } from "../src/ui/page";
import { useApi } from "../src/api";
import { makeStyles } from "../src/ui/estilos";

export default function Perfil() {
  const styles = useStyles();
  const { usuario, setUsuario, excluirConta } = useAuth();
  const router = useRouter();
  const { data, loading, error, reload } = useApi(() => api.perfil(), []);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [sobre, setSobre] = useState("");
  const [interesses, setInteresses] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [foto, setFoto] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  // Estado da exclusão de conta
  const [dialogoExcluir, setDialogoExcluir] = useState(false);
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState("");
  // Trava síncrona contra toques repetidos (o estado "excluindo" só muda no próximo render)
  const excluindoRef = useRef(false);

  useEffect(() => {
    if (!data) return;
    setNome(data.usuario.nome);
    setEmail(data.usuario.email);
    setSobre(data.perfil.sobre_mim || "");
    setInteresses((data.perfil.interesses || []).join(", "));
    setHabilidades((data.perfil.habilidades || []).join(", "));
    setFoto(data.perfil.foto_perfil || "");
  }, [data]);

  async function escolherFoto() {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });
    if (r.canceled || !r.assets?.[0]?.base64) return;
    const uri = `data:image/jpeg;base64,${r.assets[0].base64}`;
    // Limite do servidor para a foto (~1,5 MB em texto base64).
    if (uri.length > 1500000) return setMsg({ t: "erro", m: "Foto muito grande. Escolha outra." });
    setFoto(uri);
  }

  async function salvar() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api.salvarPerfil({
        nome, email, sobre_mim: sobre, interesses, habilidades, foto_perfil: foto,
      });
      setUsuario?.((u) => ({ ...u, nome: r.usuario.nome, email: r.usuario.email }));
      setMsg({ t: "sucesso", m: "Perfil atualizado com sucesso." });
    } catch (e) {
      setMsg({ t: "erro", m: e.message });
    } finally {
      setBusy(false);
    }
  }

  // Abre a confirmação limpando senha e erros de tentativas anteriores.
  function abrirExclusao() {
    setSenhaExcluir("");
    setErroExcluir("");
    setDialogoExcluir(true);
  }

  function fecharExclusao() {
    if (excluindoRef.current) return; // não fecha no meio da exclusão
    setDialogoExcluir(false);
    setSenhaExcluir("");
  }

  // Envia a senha ao servidor. O ID da conta NÃO é enviado: o servidor usa o da sessão.
  async function confirmarExclusao() {
    if (excluindoRef.current) return;
    if (!senhaExcluir) return setErroExcluir("Digite sua senha para confirmar a exclusão.");
    excluindoRef.current = true;
    setExcluindo(true);
    setErroExcluir("");
    try {
      await excluirConta(senhaExcluir); // só segue depois da confirmação do servidor
      excluindoRef.current = false;
      setDialogoExcluir(false);
      router.replace("/login");
    } catch (e) {
      setErroExcluir(e.message || "Não foi possível excluir a conta.");
    } finally {
      excluindoRef.current = false;
      setExcluindo(false);
      setSenhaExcluir("");
    }
  }

  const iniciais = String(nome || usuario?.nome || "Usuário").trim().split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <Page loading={loading && !data} error={error} onRefresh={reload}>
      <Title sub={usuario?.tipo === "educador" ? "Educador" : "Aluno"}>Meu perfil</Title>
      <Card style={{ alignItems: "center" }}>
        <Pressable onPress={escolherFoto}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarVazio]}><Text style={styles.avatarT}>{iniciais}</Text></View>
          )}
        </Pressable>
        <Text style={styles.dica}>Toque para trocar a foto</Text>
      </Card>
      <Card>
        <TextField label="Nome" value={nome} onChangeText={setNome} />
        <TextField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Sobre mim" value={sobre} onChangeText={setSobre} multiline maxLength={800} />
        <TextField label="Interesses (separe por vírgula)" value={interesses} onChangeText={setInteresses} />
        <TextField label="Habilidades (separe por vírgula)" value={habilidades} onChangeText={setHabilidades} />
        <Message type={msg?.t} text={msg?.m} />
        <View style={{ height: 12 }} />
        <Button label="Salvar perfil" onPress={salvar} loading={busy} />
      </Card>

      {/* Zona de perigo: exclusão definitiva da conta (aluno e educador) */}
      <Card style={styles.perigo}>
        <Text style={styles.perigoTitulo}>Excluir minha conta</Text>
        <Text style={styles.perigoTexto}>
          Apaga permanentemente a sua conta e os dados pessoais ligados a ela. Essa ação não pode ser desfeita.
        </Text>
        <View style={{ height: 12 }} />
        <Button label="Excluir minha conta" variant="danger" onPress={abrirExclusao} />
      </Card>

      <ConfirmDialog
        visible={dialogoExcluir}
        titulo="Excluir minha conta"
        textoConfirmar="Excluir definitivamente"
        onConfirmar={confirmarExclusao}
        onCancelar={fecharExclusao}
        carregando={excluindo}
        erro={erroExcluir}
      >
        <Text style={styles.perigoTexto}>
          Esta exclusão é permanente e não pode ser desfeita. Seu perfil, matrículas, entregas e notas serão
          removidos.
        </Text>
        <TextField
          label="Digite sua senha atual para confirmar"
          value={senhaExcluir}
          onChangeText={setSenhaExcluir}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!excluindo}
          maxLength={200}
        />
      </ConfirmDialog>
    </Page>
  );
}

const useStyles = makeStyles(() => ({
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarVazio: { backgroundColor: COLORS.navy, alignItems: "center", justifyContent: "center" },
  avatarT: { fontFamily: FONTS.display, fontSize: 34, color: COLORS.white },
  dica: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  perigo: { borderColor: COLORS.error, marginTop: 8 },
  perigoTitulo: { fontFamily: FONTS.bodyExtraBold, fontSize: 15, color: COLORS.error },
  perigoTexto: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, lineHeight: 19, marginTop: 4 },
}));