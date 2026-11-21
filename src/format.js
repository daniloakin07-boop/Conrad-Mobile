// Formatadores usados em várias telas (mesmo padrão pt-BR do Web).
export const pts = (n) => String(Math.round(Number(n) * 100) / 100).replace(".", ",");
export const num = (v) => Number(String(v).replace(",", "."));

export function dataBR(iso) {
  if (!iso) return "—";
  const [a, m, d] = String(iso).slice(0, 10).split("-");
  return a && m && d ? `${d}/${m}/${a}` : String(iso);
}

export function dataHoraBR(valor) {
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
}

// "estudante" pode existir em contas antigas; o servidor trata como aluno.
export const ehEducador = (usuario) => usuario?.tipo === "educador";

// Máscara DD/MM/AAAA enquanto o usuário digita.
export function mascaraData(texto) {
  const d = String(texto).replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// "05/12/2026" -> "2026-12-05" (null se a data não existir no calendário).
export function dataBRparaISO(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(texto).trim());
  if (!m) return null;
  const [, d, mes, a] = m;
  const dt = new Date(Number(a), Number(mes) - 1, Number(d));
  if (dt.getFullYear() !== Number(a) || dt.getMonth() !== Number(mes) - 1 || dt.getDate() !== Number(d)) return null;
  return `${a}-${mes}-${d}`;
}
