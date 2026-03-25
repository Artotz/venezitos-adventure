import {
  EVENT_BUTTON,
  EVENT_BUTTON_LABEL,
  LOW_TRACTION_SPEED,
  QUESTION_APPROACH_SLOWDOWN_DISTANCE,
  QUESTION_APPROACH_TARGET_SPEED,
  QUESTION_OPTION_KEYS_LABEL,
  TRACTION_TOGGLE_KEY,
  TRACTION_TOGGLE_KEY_LABEL,
} from './config'
import type {
  EventDefinition,
  ManualEventDefinition,
  MapEventType,
  QuestionEventDefinition,
  TractionEventDefinition,
} from './types'

// Edite aqui os eventos concretos da fase 1: textos, pontos e animacoes.
export const EVENT_DEFINITIONS: Record<MapEventType, EventDefinition> = {
  'pickup-load': {
    type: 'pickup-load',
    group: 'pickup',
    interaction: 'manual',
    visualOffset: 360,
    key: EVENT_BUTTON,
    title: 'Carregar carregadeira',
    description: 'Punhado de terra no caminho',
    hint: 'A carregadeira enche a frente sem mexer na traseira.',
    successMessage: 'Terra apanhada. A cacamba esta carregada.',
    reward: 180,
    animation: {
      target: 'front',
      presetId: 'idle',
      label: 'Ciclo de cacamba 1',
      lockMovement: false,
      loadStateOnComplete: {
        loadedDirt: true,
      },
    },
  },
  'pickup-unload': {
    type: 'pickup-unload',
    group: 'pickup',
    interaction: 'manual',
    visualOffset: 360,
    key: EVENT_BUTTON,
    title: 'Descarregar carregadeira',
    description: 'Caminhao esperando a frente',
    hint: 'Pare a maquina e descarregue a terra da frente.',
    successMessage: 'Terra descarregada no caminhao.',
    reward: 180,
    animation: {
      target: 'front',
      presetId: 'idle2',
      label: 'Ciclo de cacamba 2',
      lockMovement: true,
      loadStateOnComplete: {
        loadedDirt: false,
      },
    },
  },
  'dig-load': {
    type: 'dig-load',
    group: 'dig',
    interaction: 'manual',
    visualOffset: -220,
    key: EVENT_BUTTON,
    title: 'Carregar retroescavadeira',
    description: 'Ponto de escavacao atras',
    hint: 'A retroescavadeira carrega a traseira e persiste no final.',
    successMessage: 'Retroescavadeira carregada atras.',
    reward: 180,
    animation: {
      target: 'rear',
      presetId: 'arm-extended',
      label: 'Braco estendido',
      lockMovement: true,
      loadStateOnComplete: {
        rearLoaded: true,
      },
    },
  },
  'dig-unload': {
    type: 'dig-unload',
    group: 'dig',
    interaction: 'manual',
    visualOffset: -220,
    key: EVENT_BUTTON,
    title: 'Descarregar retroescavadeira',
    description: 'Vala para descarregar atras',
    hint: 'A retro abre e descarrega atras sem mexer na frente.',
    successMessage: 'Retroescavadeira descarregada na vala.',
    reward: 180,
    animation: {
      target: 'rear',
      presetId: 'arm-unload',
      label: 'Descarregando traseira',
      lockMovement: true,
      loadStateOnComplete: {
        rearLoaded: false,
      },
    },
  },
  traction: {
    type: 'traction',
    group: 'traction',
    interaction: 'traction-zone',
    visualOffset: 80,
    title: 'Bloqueio de diferencial',
    description: 'Lamacal no caminho',
    hint: 'Use o bloqueio de diferencial no trecho escorregadio.',
    successMessage: 'Trecho vencido com o bloqueio de diferencial.',
    toggleKey: TRACTION_TOGGLE_KEY,
    activeSpeed: LOW_TRACTION_SPEED,
    drainPerFrame: 1,
    rewardPerFrame: 1,
    failureMessage: 'Voce atravessou o trecho sem usar o bloqueio.',
  },
  question: {
    type: 'question',
    group: 'question',
    interaction: 'question-modal',
    visualOffset: 30,
    title: 'Parada de avaliacao',
    description: 'Instrutor bloqueando a pista',
    hint: 'A maquina para e voce responde usando WASD.',
    successMessage: 'Pergunta respondida.',
    modalTitle: 'Pergunta do instrutor',
    selectionHint: `Use ${QUESTION_OPTION_KEYS_LABEL} para responder`,
    approachSlowdownDistance: QUESTION_APPROACH_SLOWDOWN_DISTANCE,
    approachTargetSpeed: QUESTION_APPROACH_TARGET_SPEED,
  },
}

export function getEventDefinition(type: MapEventType) {
  return EVENT_DEFINITIONS[type]
}

export function getTractionEventDefinition(): TractionEventDefinition {
  return EVENT_DEFINITIONS.traction as TractionEventDefinition
}

export function isManualEventDefinition(
  definition: EventDefinition,
): definition is ManualEventDefinition {
  return definition.interaction === 'manual'
}

export function isTractionEventDefinition(
  definition: EventDefinition,
): definition is TractionEventDefinition {
  return definition.interaction === 'traction-zone'
}

export function isQuestionEventDefinition(
  definition: EventDefinition,
): definition is QuestionEventDefinition {
  return definition.interaction === 'question-modal'
}

export function getEventActivationMessage(definition: EventDefinition) {
  if (isManualEventDefinition(definition)) {
    return `${definition.title}: pressione ${EVENT_BUTTON_LABEL}.`
  }

  if (isTractionEventDefinition(definition)) {
    return `${definition.title}: use ${TRACTION_TOGGLE_KEY_LABEL} no trecho.`
  }

  return `${definition.title}: responda com ${QUESTION_OPTION_KEYS_LABEL}.`
}
