export const CANVAS_WIDTH = 1560;
export const CANVAS_HEIGHT = 720;

export const FIELD_COLUMNS = 34;
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
export const PLOW_WIDTH = 135;
export const PLOW_HEIGHT = 71;
export const PLANTER_WIDTH = 170;
export const PLANTER_HEIGHT = 90;
export const SPRAYER_WIDTH = 230;
export const SPRAYER_HEIGHT = 125;
export const PLOW_OFFSET_Y = 82;
export const PLOW_HITBOX_WIDTH = 110;
export const PLOW_HITBOX_HEIGHT = 46;
export const PLANTER_HITBOX_WIDTH = 110;
export const PLANTER_HITBOX_HEIGHT = 46;
export const SPRAYER_HITBOX_WIDTH = 110;
export const SPRAYER_HITBOX_HEIGHT = 46;
export const PLOW_FOLLOW_RESPONSE = 1.6;
export const PLOW_MAX_ARTICULATION = Math.PI / 2.5;
export const PLOW_TURN_SWING = Math.PI / 4.5;
export const PLOW_TONGUE_LENGTH = 24;
export const TRACTOR_START_X = FIELD_LEFT + CELL_SIZE * 1.5;
export const TRACTOR_START_Y = FIELD_TOP + FIELD_HEIGHT - TRACTOR_HITBOX_HEIGHT / 2;
export const TRACTOR_SPEED = 235;
export const TRACTOR_TURN_RESPONSE = 3.2;
export const RESTART_DISTANCE = 50;
export const STAGE_DURATION_SECONDS = 40;
export const CELL_SCORE_VALUE = 1.35;

export const INITIAL_MESSAGE = "Corte toda a grama passando por cima das celulas.";
export const COMPLETE_MESSAGE = "Campo limpo. Todas as celulas foram cortadas.";
export const READY_TO_PLANT_MESSAGE = "Campo limpo! Volte ao inicio para plantar.";
export const CONFIRM_PLANTING_MESSAGE =
  "A segunda etapa vai comecar. Pressione Space para confirmar.";
export const PLANTING_MESSAGE = "Plante o campo passando o arado pelo solo.";
export const PLANTING_COMPLETE_MESSAGE = "Plantio completo. Campo preparado!";
export const READY_TO_CANE_MESSAGE =
  "Plantio completo! Volte ao inicio para iniciar a cana.";
export const CONFIRM_CANE_MESSAGE =
  "A terceira etapa vai comecar. Pressione Space para confirmar.";
export const CANE_MESSAGE = "Passe pelo campo para formar o plantio de cana.";
export const CANE_COMPLETE_MESSAGE = "Plantio de cana completo!";
export const READY_TO_RESTART_MESSAGE = "Campo limpo! Pressione espaço para reiniciar.";
