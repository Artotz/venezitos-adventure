import { TEXT } from "../i18n";

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
export const TRACTOR_START_Y =
  FIELD_TOP + FIELD_HEIGHT - TRACTOR_HITBOX_HEIGHT / 2;
export const TRACTOR_SPEED = 235;
export const TRACTOR_TURN_RESPONSE = 3.2;
export const RESTART_DISTANCE = 50;
export const STAGE_DURATION_SECONDS = 40;
export const CELL_SCORE_VALUE = 1.35;

export const PHASE2_MENU_EYEBROW = TEXT.phase2.menuEyebrow;
export const PHASE2_MENU_TITLE = TEXT.phase2.menuTitle;
export const PHASE2_MENU_DESCRIPTION = TEXT.phase2.menuDescription;
export const PHASE2_MENU_ACTION_LABEL = TEXT.phase2.menuAction;

export const PHASE2_PRE_GAME_TITLE = TEXT.phase2.preGameTitle;
export const PHASE2_PRE_GAME_DESCRIPTION = TEXT.phase2.preGameDescription;
export const PHASE2_PRE_GAME_ACTION_LABEL = TEXT.phase2.preGameAction;
export const PHASE2_PRE_GAME_BACK_LABEL = TEXT.phase2.preGameBack;

export const PHASE2_PLOWING_TITLE = TEXT.phase2.plowingTitle;
export const PHASE2_PLANTING_TITLE = TEXT.phase2.plantingTitle;
export const PHASE2_CANE_TITLE = TEXT.phase2.caneTitle;
export const PHASE2_MOVEMENT_HINT = TEXT.phase2.movementHint;
export const PHASE2_PLANTED_LABEL = TEXT.phase2.plantedLabel;
export const PHASE2_CANE_LABEL = TEXT.phase2.caneLabel;
export const PHASE2_CELLS_LABEL = TEXT.phase2.cellsLabel;
export const PHASE2_TIME_LABEL = TEXT.phase2.timeLabel;
export const PHASE2_PROGRESS_LABEL = TEXT.phase2.progressLabel;

export const INITIAL_MESSAGE = TEXT.phase2.initialMessage;
export const COMPLETE_MESSAGE = TEXT.phase2.completeMessage;
export const READY_TO_PLANT_MESSAGE = TEXT.phase2.readyToPlantMessage;
export const CONFIRM_PLANTING_MESSAGE = TEXT.phase2.confirmPlantingMessage;
export const PLANTING_MESSAGE = TEXT.phase2.plantingMessage;
export const PLANTING_COMPLETE_MESSAGE = TEXT.phase2.plantingCompleteMessage;
export const READY_TO_CANE_MESSAGE = TEXT.phase2.readyToCaneMessage;
export const CONFIRM_CANE_MESSAGE = TEXT.phase2.confirmCaneMessage;
export const CANE_MESSAGE = TEXT.phase2.caneMessage;
export const CANE_COMPLETE_MESSAGE = TEXT.phase2.caneCompleteMessage;
export const READY_TO_RESTART_MESSAGE = TEXT.phase2.readyToRestartMessage;
export const PHASE2_HIGHSCORE_STORAGE_KEY =
  "venezitos-adventure:phase2-highscore";
