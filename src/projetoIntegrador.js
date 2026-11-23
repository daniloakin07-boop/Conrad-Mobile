// ============================================================================
// src/projetoIntegrador.js — contagem regressiva do Projeto Integrador
// Cálculo puro (calcularRestante) e hook (useContagemRegressiva), usados por ContadorProjeto.
// ============================================================================
import { useEffect, useState } from "react";

// Porte de JS/contador-projeto.js do Web.
// 24/11/2026 às 14h45 no horário de Brasília (UTC-03:00) == 17h45 UTC.
// Usar Date.UTC fixa o MESMO instante em qualquer fuso do aparelho.
export const DATA_APRESENTACAO = Date.UTC(2026, 10, 24, 17, 45, 0);

const SEGUNDO = 1000;
const MINUTO = SEGUNDO * 60;
const HORA = MINUTO * 60;
const DIA = HORA * 24;

const dois = (n) => String(n).padStart(2, "0");

// Função pura (testável): calcula o que falta até a apresentação.
export function calcularRestante(agora = Date.now(), alvo = DATA_APRESENTACAO) {
  const diferenca = alvo - agora;
  if (diferenca <= 0) {
    return { dias: "00", horas: "00", minutos: "00", segundos: "00", encerrado: true };
  }
  return {
    dias: dois(Math.floor(diferenca / DIA)),
    horas: dois(Math.floor((diferenca % DIA) / HORA)),
    minutos: dois(Math.floor((diferenca % HORA) / MINUTO)),
    segundos: dois(Math.floor((diferenca % MINUTO) / SEGUNDO)),
    encerrado: false,
  };
}

// Atualiza a cada segundo e para de agendar quando chega a zero (como o clearInterval do Web).
export function useContagemRegressiva(alvo = DATA_APRESENTACAO) {
  const [restante, setRestante] = useState(() => calcularRestante(Date.now(), alvo));

  useEffect(() => {
    const atual = calcularRestante(Date.now(), alvo);
    setRestante(atual);
    if (atual.encerrado) return undefined;

    const intervalo = setInterval(() => {
      const proximo = calcularRestante(Date.now(), alvo);
      setRestante(proximo);
      if (proximo.encerrado) clearInterval(intervalo);
    }, 1000);
    return () => clearInterval(intervalo);
  }, [alvo]);

  return restante;
}
