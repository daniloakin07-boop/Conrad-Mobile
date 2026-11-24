// ============================================================================
// src/components/AcoesAtividade.js — botões "Editar" e "Excluir atividade" (somente educador)
// Usado em app/atividades.js (cada cartão da lista) e app/atividade/[id]/entregas.js.
//
//  • Editar  → abre app/atividade/[id]/editar.js (formulário preenchido, PUT /api/atividades/:id).
//  • Excluir → janela de confirmação avisando que a ação é permanente e pode remover as entregas e
//              notas da atividade; ao confirmar chama DELETE /api/atividades/:id. O servidor
//              confere se a atividade é do educador logado (os botões só aparecem para ele,
//              mas a permissão real é do back-end).
//
// IMPORTANTE (navegação): este componente deve ficar FORA de qualquer Pressable do cartão.
// Botão dentro de botão faz o toque "vazar" para o cartão e abrir a tela errada.
//
// Props: atividade { id, titulo?, total_entregas? }, onExcluida (chamada após o servidor confirmar).
// ============================================================================
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { api } from "../api";
import { COLORS, FONTS } from "../theme";
import { makeStyles } from "../ui/estilos";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";

export default function AcoesAtividade({ atividade, onExcluida }) {
  const styles = useStyles();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");
  // Trava síncrona contra toques repetidos em "Excluir"
  const excluindoRef = useRef(false);

  const entregas = Number(atividade.total_entregas || 0);

  function abrir() {
    setErro("");
    setAberto(true);
  }

  function fechar() {
    if (!excluindoRef.current) setAberto(false);
  }

  // DELETE /api/atividades/:id. Só depois da resposta de sucesso a janela fecha e a tela atualiza.
  async function confirmar() {
    if (excluindoRef.current) return;
    excluindoRef.current = true;
    setExcluindo(true);
    setErro("");
    try {
      await api.excluirAtividade(atividade.id);
      excluindoRef.current = false;
      setAberto(false);
      onExcluida?.();
    } catch (e) {
      setErro(e.message || "Não foi possível excluir a atividade.");
    } finally {
      excluindoRef.current = false;
      setExcluindo(false);
    }
  }

  return (
    <>
      <View style={styles.linha}>
        <Button
          label="Editar"
          variant="outline"
          style={styles.botao}
          onPress={() => router.push(`/atividade/${atividade.id}/editar`)}
        />
        <Button label="Excluir atividade" variant="danger" style={styles.botao} onPress={abrir} />
      </View>

      <ConfirmDialog
        visible={aberto}
        titulo="Excluir atividade"
        textoConfirmar="Excluir atividade"
        onConfirmar={confirmar}
        onCancelar={fechar}
        carregando={excluindo}
        erro={erro}
      >
        <Text style={styles.texto}>
          {atividade.titulo ? `Você vai excluir “${atividade.titulo}”. ` : ""}
          Esta ação é permanente e poderá remover as entregas e as notas vinculadas a esta atividade
          {entregas ? ` (${entregas} entrega${entregas > 1 ? "s" : ""})` : ""}. Os alunos deixarão de vê-la.
        </Text>
      </ConfirmDialog>
    </>
  );
}

const useStyles = makeStyles(() => ({
  linha: { flexDirection: "row", gap: 8, marginTop: 12 },
  botao: { flex: 1, paddingVertical: 10, paddingHorizontal: 8 },
  texto: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 20 },
}));
