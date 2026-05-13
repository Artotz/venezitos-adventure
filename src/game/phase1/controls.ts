import type {
  EventDefinition,
  MapEventType,
  QuestionChoiceDirection,
} from "./types";
import {
  GAMEPAD_AXIS_CODES,
  GAMEPAD_BUTTON_CODES,
  getPressedGamepadCodes,
} from "../gamepadInput";
import { TEXT } from "../i18n";

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

export const PHASE1_GAMEPAD_BUTTON_CODES = GAMEPAD_BUTTON_CODES;
export const PHASE1_GAMEPAD_AXIS_CODES = GAMEPAD_AXIS_CODES;

const GAMEPAD_DRIVE_CODES = {
  fnrUp: [
    PHASE1_GAMEPAD_BUTTON_CODES.dpadLeft,
    PHASE1_GAMEPAD_AXIS_CODES.leftStickLeft,
    PHASE1_GAMEPAD_AXIS_CODES.rightStickLeft,
  ],
  fnrDown: [
    PHASE1_GAMEPAD_BUTTON_CODES.dpadRight,
    PHASE1_GAMEPAD_AXIS_CODES.leftStickRight,
    PHASE1_GAMEPAD_AXIS_CODES.rightStickRight,
  ],
  gearUp: [
    PHASE1_GAMEPAD_BUTTON_CODES.dpadUp,
    PHASE1_GAMEPAD_AXIS_CODES.leftStickUp,
    PHASE1_GAMEPAD_AXIS_CODES.rightStickUp,
  ],
  gearDown: [
    PHASE1_GAMEPAD_BUTTON_CODES.dpadDown,
    PHASE1_GAMEPAD_AXIS_CODES.leftStickDown,
    PHASE1_GAMEPAD_AXIS_CODES.rightStickDown,
  ],
} as const;

export const PHASE1_CONTROL_SCHEMES: Phase1ControlScheme[] = [
  {
    id: "keyboard",
    name: TEXT.phase1.controls.keyboardName,
    driveSummary: TEXT.phase1.controls.keyboardDriveSummary,
    eventSummary: TEXT.phase1.controls.keyboardEventSummary,
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
    name: TEXT.phase1.controls.playstationName,
    driveSummary: TEXT.phase1.controls.gamepadDriveSummary,
    eventSummary: TEXT.phase1.controls.faceButtons,
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
      fnrUp: [...GAMEPAD_DRIVE_CODES.fnrUp],
      fnrDown: [...GAMEPAD_DRIVE_CODES.fnrDown],
      gearUp: [...GAMEPAD_DRIVE_CODES.gearUp],
      gearDown: [...GAMEPAD_DRIVE_CODES.gearDown],
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
    name: TEXT.phase1.controls.xboxName,
    driveSummary: TEXT.phase1.controls.gamepadDriveSummary,
    eventSummary: TEXT.phase1.controls.faceButtons,
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
      fnrUp: [...GAMEPAD_DRIVE_CODES.fnrUp],
      fnrDown: [...GAMEPAD_DRIVE_CODES.fnrDown],
      gearUp: [...GAMEPAD_DRIVE_CODES.gearUp],
      gearDown: [...GAMEPAD_DRIVE_CODES.gearDown],
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

function mergeCodeLists(...codeLists: string[][]) {
  return [...new Set(codeLists.flat())];
}

export function getPhase1UniversalInputScheme(
  visualScheme: Phase1ControlScheme,
): Phase1ControlScheme {
  return {
    ...visualScheme,
    codes: {
      fnrUp: mergeCodeLists(
        ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.fnrUp),
      ),
      fnrDown: mergeCodeLists(
        ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.fnrDown),
      ),
      gearUp: mergeCodeLists(
        ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.gearUp),
      ),
      gearDown: mergeCodeLists(
        ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.gearDown),
      ),
      pickup: mergeCodeLists(
        ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.pickup),
      ),
      dig: mergeCodeLists(
        ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.dig),
      ),
      grease: mergeCodeLists(
        ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.grease),
      ),
      brake: mergeCodeLists(
        ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.brake),
      ),
      question: {
        up: mergeCodeLists(
          ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.question.up),
        ),
        left: mergeCodeLists(
          ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.question.left),
        ),
        right: mergeCodeLists(
          ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.question.right),
        ),
        down: mergeCodeLists(
          ...PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.codes.question.down),
        ),
      },
    },
  };
}

export function getPhase1InitialMessage(scheme: Phase1ControlScheme) {
  return TEXT.phase1.controls.initialMessage(
    scheme.labels.fnrUp,
    scheme.labels.fnrDown,
    scheme.labels.gearUp,
    scheme.labels.gearDown,
    scheme.labels.brake,
  );
}

export function getPhase1StartModalDescription(scheme: Phase1ControlScheme) {
  return TEXT.phase1.controls.startDescription(
    scheme.labels.fnrUp,
    scheme.labels.fnrDown,
    scheme.labels.gearUp,
    scheme.labels.gearDown,
    scheme.eventSummary,
  );
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
    return TEXT.phase1.controls.eventAction.traction(
      definition.title,
      driveStateLabel,
      actionLabel,
    );
  }

  return TEXT.phase1.controls.eventAction.manual(
    definition.title,
    driveStateLabel,
    actionLabel,
  );
}

export function getPressedPhase1GamepadCodes() {
  return getPressedGamepadCodes();
}
