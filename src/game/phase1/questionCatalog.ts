import type { Phase1Question } from "./types";

export const QUESTION_CATALOG: Phase1Question[] = [
  {
    id: "question-safety-lock",
    prompt:
      "Ao se aproximar de um ponto de operacao, qual acao ajuda a controlar melhor a maquina?",
    choices: {
      up: { label: "Subir marcha e manter velocidade" },
      left: { label: "Virar bruscamente para aliviar a frente" },
      right: { label: "Acelerar para passar mais rapido" },
      down: { label: "Frear e reduzir a aproximacao" },
    },
    correctDirection: "down",
    explanation:
      "frear antes do ponto de operacao reduz a velocidade e facilita acertar o comando dentro da area correta.",
    successMessage: "Resposta correta. O instrutor liberou a passagem.",
    failureMessage:
      "Resposta errada. O instrutor travou a pontuação do evento.",
    reward: 220,
    penalty: 120,
  },
  {
    id: "question-loader-height",
    prompt:
      "Ao se deslocar com a cacamba frontal carregada, qual postura e mais segura?",
    choices: {
      up: { label: "Manter a cacamba baixa e estavel" },
      left: { label: "Levantar ao maximo para enxergar melhor" },
      right: { label: "Balancar a frente para distribuir o peso" },
      down: { label: "Andar de re para aliviar o eixo dianteiro" },
    },
    correctDirection: "up",
    explanation:
      "manter a cacamba baixa e estavel melhora o equilibrio da maquina e deixa o deslocamento mais seguro.",
    successMessage: "Resposta correta. A operação continua.",
    failureMessage: "Resposta errada. A avaliacao do operador caiu.",
    reward: 220,
    penalty: 120,
  },
  {
    id: "question-rear-dig",
    prompt:
      "Na retro traseira, qual atitude reduz risco ao descarregar material em uma vala?",
    choices: {
      up: { label: "Girar o braco acima da cabine com velocidade maxima" },
      left: { label: "Confirmar estabilidade antes de descarregar" },
      right: { label: "Descarregar com a maquina ainda em movimento" },
      down: { label: "Abrir a vala sem observar a area ao redor" },
    },
    correctDirection: "left",
    explanation:
      "confirmar a estabilidade antes de descarregar reduz o risco de deslocamento da maquina e de manobras inseguras na vala.",
    successMessage: "Resposta correta. A area foi liberada.",
    failureMessage: "Resposta errada. O fiscal marcou a manobra como falha.",
    reward: 220,
    penalty: 120,
  },
];

export function getQuestionFromCatalog(cursor: number) {
  return QUESTION_CATALOG[cursor % QUESTION_CATALOG.length];
}
