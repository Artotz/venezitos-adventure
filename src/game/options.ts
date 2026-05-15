import {
  DEFAULT_PHASE1_CONTROL_SCHEME_ID,
  type Phase1ControlSchemeId,
  PHASE1_CONTROL_SCHEMES,
} from "./phase1/controls";

const PHASE1_CONTROL_SCHEME_STORAGE_KEY =
  "venezitos-adventure:phase1-control-scheme";

const VALID_CONTROL_SCHEME_IDS = new Set<Phase1ControlSchemeId>(
  PHASE1_CONTROL_SCHEMES.map((scheme) => scheme.id),
);

export function readPhase1ControlSchemeId(): Phase1ControlSchemeId {
  if (typeof window === "undefined") {
    return DEFAULT_PHASE1_CONTROL_SCHEME_ID;
  }

  try {
    const storedValue = window.localStorage.getItem(
      PHASE1_CONTROL_SCHEME_STORAGE_KEY,
    );

    if (storedValue && VALID_CONTROL_SCHEME_IDS.has(storedValue as Phase1ControlSchemeId)) {
      return storedValue as Phase1ControlSchemeId;
    }
  } catch {
    // Ignora falhas de armazenamento local para não interromper o jogo.
  }

  return DEFAULT_PHASE1_CONTROL_SCHEME_ID;
}

export function writePhase1ControlSchemeId(id: Phase1ControlSchemeId) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PHASE1_CONTROL_SCHEME_STORAGE_KEY, id);
  } catch {
    // Ignora falhas de armazenamento local para não interromper o jogo.
  }
}
