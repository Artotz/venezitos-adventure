export const CANVAS_WIDTH = 1560;
export const CANVAS_HEIGHT = 720;
export const GROUND_Y = 500;
export const PLAYER_SCREEN_X = 980;
export const PLAYER_HIT_LINE_X = PLAYER_SCREEN_X - 200;
export const BASE_SPEED = 220;
export const LOW_TRACTION_SPEED = 72;
export const FRONT_LOAD_SPEED = 118;
export const EVENT_SPAWN_MARGIN = 500;
export const EVENT_DESPAWN_MARGIN = 1200;
export const PICKUP_EVENT_KEYS_LABEL = "A / ←";
export const DIG_EVENT_KEYS_LABEL = "D / →";
export const TRACTION_TOGGLE_KEY_LABEL = "S / ↓";
export const TRACTION_SCORE_LENIENCY_MARGIN = 140;
export const QUESTION_OPTION_KEYS_LABEL = "WASD";
export const QUESTION_OPTION_DISPLAY_LABEL = "setas";
export const PHASE1_CONTINUE_CODES = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
] as const;
export const QUESTION_APPROACH_SLOWDOWN_DISTANCE = 320;
export const QUESTION_APPROACH_TARGET_SPEED = 42;
export const QUESTION_MODAL_OPEN_SPEED_THRESHOLD = 6;
export const INITIAL_MESSAGE =
  "A retro anda para a esquerda. Responda aos eventos quando eles chegarem.";
export const PHASE1_MENU_TITLE = "Treinando com o Venezito";
export const PHASE1_MENU_DESCRIPTION =
  "Entre na retroescavadeira e aprenda tudo sobre a operação!";
export const PHASE1_START_MODAL_TITLE = "Controles da fase";
export const PHASE1_START_MODAL_DESCRIPTION =
  "Este jogo usa as setas / WASD. Aprenda a posicao de cada comando na maquina antes de sair.";
export const PHASE1_START_MODAL_HINT =
  "Pressione as setas / WASD para continuar.";
