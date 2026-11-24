// ============================================================================
// app/atividade/nova.js — PUBLICAR atividade ou avaliação (somente educador)
// Equivale a pages/nova-atividade.html e nova-avaliacao.html + JS/construtor-atividade.js
// e JS/seletor-turma.js do Web.
// Parâmetros de rota (opcionais): tipo = "atividade" | "avaliacao" e turmaId (pré-seleciona a turma).
// Envia para POST /api/atividades: { titulo, turma_id, data_aplicacao, valor_maximo, descricao, tipo }.
// O servidor confere se a turma pertence ao professor, valida o valor (0 < valor ≤ 1000) e
// publica a atividade já como avaliativa/aplicada (entra no boletim).
//
// IMPORTANTE — questões e tempo limite: o formulário Web tem um construtor de questões e
// de tempo limite, mas o servidor atual (JS/atividades.js) IGNORA esses campos (veja a
// seção "Limitações" da documentação). Por isso o Mobile não os oferece: não adianta
// montar questões que o servidor descartaria. O aluno responde com texto livre.
//
// O formulário em si fica em src/components/FormularioAtividade.js, o MESMO usado pela edição
// (app/atividade/[id]/editar.js): aqui só definimos o que acontece ao salvar (criar) e ao concluir.
// ============================================================================
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { api, useApi } from "../../src/api";
import FormularioAtividade from "../../src/components/FormularioAtividade";
import Page, { SoPara, Title } from "../../src/ui/page";

// Protege a tela: só educadores (o servidor também valida com o middleware soEducador).
export default function NovaAtividadeTela() {
  return (
    <SoPara tipo="educador">
      <NovaAtividade />
    </SoPara>
  );
}

function NovaAtividade() {
  const { tipo: tipoParam, turmaId: turmaParam } = useLocalSearchParams();
  const tipo = tipoParam === "avaliacao" ? "avaliacao" : "atividade";
  const rotulo = tipo === "avaliacao" ? "avaliação" : "atividade";
  const router = useRouter();
  const turmasApi = useApi(() => api.turmas(), []);
  const turmas = turmasApi.data?.turmas || [];

  return (
    <>
      <Stack.Screen options={{ title: `Nova ${rotulo}` }} />
      <Page loading={turmasApi.loading} error={turmasApi.error}>
        <Title sub="Será publicada para todos os alunos da turma">Nova {rotulo}</Title>
        <FormularioAtividade
          modo="nova"
          tipo={tipo}
          turmas={turmas}
          inicial={{ turmaId: turmaParam ? Number(turmaParam) : null, valor: "10" }}
          rotuloBotao={`Publicar ${rotulo}`}
          msgSucesso={`Sua ${rotulo} foi publicada para a turma.`}
          limparAoSalvar
          // POST /api/atividades: o servidor confere a turma, valida o valor e publica
          onSalvar={(payload) => api.criarAtividade(payload)}
          aoConcluir={() => router.back()}
        />
      </Page>
    </>
  );
}
