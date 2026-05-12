export const CANVAS_WIDTH = 1560;
export const CANVAS_HEIGHT = 720;

export const FIELD_COLUMNS = 30;
export const FIELD_ROWS = 16;
export const CELL_SIZE = 40;
export const CELL_GAP = 2;
export const FIELD_WIDTH = FIELD_COLUMNS * CELL_SIZE;
export const FIELD_HEIGHT = FIELD_ROWS * CELL_SIZE;
export const FIELD_LEFT = (CANVAS_WIDTH - FIELD_WIDTH) / 2;
export const FIELD_TOP = (CANVAS_HEIGHT - FIELD_HEIGHT) / 2 + 8;

export const TRACTOR_WIDTH = 100;
export const TRACTOR_HEIGHT = 120;
export const TRACTOR_HITBOX_WIDTH = 50;
export const TRACTOR_HITBOX_HEIGHT = 70;
export const TRACTOR_START_X = FIELD_LEFT + CELL_SIZE * 1.5;
export const TRACTOR_START_Y = FIELD_TOP + FIELD_HEIGHT - CELL_SIZE * 1.5;
export const TRACTOR_SPEED = 285;
export const TRACTOR_TURN_RESPONSE = 3.2;
export const RESTART_DISTANCE = 50;

export const INITIAL_MESSAGE = "Corte toda a grama passando por cima das celulas.";
export const COMPLETE_MESSAGE = "Campo limpo. Todas as celulas foram cortadas.";
export const READY_TO_RESTART_MESSAGE = "Campo limpo! Pressione espaço para reiniciar.";
