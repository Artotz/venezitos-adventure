import {
  DIG_EVENT_KEYS_LABEL,
  GREASE_EVENT_KEYS_LABEL,
  LOW_TRACTION_SPEED,
  PICKUP_EVENT_KEYS_LABEL,
  QUESTION_APPROACH_SLOWDOWN_DISTANCE,
  QUESTION_APPROACH_TARGET_SPEED,
  QUESTION_OPTION_DISPLAY_LABEL,
  TRACTION_TOGGLE_KEY_LABEL,
} from "./config";
import { TEXT } from "../i18n";
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
    title: TEXT.phase1.events.pickupLoad.title,
    description: TEXT.phase1.events.pickupLoad.description,
    hint: TEXT.phase1.events.pickupLoad.hint,
    successMessage: TEXT.phase1.events.pickupLoad.success,
    requiredDriveState: { mode: "forward", gear: 1 },
    reward: 180,
    animation: {
      kind: "retro-preset",
      target: "front",
      presetId: "idle",
      label: TEXT.phase1.events.pickupLoad.animation,
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
    title: TEXT.phase1.events.pickupUnload.title,
    description: TEXT.phase1.events.pickupUnload.description,
    hint: TEXT.phase1.events.pickupUnload.hint,
    successMessage: TEXT.phase1.events.pickupUnload.success,
    requiredDriveState: { mode: "neutral" },
    reward: 180,
    animation: {
      kind: "retro-preset",
      target: "front",
      presetId: "idle2",
      label: TEXT.phase1.events.pickupUnload.animation,
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
    title: TEXT.phase1.events.digLoad.title,
    description: TEXT.phase1.events.digLoad.description,
    hint: TEXT.phase1.events.digLoad.hint,
    successMessage: TEXT.phase1.events.digLoad.success,
    requiredDriveState: { mode: "neutral" },
    reward: 180,
    animation: {
      kind: "retro-preset",
      target: "rear",
      presetId: "arm-extended",
      label: TEXT.phase1.events.digLoad.animation,
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
    title: TEXT.phase1.events.digUnload.title,
    description: TEXT.phase1.events.digUnload.description,
    hint: TEXT.phase1.events.digUnload.hint,
    successMessage: TEXT.phase1.events.digUnload.success,
    requiredDriveState: { mode: "neutral" },
    reward: 180,
    animation: {
      kind: "retro-preset",
      target: "rear",
      presetId: "arm-unload",
      label: TEXT.phase1.events.digUnload.animation,
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
    title: TEXT.phase1.events.grease.title,
    requiredDriveState: { mode: "neutral" },
    description: TEXT.phase1.events.grease.description,
    hint: TEXT.phase1.events.grease.hint,
    successMessage: TEXT.phase1.events.grease.success,
    reward: 180,
    animation: {
      kind: "grease",
      label: TEXT.phase1.events.grease.animation,
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
    title: TEXT.phase1.events.traction.title,
    description: TEXT.phase1.events.traction.description,
    hint: TEXT.phase1.events.traction.hint(TRACTION_TOGGLE_KEY_LABEL),
    successMessage: TEXT.phase1.events.traction.success,
    requiredDriveState: { mode: "neutral" },
    toggleCodes: ["ArrowDown"],
    toggleKeyLabel: TRACTION_TOGGLE_KEY_LABEL,
    activeSpeed: LOW_TRACTION_SPEED,
    drainPerFrame: 1,
    rewardPerFrame: 1,
    failureMessage: TEXT.phase1.events.traction.failure,
  },
  question: {
    type: "question",
    group: "question",
    interaction: "question-modal",
    visualOffset: 30,
    hitboxHalfWidth: 86,
    title: TEXT.phase1.events.question.title,
    description: TEXT.phase1.events.question.description,
    hint: TEXT.phase1.events.question.hint(QUESTION_OPTION_DISPLAY_LABEL),
    successMessage: TEXT.phase1.events.question.success,
    requiredDriveState: { mode: "neutral" },
    triggerCodes: ["ArrowUp"],
    triggerKeyLabel: GREASE_EVENT_KEYS_LABEL,
    modalTitle: TEXT.phase1.events.question.modalTitle,
    selectionHint: TEXT.phase1.events.question.selectionHint(
      QUESTION_OPTION_DISPLAY_LABEL,
    ),
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
  const driveStateLabel = getRequiredDriveStateLabel(
    definition.requiredDriveState,
  );

  if (isManualEventDefinition(definition)) {
    return TEXT.phase1.controls.eventAction.manual(
      definition.title,
      driveStateLabel,
      definition.keyLabel,
    );
  }

  if (isTractionEventDefinition(definition)) {
    return TEXT.phase1.controls.eventAction.traction(
      definition.title,
      driveStateLabel,
      definition.toggleKeyLabel,
    );
  }

  return TEXT.phase1.controls.eventAction.manual(
    definition.title,
    driveStateLabel,
    definition.triggerKeyLabel,
  );
}

export function getRequiredDriveStateLabel(
  requiredDriveState: EventDefinition["requiredDriveState"],
) {
  if (requiredDriveState.mode === "neutral") {
    return "N";
  }

  return `${requiredDriveState.mode === "forward" ? "F" : "R"}${
    requiredDriveState.gear
  }`;
}
