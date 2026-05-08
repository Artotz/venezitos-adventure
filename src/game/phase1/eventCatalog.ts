import {
  DIG_EVENT_KEYS_LABEL,
  GREASE_EVENT_KEYS_LABEL,
  LOW_TRACTION_SPEED,
  PICKUP_EVENT_KEYS_LABEL,
  QUESTION_APPROACH_SLOWDOWN_DISTANCE,
  QUESTION_APPROACH_TARGET_SPEED,
  QUESTION_OPTION_DISPLAY_LABEL,
  QUESTION_OPTION_KEYS_LABEL,
  TRACTION_TOGGLE_KEY_LABEL,
} from "./config";
import { getGreaseAnimationTotalDuration } from "./greaseAnimation";
import type {
  EventDefinition,
  ManualEventDefinition,
  MapEventType,
  QuestionEventDefinition,
  TractionEventDefinition,
} from "./types";

// Edite aqui os eventos concretos da fase 1: textos, pontos e animacoes.
export const EVENT_DEFINITIONS: Record<MapEventType, EventDefinition> = {
  "pickup-load": {
    type: "pickup-load",
    group: "pickup",
    interaction: "manual",
    visualOffset: 360,
    hitboxHalfWidth: 76,
    acceptedCodes: ["ArrowLeft"],
    keyLabel: PICKUP_EVENT_KEYS_LABEL,
    title: "Carregar carregadeira",
    description: "Punhado de terra no caminho",
    hint: "A carregadeira enche a frente sem mexer na traseira.",
    successMessage: "Terra apanhada. A cacamba esta carregada.",
    reward: 180,
    animation: {
      kind: "retro-preset",
      target: "front",
      presetId: "idle",
      label: "Ciclo de cacamba 1",
      lockMovement: false,
      loadStateOnComplete: {
        loadedDirt: true,
      },
    },
  },
  "pickup-unload": {
    type: "pickup-unload",
    group: "pickup",
    interaction: "manual",
    visualOffset: 500,
    hitboxHalfWidth: 300,
    acceptedCodes: ["ArrowLeft"],
    keyLabel: PICKUP_EVENT_KEYS_LABEL,
    title: "Descarregar carregadeira",
    description: "Caminhao esperando a frente",
    hint: "Pare a maquina e descarregue a terra da frente.",
    successMessage: "Terra descarregada no caminhao.",
    reward: 180,
    animation: {
      kind: "retro-preset",
      target: "front",
      presetId: "idle2",
      label: "Ciclo de cacamba 2",
      lockMovement: true,
      loadStateOnComplete: {
        loadedDirt: false,
      },
    },
  },
  "dig-load": {
    type: "dig-load",
    group: "dig",
    interaction: "manual",
    visualOffset: -220,
    hitboxHalfWidth: 82,
    acceptedCodes: ["ArrowRight"],
    keyLabel: DIG_EVENT_KEYS_LABEL,
    title: "Carregar retroescavadeira",
    description: "Ponto de escavacao atras",
    hint: "A retroescavadeira carrega a traseira e persiste no final.",
    successMessage: "Retroescavadeira carregada atras.",
    reward: 180,
    animation: {
      kind: "retro-preset",
      target: "rear",
      presetId: "arm-extended",
      label: "Braco estendido",
      lockMovement: true,
      spriteSwapAtMs: 2000 + 1500,
      loadStateOnComplete: {
        rearLoaded: true,
      },
    },
  },
  "dig-unload": {
    type: "dig-unload",
    group: "dig",
    interaction: "manual",
    visualOffset: -220,
    hitboxHalfWidth: 94,
    acceptedCodes: ["ArrowRight"],
    keyLabel: DIG_EVENT_KEYS_LABEL,
    title: "Descarregar retroescavadeira",
    description: "Vala para descarregar atras",
    hint: "A retro abre e descarrega atras sem mexer na frente.",
    successMessage: "Retroescavadeira descarregada na vala.",
    reward: 180,
    animation: {
      kind: "retro-preset",
      target: "rear",
      presetId: "arm-unload",
      label: "Descarregando traseira",
      lockMovement: true,
      spriteSwapAtMs: 2400,
      loadStateOnComplete: {
        rearLoaded: false,
      },
    },
  },
  grease: {
    type: "grease",
    group: "grease",
    interaction: "manual",
    visualOffset: 40,
    hitboxHalfWidth: 92,
    acceptedCodes: ["ArrowUp"],
    keyLabel: GREASE_EVENT_KEYS_LABEL,
    title: "Aplicar graxa",
    description: "Ponto de lubrificacao no caminho",
    hint: "A maquina desacelera, para para a graxa e retoma depois.",
    successMessage: "Graxa aplicada. Volte para a operação.",
    reward: 180,
    animation: {
      kind: "grease",
      label: "Aplicando graxa",
      lockMovement: true,
      durationMs: getGreaseAnimationTotalDuration(),
    },
  },
  traction: {
    type: "traction",
    group: "traction",
    interaction: "traction-zone",
    visualOffset: 0,
    hitboxHalfWidth: 175,
    title: "Ativar 4x4",
    description: "Lamacal no caminho",
    hint: "Use ↓ para ativar o 4x4 no trecho escorregadio.",
    successMessage: "Trecho vencido com o 4x4 ativado.",
    toggleCodes: ["ArrowDown"],
    toggleKeyLabel: TRACTION_TOGGLE_KEY_LABEL,
    activeSpeed: LOW_TRACTION_SPEED,
    drainPerFrame: 1,
    rewardPerFrame: 1,
    failureMessage: "Voce atravessou o trecho sem usar o 4x4.",
  },
  question: {
    type: "question",
    group: "question",
    interaction: "question-modal",
    visualOffset: 30,
    hitboxHalfWidth: 86,
    title: "Parada de avaliacao",
    description: "Instrutor bloqueando a pista",
    hint: "A maquina para e voce responde seguindo ↑ ← ↓ → no modal.",
    successMessage: "Pergunta respondida.",
    modalTitle: "Pergunta do instrutor",
    selectionHint: `Use ${QUESTION_OPTION_DISPLAY_LABEL} para responder`,
    approachSlowdownDistance: QUESTION_APPROACH_SLOWDOWN_DISTANCE,
    approachTargetSpeed: QUESTION_APPROACH_TARGET_SPEED,
  },
};

export function getEventDefinition(type: MapEventType) {
  return EVENT_DEFINITIONS[type];
}

export function getTractionEventDefinition(): TractionEventDefinition {
  return EVENT_DEFINITIONS.traction as TractionEventDefinition;
}

export function isManualEventDefinition(
  definition: EventDefinition,
): definition is ManualEventDefinition {
  return definition.interaction === "manual";
}

export function isTractionEventDefinition(
  definition: EventDefinition,
): definition is TractionEventDefinition {
  return definition.interaction === "traction-zone";
}

export function isQuestionEventDefinition(
  definition: EventDefinition,
): definition is QuestionEventDefinition {
  return definition.interaction === "question-modal";
}

export function getEventActivationMessage(definition: EventDefinition) {
  if (isManualEventDefinition(definition)) {
    return `${definition.title}: pressione ${definition.keyLabel}.`;
  }

  if (isTractionEventDefinition(definition)) {
    return `${definition.title}: use ${definition.toggleKeyLabel} no trecho.`;
  }

  return `${definition.title}: responda com ${QUESTION_OPTION_KEYS_LABEL}.`;
}
