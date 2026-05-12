import type {
  EventDefinition,
  MapEventType,
  QuestionChoiceDirection,
} from "./types";

export type Phase1ControlSchemeId = "keyboard" | "playstation" | "xbox";

export type Phase1ControlScheme = {
  id: Phase1ControlSchemeId;
  name: string;
  driveSummary: string;
  eventSummary: string;
  labels: {
    fnrUp: string;
    fnrDown: string;
    gearUp: string;
    gearDown: string;
    pickup: string;
    dig: string;
    grease: string;
    brake: string;
    question: Record<QuestionChoiceDirection, string>;
  };
  codes: {
    fnrUp: string[];
    fnrDown: string[];
    gearUp: string[];
    gearDown: string[];
    pickup: string[];
    dig: string[];
    grease: string[];
    brake: string[];
    question: Record<QuestionChoiceDirection, string[]>;
  };
};

export const PHASE1_GAMEPAD_BUTTON_CODES = {
  faceBottom: "GamepadButton0",
  faceRight: "GamepadButton1",
  faceLeft: "GamepadButton2",
  faceTop: "GamepadButton3",
  dpadUp: "GamepadButton12",
  dpadDown: "GamepadButton13",
  dpadLeft: "GamepadButton14",
  dpadRight: "GamepadButton15",
} as const;

export const PHASE1_CONTROL_SCHEMES: Phase1ControlScheme[] = [
  {
    id: "keyboard",
    name: "WASD + setas",
    driveSummary: "FNR em A/D, marchas em W/S",
    eventSummary: "Eventos nas setas",
    labels: {
      fnrUp: "A",
      fnrDown: "D",
      gearUp: "W",
      gearDown: "S",
      pickup: "←",
      dig: "→",
      grease: "↑",
      brake: "↓",
      question: {
        up: "↑",
        left: "←",
        right: "→",
        down: "↓",
      },
    },
    codes: {
      fnrUp: ["KeyA"],
      fnrDown: ["KeyD"],
      gearUp: ["KeyW"],
      gearDown: ["KeyS"],
      pickup: ["ArrowLeft"],
      dig: ["ArrowRight"],
      grease: ["ArrowUp"],
      brake: ["ArrowDown"],
      question: {
        up: ["ArrowUp"],
        left: ["ArrowLeft"],
        right: ["ArrowRight"],
        down: ["ArrowDown"],
      },
    },
  },
  {
    id: "playstation",
    name: "Setas + PlayStation",
    driveSummary: "FNR e marchas nas setas",
    eventSummary: "Eventos nos face buttons",
    labels: {
      fnrUp: "←",
      fnrDown: "→",
      gearUp: "↑",
      gearDown: "↓",
      pickup: "□",
      dig: "○",
      grease: "△",
      brake: "×",
      question: {
        up: "△",
        left: "□",
        right: "○",
        down: "×",
      },
    },
    codes: {
      fnrUp: ["ArrowLeft", PHASE1_GAMEPAD_BUTTON_CODES.dpadLeft],
      fnrDown: ["ArrowRight", PHASE1_GAMEPAD_BUTTON_CODES.dpadRight],
      gearUp: ["ArrowUp", PHASE1_GAMEPAD_BUTTON_CODES.dpadUp],
      gearDown: ["ArrowDown", PHASE1_GAMEPAD_BUTTON_CODES.dpadDown],
      pickup: [PHASE1_GAMEPAD_BUTTON_CODES.faceLeft],
      dig: [PHASE1_GAMEPAD_BUTTON_CODES.faceRight],
      grease: [PHASE1_GAMEPAD_BUTTON_CODES.faceTop],
      brake: [PHASE1_GAMEPAD_BUTTON_CODES.faceBottom],
      question: {
        up: [PHASE1_GAMEPAD_BUTTON_CODES.faceTop],
        left: [PHASE1_GAMEPAD_BUTTON_CODES.faceLeft],
        right: [PHASE1_GAMEPAD_BUTTON_CODES.faceRight],
        down: [PHASE1_GAMEPAD_BUTTON_CODES.faceBottom],
      },
    },
  },
  {
    id: "xbox",
    name: "Setas + Xbox",
    driveSummary: "FNR e marchas nas setas",
    eventSummary: "Eventos nos face buttons",
    labels: {
      fnrUp: "←",
      fnrDown: "→",
      gearUp: "↑",
      gearDown: "↓",
      pickup: "X",
      dig: "B",
      grease: "Y",
      brake: "A",
      question: {
        up: "Y",
        left: "X",
        right: "B",
        down: "A",
      },
    },
    codes: {
      fnrUp: ["ArrowLeft", PHASE1_GAMEPAD_BUTTON_CODES.dpadLeft],
      fnrDown: ["ArrowRight", PHASE1_GAMEPAD_BUTTON_CODES.dpadRight],
      gearUp: ["ArrowUp", PHASE1_GAMEPAD_BUTTON_CODES.dpadUp],
      gearDown: ["ArrowDown", PHASE1_GAMEPAD_BUTTON_CODES.dpadDown],
      pickup: [PHASE1_GAMEPAD_BUTTON_CODES.faceLeft],
      dig: [PHASE1_GAMEPAD_BUTTON_CODES.faceRight],
      grease: [PHASE1_GAMEPAD_BUTTON_CODES.faceTop],
      brake: [PHASE1_GAMEPAD_BUTTON_CODES.faceBottom],
      question: {
        up: [PHASE1_GAMEPAD_BUTTON_CODES.faceTop],
        left: [PHASE1_GAMEPAD_BUTTON_CODES.faceLeft],
        right: [PHASE1_GAMEPAD_BUTTON_CODES.faceRight],
        down: [PHASE1_GAMEPAD_BUTTON_CODES.faceBottom],
      },
    },
  },
];

export const DEFAULT_PHASE1_CONTROL_SCHEME_ID: Phase1ControlSchemeId =
  "keyboard";

export function getPhase1ControlScheme(id: Phase1ControlSchemeId) {
  return (
    PHASE1_CONTROL_SCHEMES.find((scheme) => scheme.id === id) ??
    PHASE1_CONTROL_SCHEMES[0]
  );
}

export function getNextPhase1ControlSchemeId(id: Phase1ControlSchemeId) {
  const currentIndex = PHASE1_CONTROL_SCHEMES.findIndex(
    (scheme) => scheme.id === id,
  );
  const nextIndex = (Math.max(0, currentIndex) + 1) % PHASE1_CONTROL_SCHEMES.length;

  return PHASE1_CONTROL_SCHEMES[nextIndex].id;
}

export function getPhase1InitialMessage(scheme: Phase1ControlScheme) {
  return `Use ${scheme.labels.fnrUp}/${scheme.labels.fnrDown} no FNR, ${scheme.labels.gearUp}/${scheme.labels.gearDown} para marcha e ${scheme.labels.brake} para frear.`;
}

export function getPhase1StartModalDescription(scheme: Phase1ControlScheme) {
  return `Use ${scheme.labels.fnrUp}/${scheme.labels.fnrDown} para alternar F, N e R.
Use ${scheme.labels.gearUp}/${scheme.labels.gearDown} para trocar marcha e ${scheme.eventSummary.toLowerCase()}.`;
}

export function getPhase1QuestionOptionLabel(scheme: Phase1ControlScheme) {
  return [
    scheme.labels.question.up,
    scheme.labels.question.left,
    scheme.labels.question.down,
    scheme.labels.question.right,
  ].join(" ");
}

export function getPhase1EventActionCodes(
  eventType: MapEventType,
  scheme: Phase1ControlScheme,
) {
  if (eventType === "pickup-load" || eventType === "pickup-unload") {
    return scheme.codes.pickup;
  }

  if (eventType === "dig-load" || eventType === "dig-unload") {
    return scheme.codes.dig;
  }

  if (eventType === "traction") {
    return scheme.codes.brake;
  }

  return scheme.codes.grease;
}

export function getPhase1EventActionLabel(
  definition: EventDefinition,
  scheme: Phase1ControlScheme,
) {
  if (definition.type === "pickup-load" || definition.type === "pickup-unload") {
    return scheme.labels.pickup;
  }

  if (definition.type === "dig-load" || definition.type === "dig-unload") {
    return scheme.labels.dig;
  }

  if (definition.type === "traction") {
    return scheme.labels.brake;
  }

  return scheme.labels.grease;
}

export function getPhase1QuestionDirectionFromCode(
  code: string,
  scheme: Phase1ControlScheme,
) {
  const entries = Object.entries(scheme.codes.question) as Array<
    [QuestionChoiceDirection, string[]]
  >;

  return entries.find(([, codes]) => codes.includes(code))?.[0] ?? null;
}

export function getPhase1ContinueCodes(scheme: Phase1ControlScheme) {
  return [
    ...scheme.codes.question.up,
    ...scheme.codes.question.left,
    ...scheme.codes.question.right,
    ...scheme.codes.question.down,
    ...scheme.codes.grease,
    ...scheme.codes.pickup,
    ...scheme.codes.dig,
    ...scheme.codes.brake,
  ];
}

export function getPhase1EventActivationMessage(
  definition: EventDefinition,
  scheme: Phase1ControlScheme,
  driveStateLabel: string,
) {
  const actionLabel = getPhase1EventActionLabel(definition, scheme);

  if (definition.interaction === "traction-zone") {
    return `${definition.title}: use ${driveStateLabel} e ${actionLabel} no trecho.`;
  }

  return `${definition.title}: use ${driveStateLabel} e pressione ${actionLabel}.`;
}

export function getPressedPhase1GamepadCodes() {
  if (typeof navigator === "undefined" || !navigator.getGamepads) {
    return [];
  }

  const pressedCodes = new Set<string>();

  for (const gamepad of navigator.getGamepads()) {
    if (!gamepad) {
      continue;
    }

    gamepad.buttons.forEach((button, index) => {
      if (button.pressed) {
        pressedCodes.add(`GamepadButton${index}`);
      }
    });
  }

  return [...pressedCodes];
}
