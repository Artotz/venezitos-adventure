export const CANVAS_WIDTH = 1560;
export const CANVAS_HEIGHT = 720;
export const GROUND_Y = 500;
export const PLAYER_SCREEN_X = 980;
export const PLAYER_HIT_LINE_X = PLAYER_SCREEN_X - 200;
export const BASE_SPEED = 280;
export const LOW_TRACTION_SPEED = 92;
export const FRONT_LOAD_SPEED = 148;
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
export const INITIAL_MESSAGE =
  "Use A/D no FNR, W/S para marcha e ↓ para frear.";
export const PHASE1_MENU_TITLE = "Treinando com o Venezito";
export const PHASE1_MENU_DESCRIPTION =
  "Entre na retroescavadeira e aprenda tudo sobre a operação!";
export const PHASE1_START_MODAL_TITLE = "Controles da fase";
export const PHASE1_START_MODAL_DESCRIPTION = `Use A/D para alternar F, N e R.
Use W/S para trocar marcha e as setas para operar.`;
export const PHASE1_START_MODAL_HINT =
  "Pressione uma seta para continuar";
