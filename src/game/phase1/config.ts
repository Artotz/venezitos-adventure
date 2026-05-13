import { TEXT } from "../i18n";

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const GROUND_Y = 500;
export const PLAYER_SCREEN_X = Math.round(CANVAS_WIDTH * 0.63);
export const PLAYER_HIT_LINE_X = PLAYER_SCREEN_X - 200;
export const PHASE1_SPEED_MULTIPLIER = 10;
export const PHASE1_FORWARD_GEAR_SPEEDS_KMH = [5.4, 10.1, 20.7, 37.1] as const;
export const PHASE1_REVERSE_GEAR_SPEEDS_KMH = [6.9, 12.7] as const;
export const PHASE1_FORWARD_GEAR_SPEEDS = PHASE1_FORWARD_GEAR_SPEEDS_KMH.map(
  (speedKmh) => speedKmh * PHASE1_SPEED_MULTIPLIER,
);
export const PHASE1_REVERSE_GEAR_SPEEDS = PHASE1_REVERSE_GEAR_SPEEDS_KMH.map(
  (speedKmh) => -speedKmh * PHASE1_SPEED_MULTIPLIER,
);
export const BASE_SPEED = 37.1 * PHASE1_SPEED_MULTIPLIER;
export const LOW_TRACTION_SPEED = 12.7 * PHASE1_SPEED_MULTIPLIER;
export const FRONT_LOAD_SPEED = 20.7 * PHASE1_SPEED_MULTIPLIER;
export const EVENT_SPAWN_MARGIN = 500;
export const EVENT_DESPAWN_MARGIN = 1200;
export const PICKUP_EVENT_KEYS_LABEL = "←";
export const DIG_EVENT_KEYS_LABEL = "→";
export const GREASE_EVENT_KEYS_LABEL = "↑";
export const TRACTION_TOGGLE_KEY_LABEL = "↓";
export const TRACTION_SCORE_LENIENCY_MARGIN = 140;
export const QUESTION_OPTION_KEYS_LABEL = "↑ ← ↓ →";
export const QUESTION_OPTION_DISPLAY_LABEL = "↑ ← ↓ →";
export const PHASE1_CONTINUE_CODES = [
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
] as const;
export const QUESTION_APPROACH_SLOWDOWN_DISTANCE = 320;
export const QUESTION_APPROACH_TARGET_SPEED = 42;
export const QUESTION_MODAL_OPEN_SPEED_THRESHOLD = 6;
export const INITIAL_MESSAGE = TEXT.phase1.initialMessage(TRACTION_TOGGLE_KEY_LABEL);
export const PHASE1_MENU_TITLE = TEXT.phase1.menuTitle;
export const PHASE1_MENU_DESCRIPTION = TEXT.phase1.menuDescription;
export const PHASE1_START_MODAL_TITLE = TEXT.phase1.startModalTitle;
export const PHASE1_START_MODAL_DESCRIPTION =
  TEXT.phase1.startModalDefaultDescription;
export const PHASE1_START_MODAL_HINT = TEXT.phase1.startModalHint;
export const PHASE1_HOURMETER_TARGET_HOURS = 2000;
export const PHASE1_HOURMETER_REAL_DURATION_SECONDS = 120;
export const PHASE1_HOURMETER_HOURS_PER_SECOND =
  PHASE1_HOURMETER_TARGET_HOURS / PHASE1_HOURMETER_REAL_DURATION_SECONDS;
export const PHASE1_HIGHSCORE_STORAGE_KEY =
  "venezitos-adventure:phase1-highscore";
