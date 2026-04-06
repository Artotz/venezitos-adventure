import { PHASE1_START_MODAL_HINT } from "./config";
import type { Phase1Question, Phase1SpeechModalState } from "./types";

export const PHASE1_MANIFESTO_MODAL: Phase1SpeechModalState = {
  title: "introdução do jogo",
  speech: "Oi, eu sou o Venezito!",
  body: [
    "Neste jogo, voce vai dirigir a retroescavadeira para a esquerda e reagir aos eventos no momento certo.",
    "Ao longo do percurso, voce vai usar os comandos da maquina para carregar, cavar, engraxar e ativar o 4x4 quando o terreno pedir mais tração.",
    "Tambem vao aparecer perguntas rapidas de seguranca e operação. Elas servem para reforcar o que cada situacao exige durante a fase.",
    "Seu objetivo e manter a maquina em movimento, acertar os comandos dentro da area certa e acumular pontos enquanto aprende como cada parte da operação funciona.",
  ].join("\n\n"),
  continueHint: PHASE1_START_MODAL_HINT,
  mood: "neutral",
};

export function createQuestionFeedbackModal(
  question: Phase1Question,
  outcome: "success" | "failure",
): Phase1SpeechModalState {
  const correctAnswer = question.choices[question.correctDirection].label;

  return {
    title: outcome === "success" ? "Resposta Certa!" : "Resposta errada!",
    speech: outcome === "success" ? "Muito bem!" : "Poxa...",
    body:
      outcome === "success"
        ? `Essa é a resposta certa, pois ${question.explanation}`
        : `A resposta certa é "${correctAnswer}" porque ${question.explanation}`,
    continueHint: PHASE1_START_MODAL_HINT,
    mood: outcome === "success" ? "happy" : "sad",
  };
}

export function createQuestionIntroModal(): Phase1SpeechModalState {
  return {
    title: "Pergunta do instrutor",
    speech: "Hora da manutenção!",
    body: "Antes de seguir com a operação, vamos fazer uma parada rapida de conferencia. Pense como um operador atento: observe a situacao, revise o procedimento e responda usando as setas.",
    continueHint: PHASE1_START_MODAL_HINT,
    mood: "neutral",
  };
}
