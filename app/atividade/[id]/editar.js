// ============================================================================
// app/atividade/[id]/editar.js — EDITAR atividade ou avaliação já publicada (somente educador)
// Rota: "/atividade/45/editar". Equivale à edição que o Web faz em pages/professor-correcao.html.
// Abre o formulário (o mesmo da publicação) JÁ PREENCHIDO com os dados atuais e grava com
// PUT /api/atividades/:id. O servidor confere se a atividade é do educador logado e recusa
// (409) alterações que prejudiquem notas, por exemplo:
//   • valor máximo menor que a maior nota já lançada;
//   • trocar turma ou tipo quando já existem entregas.
// Quando há entregas, a tela já bloqueia turma e tipo (o servidor valida de novo).
// O servidor não tem rota de detalhe; por isso a tela busca a lista do educador
// (GET /api/atividades) e escolhe a atividade pelo id — o mesmo padrão da tela do aluno.
// Ao salvar, a tela anterior (lista de atividades) recarrega sozinha ao voltar ao foco.
// ============================================================================
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { api, useApi } from "../../../src/api";
import FormularioAtividade from "../../../src/components/FormularioAtividade";
import { dataBR, pts } from "../../../src/format";
import Page, { SoPara, Title } from "../../../src/ui/page";

// Protege a tela: só educadores (o servidor também valida com o middleware soEducador).
export default function EditarAtividadeTela() {
  return (
    <SoPara tipo="educador">
      <EditarAtividade />
    </SoPara>
  );
}

function EditarAtividade() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Carrega a atividade (dados atuais do banco) e as turmas do educador em paralelo.
  const { data, loading, error } = useApi(async () => {
    const [lista, turmas] = await Promise.all([api.atividadesEducador(), api.turmas()]);
    const atividades = Array.isArray(lista) ? lista : lista.atividades || [];
    const atividade = atividades.find((x) => String(x.id) === String(id));
    if (!atividade) throw new Error("Atividade não encontrada.");
    return { atividade, turmas: turmas.turmas || [] };
  }, [id]);

  const a = data?.atividade;
  const temEntregas = Number(a?.total_entregas || 0) > 0;
  const rotulo = a?.tipo === "avaliacao" ? "avaliação" : "atividade";

  return (
    <>
      <Stack.Screen options={{ title: "Editar atividade" }} />
      <Page loading={loading} error={error}>
        {a ? (
          <>
            <Title sub={`${a.disciplina} · ${a.turma}`}>Editar {rotulo}</Title>
            <FormularioAtividade
              // key garante que o formulário recomece com os dados da atividade carregada
              key={a.id}
              modo="editar"
              tipo={a.tipo === "avaliacao" ? "avaliacao" : "atividade"}
              turmas={data.turmas}
              inicial={{
                titulo: a.titulo,
                turmaId: a.turma_id ? Number(a.turma_id) : null,
                data: a.data_aplicacao ? dataBR(a.data_aplicacao) : "",
                valor: pts(a.valor_maximo),
                descricao: a.descricao || "",
              }}
              turmaBloqueada={temEntregas}
              tipoBloqueado={temEntregas}
              rotuloBotao="Salvar alterações"
              msgSucesso="Alterações salvas."
              // PUT /api/atividades/:id (somente o autor; o servidor valida tudo de novo)
              onSalvar={(payload) => api.editarAtividade(a.id, payload)}
              aoConcluir={() => router.back()}
            />
          </>
        ) : null}
      </Page>
    </>
  );
}
