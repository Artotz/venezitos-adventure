import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_Y,
  PHASE1_START_MODAL_DESCRIPTION,
  PHASE1_START_MODAL_HINT,
  PHASE1_START_MODAL_TITLE,
  TRACTION_SCORE_LENIENCY_MARGIN,
} from "./config";
import { getEventDefinition } from "./eventCatalog";
import { drawExcavator } from "../retro/render";
import {
  applyToPoint,
  computeWorldMatrices,
  createScaleMatrix,
  createTranslationMatrix,
  multiplyMatrices,
} from "../retro/geometry";
import type { LayerName, Matrix2D, Point } from "../retro/types";
import { getImageSourceSize, type LoadedImageSource } from "../imageSource";
import { DEFAULT_GREASE_ANIMATION_CONFIG } from "../venezito/greaseAnimation";
import { drawGreaseAnimation } from "../venezito/render";
import {
  getEventHitboxScreenX,
  getEventVisualScreenX,
  isEventScreenXVisible,
  resolveMapEventType,
} from "./eventPositioner";
import type {
  MapEvent,
  Phase1SpeechModalState,
  QuestionModalState,
} from "./types";

type Phase1SceneParams = {
  context: CanvasRenderingContext2D;
  distance: number;
  events: MapEvent[];
  activeEventId: number | null;
  loadedDirt: boolean;
  rearLoaded: boolean;
  greaseAnimationActive: boolean;
  groundImage?: LoadedImageSource | null;
  carnaubaImage?: LoadedImageSource | null;
  instructorImage?: LoadedImageSource | null;
  pickupDirtImage?: LoadedImageSource | null;
  greaseSignImage?: LoadedImageSource | null;
  maintenanceSignImage?: LoadedImageSource | null;
  mudImage?: LoadedImageSource | null;
};

type Phase1ForegroundParams = {
  context: CanvasRenderingContext2D;
  distance: number;
  events: MapEvent[];
  activeEventId: number | null;
  loadedDirt: boolean;
  rearLoaded: boolean;
  foregroundImage?: LoadedImageSource | null;
  holeEmptyImage?: LoadedImageSource | null;
  holeFullImage?: LoadedImageSource | null;
  pickupUnloadTruckImage?: LoadedImageSource | null;
  workSignImage?: LoadedImageSource | null;
};

type Phase1HudParams = {
  context: CanvasRenderingContext2D;
  score: number;
  distance: number;
  differentialLockEnabled: boolean;
  message: string;
  instructorImage?: LoadedImageSource | null;
};

type Phase1GreaseAnimationParams = {
  context: CanvasRenderingContext2D;
  greaseAnimationElapsed: number | null;
  greaseImage?: LoadedImageSource | null;
  machineRootMatrix: Matrix2D;
  pointProjector?: (matrix: Matrix2D, point: Point) => Point;
};

type Phase1ModalLayout = {
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
  portraitX: number;
  portraitY: number;
  portraitWidth: number;
  portraitHeight: number;
  panelX: number;
  panelY: number;
  panelWidth: number;
  panelHeight: number;
  panelPadding: number;
};

type Phase1StartModalParams = {
  context: CanvasRenderingContext2D;
  instructorImage?: CanvasImageSource | null;
  images: Record<LayerName, HTMLImageElement>;
  machineAngles: Record<LayerName, number>;
  machineContentWidth: number;
  machineContentHeight: number;
};

type Phase1EventShowcaseKind = "pickup" | "dig" | "grease" | "traction";

type Phase1EventShowcaseModalParams = {
  context: CanvasRenderingContext2D;
  kind: Phase1EventShowcaseKind;
  instructorImage?: LoadedImageSource | null;
  pickupDirtImage?: LoadedImageSource | null;
  holeFullImage?: LoadedImageSource | null;
  greaseSignImage?: LoadedImageSource | null;
  mudImage?: LoadedImageSource | null;
  workSignImage?: LoadedImageSource | null;
};

const WRAPPED_TEXT_LAYOUT_CACHE = new Map<string, string[]>();

const GROUND_SPRITE_SURFACE_Y = 356;
const CARNAUBA_LAYER_SPEED = 0.18;
const CARNAUBA_SPACING = 280;
const CARNAUBA_BASE_Y = GROUND_Y + 6;
const CARNAUBA_BASE_SOURCE_Y = 658;
const CARNAUBA_DRAW_HEIGHT = 666;
const FOREGROUND_LAYER_SPEED = 1.2;
const FOREGROUND_SPRITE_TOP_Y = 520;
const FOREGROUND_DRAW_TOP_Y = GROUND_Y + 30;
const PICKUP_UNLOAD_TRUCK_DRAW_WIDTH = 1200;
const PICKUP_UNLOAD_TRUCK_BASE_Y = CANVAS_HEIGHT - 50;
const PICKUP_UNLOAD_TRUCK_BASE_SOURCE_Y = 714;
const PICKUP_UNLOAD_TRUCK_CENTER_OFFSET_X = -20;
const PICKUP_DIRT_DRAW_HEIGHT = 150;
const PICKUP_DIRT_BASE_Y = GROUND_Y + 50;
const PICKUP_DIRT_OFFSET_X = 18;
const GREASE_SIGN_DRAW_HEIGHT = 176;
const GREASE_SIGN_BASE_Y = GROUND_Y - 10;
const GREASE_SIGN_OFFSET_X = 18;
const GREASE_VENEZITO_DRAW_HEIGHT = 124;
const GREASE_VENEZITO_BASE_Y = GROUND_Y - 12;
const GREASE_VENEZITO_OFFSET_X = -84;
const HOLE_DRAW_HEIGHT = 200;
const HOLE_BASE_Y = GROUND_Y + 34 + 180;
const HOLE_OFFSET_X = 30;
const MUD_DRAW_HEIGHT = 200;
const MUD_BASE_Y = GROUND_Y + 170;
const MUD_OFFSET_X = 0;
const WORK_SIGN_DRAW_HEIGHT = 184;
const WORK_SIGN_BASE_Y = GROUND_Y + 12 + 120;
const WORK_SIGN_OFFSET_X = 150 + 30;

export function drawPhase1Backdrop(context: CanvasRenderingContext2D) {
  const skyGradient = context.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGradient.addColorStop(0, "#3d78b2");
  skyGradient.addColorStop(0.5, "#87b6df");
  skyGradient.addColorStop(1, "#d9c58d");
  context.fillStyle = skyGradient;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function drawPhase1Environment({
  context,
  distance,
  events,
  activeEventId,
  loadedDirt,
  rearLoaded,
  greaseAnimationActive,
  groundImage,
  carnaubaImage,
  instructorImage,
  pickupDirtImage,
  greaseSignImage,
  maintenanceSignImage,
  mudImage,
}: Phase1SceneParams) {
  drawBackground(
    context,
    distance,
    events,
    activeEventId,
    loadedDirt,
    rearLoaded,
    carnaubaImage,
  );
  drawGround(
    context,
    distance,
    events,
    activeEventId,
    loadedDirt,
    rearLoaded,
    groundImage,
    mudImage,
  );
  drawGroundOverlay(
    context,
    distance,
    events,
    activeEventId,
    loadedDirt,
    rearLoaded,
    greaseAnimationActive,
    instructorImage,
    pickupDirtImage,
    greaseSignImage,
    maintenanceSignImage,
  );
}

export function drawPhase1Foreground({
  context,
  distance,
  events,
  activeEventId,
  loadedDirt,
  rearLoaded,
  foregroundImage,
  holeEmptyImage,
  holeFullImage,
  pickupUnloadTruckImage,
  workSignImage,
}: Phase1ForegroundParams) {
  drawMachineOverlay(
    context,
    distance,
    events,
    activeEventId,
    loadedDirt,
    rearLoaded,
    holeEmptyImage,
    holeFullImage,
    workSignImage,
  );
  drawForegroundPickupUnloadEvents(
    context,
    distance,
    events,
    activeEventId,
    loadedDirt,
    rearLoaded,
    pickupUnloadTruckImage,
  );
  drawForeground(context, distance, foregroundImage);
}

export function drawCenterGuide(
  context: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  bottomY: number,
  hasActiveEvent: boolean,
) {
  context.save();
  context.strokeStyle = hasActiveEvent
    ? "rgba(255, 230, 140, 0.95)"
    : "rgba(255,255,255,0.42)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(centerX, topY);
  context.lineTo(centerX, bottomY);
  context.stroke();
  context.restore();
}

export function drawPhase1GreaseAnimation({
  context,
  greaseAnimationElapsed,
  greaseImage,
  machineRootMatrix,
  pointProjector = applyToPoint,
}: Phase1GreaseAnimationParams) {
  drawGreaseAnimation({
    context,
    elapsed: greaseAnimationElapsed,
    greaseImage,
    machineRootMatrix,
    config: DEFAULT_GREASE_ANIMATION_CONFIG,
    pointProjector,
  });
}

export function drawPhase1Hud({
  context,
  score,
  distance,
  differentialLockEnabled,
  message,
  instructorImage,
}: Phase1HudParams) {
  const hudY = 26;
  const leftX = 28;
  const rightX = CANVAS_WIDTH - 292;
  const speechX = CANVAS_WIDTH / 2 - 260;
  const bottomCardX = CANVAS_WIDTH / 2 - 180;
  const bottomCardY = CANVAS_HEIGHT - 102;

  drawHudCard(context, leftX, hudY, "pontuação", String(score), "score");
  drawHudCard(
    context,
    rightX,
    hudY,
    "Horímetro",
    `${Math.floor(distance / 10)} h`,
    "hourmeter",
  );
  drawVenezitoSpeechHud(
    context,
    speechX,
    hudY,
    520,
    84,
    message,
    instructorImage,
  );
  drawDifferentialLockCard(
    context,
    bottomCardX,
    bottomCardY,
    differentialLockEnabled,
  );
}

export function drawQuestionModal(
  context: CanvasRenderingContext2D,
  modalState: QuestionModalState,
  instructorImage?: CanvasImageSource | null,
) {
  const layout = getPhase1ModalLayout();
  const questionBoxX = layout.panelX + layout.panelPadding;
  const questionBoxY = layout.panelY + 54;
  const questionBoxWidth = layout.panelWidth - layout.panelPadding * 2;
  const questionBoxHeight = 126;
  const choiceWidth = 470;
  const choiceHeight = 104;
  const topChoiceX = layout.panelX + layout.panelWidth / 2 - choiceWidth / 2;
  const leftChoiceX = layout.panelX + layout.panelPadding;
  const rightChoiceX =
    layout.panelX + layout.panelWidth - layout.panelPadding - choiceWidth;
  const topChoiceY = questionBoxY + questionBoxHeight + 26;
  const sideChoiceY = topChoiceY + choiceHeight + 18;
  const bottomChoiceY = sideChoiceY + choiceHeight + 18;

  context.save();
  drawModalFrame(context, layout);
  drawInstructorStage(
    context,
    instructorImage ?? null,
    layout.portraitX,
    layout.portraitY,
    layout.portraitWidth,
    layout.portraitHeight,
  );
  drawModalPanel(context, layout);

  context.fillStyle = "#e1bf75";
  context.font = '700 18px "Segoe UI", sans-serif';
  context.fillText(
    modalState.title.toUpperCase(),
    questionBoxX,
    layout.panelY + 30,
  );

  context.fillStyle = "rgba(255, 245, 220, 0.07)";
  context.strokeStyle = "rgba(255, 229, 178, 0.14)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(
    questionBoxX,
    questionBoxY,
    questionBoxWidth,
    questionBoxHeight,
    20,
  );
  context.fill();
  context.stroke();

  context.fillStyle = "#fff3d7";
  context.font = '700 28px "Segoe UI", sans-serif';
  drawWrappedText(
    context,
    modalState.question.prompt,
    questionBoxX + 24,
    questionBoxY + 40,
    questionBoxWidth - 48,
    36,
  );

  drawQuestionChoiceCard(
    context,
    topChoiceX,
    topChoiceY,
    choiceWidth,
    "\u2191",
    modalState.question.choices.up.label,
  );
  drawQuestionChoiceCard(
    context,
    leftChoiceX,
    sideChoiceY,
    choiceWidth,
    "\u2190",
    modalState.question.choices.left.label,
  );
  drawQuestionChoiceCard(
    context,
    rightChoiceX,
    sideChoiceY,
    choiceWidth,
    "\u2192",
    modalState.question.choices.right.label,
  );
  drawQuestionChoiceCard(
    context,
    topChoiceX,
    bottomChoiceY,
    choiceWidth,
    "\u2193",
    modalState.question.choices.down.label,
  );
  context.restore();
}

export function drawPhase1SpeechModal(
  context: CanvasRenderingContext2D,
  modalState: Phase1SpeechModalState,
  instructorImage?: CanvasImageSource | null,
) {
  const layout = getPhase1ModalLayout();
  const titleX = layout.panelX + layout.panelPadding;
  const bodyX = titleX;
  const bodyY = layout.panelY + 72;

  context.save();
  drawModalFrame(context, layout);
  drawInstructorStage(
    context,
    instructorImage ?? null,
    layout.portraitX,
    layout.portraitY,
    layout.portraitWidth,
    layout.portraitHeight,
  );
  drawModalPanel(context, layout);
  drawSpeechBubble(
    context,
    layout.portraitX + 26,
    layout.portraitY + 100,
    layout.portraitWidth - 52,
    modalState.speech,
  );

  context.fillStyle = "#e1bf75";
  context.font = '700 18px "Segoe UI", sans-serif';
  context.fillText(modalState.title.toUpperCase(), titleX, layout.panelY + 30);

  context.fillStyle = "#fff3d7";
  context.font = '600 20px "Segoe UI", sans-serif';
  // drawWrappedText(
  //   context,
  //   modalState.speech,
  //   titleX,
  //   layout.panelY + 76,
  //   layout.panelWidth - layout.panelPadding * 2,
  //   28,
  // );

  if (modalState.body) {
    context.fillStyle = "#fff3d7";
    context.font = '600 22px "Segoe UI", sans-serif';
    drawWrappedParagraphText(
      context,
      modalState.body,
      bodyX,
      bodyY,
      layout.panelWidth - layout.panelPadding * 2,
      30,
      layout.panelHeight - 250,
    );
  }

  context.fillStyle = "#d5b178";
  context.font = '600 16px "Segoe UI", sans-serif';
  context.textAlign = "center";
  context.fillText(
    modalState.continueHint,
    layout.panelX + layout.panelWidth / 2,
    layout.panelY + layout.panelHeight - 22,
  );
  context.textAlign = "start";
  context.restore();
}

export function drawPhase1StartModal({
  context,
  instructorImage,
  images,
  machineAngles,
  machineContentHeight,
  machineContentWidth,
}: Phase1StartModalParams) {
  const layout = getPhase1ModalLayout();
  const titleX = layout.panelX + layout.panelPadding;
  const descriptionY = layout.panelY + 64;
  const machineStageX = layout.panelX + 52;
  const machineStageY = layout.panelY + 124;
  const machineStageWidth = layout.panelWidth - 104;
  const machineStageHeight = layout.panelHeight - 196;
  const centerX = machineStageX + machineStageWidth / 2;
  const centerY = machineStageY + machineStageHeight / 2 + 4;
  const maxMachineWidth = machineStageWidth - 420;
  const maxMachineHeight = machineStageHeight - 210;
  const machineScale = Math.min(
    0.72,
    maxMachineWidth / machineContentWidth,
    maxMachineHeight / machineContentHeight,
  );
  const scaledMachineWidth = machineContentWidth * machineScale;
  const scaledMachineHeight = machineContentHeight * machineScale;
  const machineWorldMatrices = computeWorldMatrices(
    machineAngles,
    multiplyMatrices(
      createTranslationMatrix(
        centerX + 120 - scaledMachineWidth / 2,
        centerY + 20 - scaledMachineHeight / 2,
      ),
      createScaleMatrix(machineScale, machineScale),
    ),
  );

  context.save();
  drawModalFrame(context, layout);
  drawInstructorStage(
    context,
    instructorImage ?? null,
    layout.portraitX,
    layout.portraitY,
    layout.portraitWidth,
    layout.portraitHeight,
  );
  drawModalPanel(context, layout);

  context.fillStyle = "#e1bf75";
  context.font = '700 18px "Segoe UI", sans-serif';
  context.fillText(
    PHASE1_START_MODAL_TITLE.toUpperCase(),
    titleX,
    layout.panelY + 30,
  );

  context.fillStyle = "#fff3d7";
  context.font = '600 22px "Segoe UI", sans-serif';
  drawWrappedText(
    context,
    PHASE1_START_MODAL_DESCRIPTION,
    titleX,
    descriptionY,
    layout.panelWidth - layout.panelPadding * 2,
    30,
  );

  context.fillStyle = "rgba(255, 245, 220, 0.05)";
  context.strokeStyle = "rgba(255, 229, 178, 0.16)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(
    machineStageX,
    machineStageY,
    machineStageWidth,
    machineStageHeight,
    28,
  );
  context.fill();
  context.stroke();

  context.fillStyle = "rgba(255, 214, 133, 0.09)";
  context.beginPath();
  context.ellipse(centerX, centerY + 10, 232, 156, 0, 0, Math.PI * 2);
  context.fill();

  drawExcavator(context, images, machineWorldMatrices);

  drawInstructionCard(
    context,
    centerX - 130,
    machineStageY + 10,
    260,
    92,
    "↑",
    "Engraxar",
    "Use ↑ / W para aplicar graxa.",
  );
  drawInstructionCard(
    context,
    machineStageX + 10,
    centerY - 44,
    224,
    92,
    "←",
    "Carregar",
    "Use ← / A para carregar.",
  );
  drawInstructionCard(
    context,
    machineStageX + machineStageWidth - 242 + 8,
    centerY - 44,
    224,
    92,
    "→",
    "Cavar",
    "Use → / D para cavar.",
  );
  drawInstructionCard(
    context,
    centerX - 130,
    machineStageY + machineStageHeight - 100,
    260,
    92,
    "↓",
    "tração",
    "Use ↓ / S para ativar o 4x4.",
  );

  context.fillStyle = "#d5b178";
  context.font = '600 16px "Segoe UI", sans-serif';
  context.textAlign = "center";
  context.fillText(
    PHASE1_START_MODAL_HINT,
    layout.panelX + layout.panelWidth / 2,
    layout.panelY + layout.panelHeight - 22,
  );
  context.textAlign = "start";
  context.restore();
}

export function drawPhase1EventShowcaseModal({
  context,
  kind,
  instructorImage,
  pickupDirtImage,
  holeFullImage,
  greaseSignImage,
  mudImage,
  workSignImage,
}: Phase1EventShowcaseModalParams) {
  const layout = getPhase1ModalLayout();
  const titleX = layout.panelX + layout.panelPadding;
  const stageX = layout.panelX + 42;
  const stageY = layout.panelY + 118;
  const stageWidth = layout.panelWidth - 84;
  const stageHeight = layout.panelHeight - 188;
  const stageCenterX = stageX + stageWidth / 2;
  const stageCenterY = stageY + stageHeight / 2 + 6;
  const stageBaseY = stageCenterY + 78;

  const contentByKind: Record<
    Phase1EventShowcaseKind,
    { title: string; body: string; keyLabel: string }
  > = {
    pickup: {
      title: "Carregar",
      body: "Aproxime da pilha e use ← / A para operar a carregadeira na dianteira.",
      keyLabel: "←",
    },
    dig: {
      title: "Cavar",
      body: "Use → / D para operar a escavadeira na traseira e cavar ou preencher buracos.",
      keyLabel: "→",
    },
    grease: {
      title: "Engraxar",
      body: "Pare no ponto de manutenção e use ↑ / W para iniciar a graxa.",
      keyLabel: "↑",
    },
    traction: {
      title: "tração",
      body: "No trecho de lama, use ↓ / S para ativar o 4x4. Lembre de desativar depois!",
      keyLabel: "↓",
    },
  };

  const content = contentByKind[kind];

  context.save();
  drawModalFrame(context, layout);
  drawInstructorStage(
    context,
    instructorImage ?? null,
    layout.portraitX,
    layout.portraitY,
    layout.portraitWidth,
    layout.portraitHeight,
  );
  drawModalPanel(context, layout);

  context.fillStyle = "#e1bf75";
  context.font = '700 18px "Segoe UI", sans-serif';
  context.fillText(content.title.toUpperCase(), titleX, layout.panelY + 30);

  context.fillStyle = "#fff3d7";
  context.font = '600 22px "Segoe UI", sans-serif';
  drawWrappedText(
    context,
    content.body,
    titleX,
    layout.panelY + 68,
    layout.panelWidth - layout.panelPadding * 2,
    30,
  );

  context.fillStyle = "rgba(255, 245, 220, 0.05)";
  context.strokeStyle = "rgba(255, 229, 178, 0.16)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(stageX, stageY, stageWidth, stageHeight, 28);
  context.fill();
  context.stroke();

  context.fillStyle = "rgba(255, 214, 133, 0.09)";
  context.beginPath();
  context.ellipse(stageCenterX, stageCenterY + 28, 232, 156, 0, 0, Math.PI * 2);
  context.fill();

  if (kind === "pickup" && pickupDirtImage) {
    drawPlacedSprite(
      context,
      pickupDirtImage,
      stageCenterX,
      stageBaseY + 50,
      PICKUP_DIRT_DRAW_HEIGHT + 80,
    );
  }

  if (kind === "dig") {
    if (holeFullImage) {
      drawPlacedSprite(
        context,
        holeFullImage,
        stageCenterX - 52 - 20,
        stageBaseY + 90 + 10,
        HOLE_DRAW_HEIGHT + 30,
      );
    }
    if (workSignImage) {
      drawPlacedSprite(
        context,
        workSignImage,
        stageCenterX + 132 - 20,
        stageBaseY - 10 + 10,
        WORK_SIGN_DRAW_HEIGHT - 20,
      );
    }
  }

  if (kind === "grease") {
    if (greaseSignImage) {
      drawPlacedSprite(
        context,
        greaseSignImage,
        stageCenterX + 44 + 25,
        stageBaseY + 30,
        GREASE_SIGN_DRAW_HEIGHT + 10,
      );
    }
    if (instructorImage) {
      drawPlacedSprite(
        context,
        instructorImage,
        stageCenterX - 96 + 25,
        stageBaseY + 20,
        GREASE_VENEZITO_DRAW_HEIGHT + 28,
      );
    }
  }

  if (kind === "traction" && mudImage) {
    drawPlacedSprite(
      context,
      mudImage,
      stageCenterX + 10,
      stageBaseY + 6 + 108,
      MUD_DRAW_HEIGHT + 60,
    );
  }

  context.fillStyle = "#d5b178";
  context.font = '600 16px "Segoe UI", sans-serif';
  context.textAlign = "center";
  context.fillText(
    PHASE1_START_MODAL_HINT,
    layout.panelX + layout.panelWidth / 2,
    layout.panelY + layout.panelHeight - 22,
  );
  context.textAlign = "start";
  context.restore();
}

function getPhase1ModalLayout(): Phase1ModalLayout {
  const frameX = 44;
  const frameY = 34;
  const frameWidth = CANVAS_WIDTH - 88;
  const frameHeight = CANVAS_HEIGHT - 68;
  const portraitWidth = 368;
  const panelGap = 28;
  const panelX = frameX + portraitWidth + panelGap;
  const panelY = frameY + 20;
  const panelWidth = frameWidth - portraitWidth - panelGap - 20;
  const panelHeight = frameHeight - 40;

  return {
    frameX,
    frameY,
    frameWidth,
    frameHeight,
    portraitX: frameX + 18,
    portraitY: frameY + 18,
    portraitWidth: portraitWidth - 8,
    portraitHeight: frameHeight - 36,
    panelX,
    panelY,
    panelWidth,
    panelHeight,
    panelPadding: 34,
  };
}

function drawModalFrame(
  context: CanvasRenderingContext2D,
  layout: Phase1ModalLayout,
) {
  context.fillStyle = "rgba(6, 8, 12, 0.72)";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const frameGradient = context.createLinearGradient(
    layout.frameX,
    layout.frameY,
    layout.frameX + layout.frameWidth,
    layout.frameY + layout.frameHeight,
  );
  frameGradient.addColorStop(0, "rgba(30, 23, 16, 0.98)");
  frameGradient.addColorStop(1, "rgba(18, 14, 10, 0.98)");
  context.fillStyle = frameGradient;
  context.strokeStyle = "rgba(255, 229, 178, 0.24)";
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(
    layout.frameX,
    layout.frameY,
    layout.frameWidth,
    layout.frameHeight,
    30,
  );
  context.fill();
  context.stroke();
}

function drawModalPanel(
  context: CanvasRenderingContext2D,
  layout: Phase1ModalLayout,
) {
  context.strokeStyle = "rgba(255, 229, 178, 0.16)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(layout.panelX - 14, layout.panelY + 12);
  context.lineTo(layout.panelX - 14, layout.panelY + layout.panelHeight - 12);
  context.stroke();

  context.fillStyle = "rgba(37, 28, 20, 0.92)";
  context.strokeStyle = "rgba(255, 229, 178, 0.18)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(
    layout.panelX,
    layout.panelY,
    layout.panelWidth,
    layout.panelHeight,
    28,
  );
  context.fill();
  context.stroke();
}

function drawInstructorStage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource | null,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.save();

  const portraitGradient = context.createLinearGradient(x, y, x, y + height);
  portraitGradient.addColorStop(0, "rgba(79, 57, 38, 0.62)");
  portraitGradient.addColorStop(1, "rgba(33, 24, 16, 0.18)");
  context.fillStyle = portraitGradient;
  context.beginPath();
  context.roundRect(x, y, width, height, 26);
  context.fill();

  context.fillStyle = "rgba(255, 214, 133, 0.1)";
  context.beginPath();
  context.ellipse(
    x + width / 2,
    y + height * 0.54,
    118,
    184,
    0,
    0,
    Math.PI * 2,
  );
  context.fill();

  context.fillStyle = "#e1bf75";
  context.font = '700 15px "Segoe UI", sans-serif';
  context.fillText("INSTRUTOR", x + 26, y + 34);

  context.fillStyle = "#fff3d7";
  context.font = '700 34px "Segoe UI", sans-serif';
  context.fillText("Venezito", x + 24, y + 72);

  if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
    const { width: sourceWidth, height: sourceHeight } =
      getImageSourceSize(image);
    const maxWidth = width - 52;
    const maxHeight = height - 152;
    const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + height - drawHeight - 16;

    context.fillStyle = "rgba(0, 0, 0, 0.26)";
    context.beginPath();
    context.ellipse(
      x + width / 2,
      y + height - 18,
      Math.min(112, drawWidth * 0.32),
      18,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  context.restore();
}

function drawBackground(
  context: CanvasRenderingContext2D,
  distance: number,
  _events: MapEvent[],
  _activeEventId: number | null,
  _loadedDirt: boolean,
  _rearLoaded: boolean,
  carnaubaImage?: LoadedImageSource | null,
) {
  const backgroundYOffset = GROUND_Y - 485;

  // context.fillStyle = "rgba(255, 244, 214, 0.25)";
  // context.beginPath();
  // context.arc(910, 110, 58, 0, Math.PI * 2);
  // context.fill();

  // context.fillStyle = "#6d8b57";
  // for (let x = farOffset - 320; x < CANVAS_WIDTH + 320; x += 320) {
  //   context.beginPath();
  //   context.moveTo(x, 480 + backgroundYOffset);
  //   context.lineTo(x + 140, 350 + backgroundYOffset);
  //   context.lineTo(x + 300, 480 + backgroundYOffset);
  //   context.closePath();
  //   context.fill();
  // }

  if (carnaubaImage) {
    drawBackgroundCarnaubas(context, distance, carnaubaImage);
  } else {
    context.fillStyle = "#8f6c46";
    const midOffset = (distance * CARNAUBA_LAYER_SPEED) % CARNAUBA_SPACING;

    for (
      let x = midOffset - CARNAUBA_SPACING;
      x < CANVAS_WIDTH + CARNAUBA_SPACING;
      x += CARNAUBA_SPACING
    ) {
      context.fillRect(x + 40, 370 + backgroundYOffset, 30, 120);
      context.beginPath();
      context.arc(x + 55, 355 + backgroundYOffset, 44, 0, Math.PI * 2);
      context.fill();
    }
  }
}

function drawBackgroundCarnaubas(
  context: CanvasRenderingContext2D,
  distance: number,
  carnaubaImage: LoadedImageSource,
) {
  const { width: sourceWidth, height: sourceHeight } =
    getImageSourceSize(carnaubaImage);

  if (!sourceWidth || !sourceHeight) {
    return;
  }

  const worldOffset = distance * CARNAUBA_LAYER_SPEED;
  const scrollOffset = worldOffset % CARNAUBA_SPACING;

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  for (
    let x = scrollOffset - CARNAUBA_SPACING;
    x < CANVAS_WIDTH + CARNAUBA_SPACING;
    x += CARNAUBA_SPACING
  ) {
    const drawHeight = CARNAUBA_DRAW_HEIGHT;
    const drawWidth = (sourceWidth / sourceHeight) * drawHeight;
    const trunkBaseOffset =
      (CARNAUBA_BASE_SOURCE_Y / sourceHeight) * drawHeight;
    const drawY = CARNAUBA_BASE_Y - trunkBaseOffset;
    const drawX = x + 55 - drawWidth / 2;

    context.drawImage(carnaubaImage, drawX, drawY, drawWidth, drawHeight);
  }

  context.restore();
}

function drawGround(
  context: CanvasRenderingContext2D,
  distance: number,
  events: MapEvent[],
  activeEventId: number | null,
  loadedDirt: boolean,
  rearLoaded: boolean,
  groundImage?: LoadedImageSource | null,
  mudImage?: LoadedImageSource | null,
) {
  if (groundImage) {
    drawGroundSprite(context, distance, groundImage);
  } else {
    drawProceduralGround(context, distance);
  }

  for (const event of events) {
    const visualX = getEventVisualScreenX(
      event,
      distance,
      loadedDirt,
      rearLoaded,
    );
    const hitboxX = getEventHitboxScreenX(event, distance);
    const eventType = resolveMapEventType(event, loadedDirt, rearLoaded);
    const hitboxHalfWidth = getEventDefinition(eventType).hitboxHalfWidth;

    if (!isEventScreenXVisible(visualX) && !isEventScreenXVisible(hitboxX)) {
      continue;
    }

    const isActive = event.id === activeEventId;

    // if (eventType === "pickup-load") {
    //   drawPickupDirt(context, visualX, hitboxX, hitboxHalfWidth, isActive);
    // }

    if (eventType === "dig-unload") {
    }

    if (eventType === "traction") {
      drawMudPatch(
        context,
        visualX,
        hitboxX,
        hitboxHalfWidth,
        isActive,
        mudImage,
      );
    }
  }
}

function drawGroundOverlay(
  context: CanvasRenderingContext2D,
  distance: number,
  events: MapEvent[],
  activeEventId: number | null,
  loadedDirt: boolean,
  rearLoaded: boolean,
  greaseAnimationActive: boolean,
  instructorImage?: LoadedImageSource | null,
  pickupDirtImage?: LoadedImageSource | null,
  greaseSignImage?: LoadedImageSource | null,
  maintenanceSignImage?: LoadedImageSource | null,
) {
  for (const event of events) {
    const visualX = getEventVisualScreenX(
      event,
      distance,
      loadedDirt,
      rearLoaded,
    );
    const hitboxX = getEventHitboxScreenX(event, distance);
    const eventType = resolveMapEventType(event, loadedDirt, rearLoaded);
    const hitboxHalfWidth = getEventDefinition(eventType).hitboxHalfWidth;

    if (!isEventScreenXVisible(visualX) && !isEventScreenXVisible(hitboxX)) {
      continue;
    }

    const isActive = event.id === activeEventId;

    if (eventType === "grease") {
      drawGreaseMarker(
        context,
        visualX,
        hitboxX,
        hitboxHalfWidth,
        isActive,
        greaseSignImage,
        instructorImage,
        greaseAnimationActive,
      );
    }

    if (eventType === "question") {
      drawGreaseMarker(
        context,
        visualX,
        hitboxX,
        hitboxHalfWidth,
        isActive,
        maintenanceSignImage,
        instructorImage,
        false,
      );
    }

    if (eventType === "pickup-load") {
      drawPickupDirtBackdrop(
        context,
        visualX,
        hitboxX,
        hitboxHalfWidth,
        isActive,
        pickupDirtImage,
      );
    }
  }
}

function drawMachineOverlay(
  context: CanvasRenderingContext2D,
  distance: number,
  events: MapEvent[],
  activeEventId: number | null,
  loadedDirt: boolean,
  rearLoaded: boolean,
  holeEmptyImage?: LoadedImageSource | null,
  holeFullImage?: LoadedImageSource | null,
  workSignImage?: LoadedImageSource | null,
) {
  for (const event of events) {
    const visualX = getEventVisualScreenX(
      event,
      distance,
      loadedDirt,
      rearLoaded,
    );
    const hitboxX = getEventHitboxScreenX(event, distance);
    const eventType = resolveMapEventType(event, loadedDirt, rearLoaded);
    const hitboxHalfWidth = getEventDefinition(eventType).hitboxHalfWidth;

    if (!isEventScreenXVisible(visualX) && !isEventScreenXVisible(hitboxX)) {
      continue;
    }

    const isActive = event.id === activeEventId;

    if (eventType === "dig-unload") {
      drawRearDitch(
        context,
        visualX,
        hitboxX,
        hitboxHalfWidth,
        isActive,
        holeEmptyImage,
      );
    }

    if (eventType === "dig-load") {
      drawRearDitch(
        context,
        visualX,
        hitboxX,
        hitboxHalfWidth,
        isActive,
        holeFullImage,
      );
    }

    if (eventType === "dig-load" || eventType === "dig-unload") {
      drawSignage(
        context,
        visualX,
        hitboxX,
        hitboxHalfWidth,
        isActive,
        workSignImage,
      );
    }
  }
}

function drawGroundSprite(
  context: CanvasRenderingContext2D,
  distance: number,
  groundImage: LoadedImageSource,
) {
  const { width: sourceWidth, height: sourceHeight } =
    getImageSourceSize(groundImage);

  if (!sourceWidth || !sourceHeight) {
    drawProceduralGround(context, distance);
    return;
  }

  const drawWidth = CANVAS_WIDTH + 40;
  const scale = drawWidth / sourceWidth;
  const drawHeight = sourceHeight * scale;
  const groundSurfaceY = GROUND_SPRITE_SURFACE_Y * scale;
  const drawY = GROUND_Y - groundSurfaceY - 50;
  const scrollOffset = distance % drawWidth;
  const startX = scrollOffset - drawWidth - 20;

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  for (let x = startX; x < CANVAS_WIDTH + drawWidth; x += drawWidth) {
    context.drawImage(groundImage, x, drawY, drawWidth, drawHeight);
  }
  context.restore();
}

function drawProceduralGround(
  _context: CanvasRenderingContext2D,
  _distance: number,
) {
  // context.fillStyle = "#a77943";
  // context.fillRect(0, GROUND_Y - 8, CANVAS_WIDTH, 90);
  // context.fillStyle = "#6e4b2a";
  // context.fillRect(0, GROUND_Y + 46, CANVAS_WIDTH, 90);
  // context.fillStyle = "#d8b16c";
  // const laneOffset = distance % 120;
  // for (let x = laneOffset - 120; x < CANVAS_WIDTH + 120; x += 120) {
  //   context.fillRect(x, GROUND_Y + 12, 70, 8);
  // }
  // context.fillStyle = "rgba(40, 23, 10, 0.28)";
  // const dirtOffset = (distance * 1.4) % 90;
  // for (let x = dirtOffset - 90; x < CANVAS_WIDTH + 90; x += 90) {
  //   context.beginPath();
  //   context.ellipse(x + 20, GROUND_Y + 58, 24, 8, 0, 0, Math.PI * 2);
  //   context.fill();
  // }
}

function drawHudCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: string,
  icon: "score" | "hourmeter",
) {
  context.save();
  context.fillStyle = "rgba(18, 14, 10, 0.72)";
  context.strokeStyle = "rgba(255, 232, 186, 0.28)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(x, y, 264, 84, 18);
  context.fill();
  context.stroke();

  context.fillStyle = "#e1bf75";
  context.font = '700 14px "Segoe UI", sans-serif';
  context.fillText(label.toUpperCase(), x + 20, y + 24);

  context.fillStyle = "#fff3d7";
  context.font = '700 32px "Segoe UI", sans-serif';
  context.fillText(value, x + 20, y + 60);

  context.fillStyle = "rgba(255, 233, 190, 0.12)";
  context.beginPath();
  context.roundRect(x + 188, y + 16, 56, 52, 14);
  context.fill();

  if (icon === "score") {
    drawScoreHudIcon(context, x + 216, y + 42);
  } else {
    drawHourmeterHudIcon(context, x + 216, y + 42);
  }

  context.restore();
}

function drawScoreHudIcon(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
) {
  context.save();
  context.fillStyle = "rgba(255, 243, 215, 0.2)";
  context.beginPath();

  for (let pointIndex = 0; pointIndex < 10; pointIndex += 1) {
    const angle = -Math.PI / 2 + pointIndex * (Math.PI / 5);
    const radius = pointIndex % 2 === 0 ? 14 : 6;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (pointIndex === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.closePath();
  context.fill();
  context.restore();
}

function drawHourmeterHudIcon(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
) {
  context.save();
  context.strokeStyle = "rgba(255, 243, 215, 0.2)";
  context.lineWidth = 3;
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(centerX - 12, centerY - 15);
  context.lineTo(centerX + 12, centerY - 15);
  context.lineTo(centerX + 4, centerY - 3);
  context.lineTo(centerX + 4, centerY + 3);
  context.lineTo(centerX + 12, centerY + 15);
  context.lineTo(centerX - 12, centerY + 15);
  context.lineTo(centerX - 4, centerY + 3);
  context.lineTo(centerX - 4, centerY - 3);
  context.closePath();
  context.stroke();

  context.fillStyle = "rgba(255, 243, 215, 0.2)";
  context.beginPath();
  context.moveTo(centerX - 6, centerY - 10);
  context.lineTo(centerX + 6, centerY - 10);
  context.lineTo(centerX, centerY - 2);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(centerX - 6, centerY + 10);
  context.lineTo(centerX + 6, centerY + 10);
  context.lineTo(centerX, centerY + 2);
  context.closePath();
  context.fill();
  context.restore();
}

function drawDifferentialLockCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  enabled: boolean,
) {
  context.save();
  context.fillStyle = enabled
    ? "rgba(50, 58, 24, 0.92)"
    : "rgba(18, 14, 10, 0.72)";
  context.strokeStyle = enabled
    ? "rgba(255, 232, 186, 0.42)"
    : "rgba(255, 232, 186, 0.2)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(x, y, 280, 84, 18);
  context.fill();
  context.stroke();

  context.fillStyle = "#e1bf75";
  context.font = '700 14px "Segoe UI", sans-serif';
  context.fillText("TRAÇÃO 4X4", x + 22, y + 24);

  context.fillStyle = enabled ? "#fff0a8" : "#fff3d7";
  context.font = '700 28px "Segoe UI", sans-serif';
  context.fillText(enabled ? "LIGADO" : "DESLIGADO", x + 22, y + 60);

  context.fillStyle = enabled
    ? "rgba(255, 240, 168, 0.14)"
    : "rgba(255, 243, 215, 0.08)";
  context.beginPath();
  context.roundRect(x + 206, y + 16, 52, 52, 14);
  context.fill();

  drawFourByFourHudIcon(context, x + 232, y + 42, enabled);
  context.restore();
}

function drawVenezitoSpeechHud(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  message: string,
  instructorImage?: LoadedImageSource | null,
) {
  const portraitWidth = 96;
  const textX = x + portraitWidth + 18;
  const textWidth = width - portraitWidth - 36;

  context.save();

  context.fillStyle = "rgba(18, 14, 10, 0.86)";
  context.strokeStyle = "rgba(255, 232, 186, 0.28)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(x, y, width, height, 24);
  context.fill();
  context.stroke();

  drawHudPortrait(context, x, y, portraitWidth, height, instructorImage);

  context.fillStyle = "#e1bf75";
  context.font = '700 14px "Segoe UI", sans-serif';
  context.fillText("VENEZITO", textX, y + 24);

  context.fillStyle = "#fff3d7";
  context.font = '600 18px "Segoe UI", sans-serif';
  drawWrappedText(context, message, textX, y + 50, textWidth, 26);

  context.restore();
}

function drawHudPortrait(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  image?: LoadedImageSource | null,
) {
  context.save();
  context.beginPath();
  context.roundRect(x, y, width, height, [24, 0, 0, 24]);
  context.clip();

  if (image) {
    const { width: sourceWidth, height: sourceHeight } =
      getImageSourceSize(image);

    if (sourceWidth > 0 && sourceHeight > 0) {
      const scale = Math.min(width / sourceWidth, height / sourceHeight);
      const drawWidth = sourceWidth * scale;
      const drawHeight = sourceHeight * scale;
      const drawX = x + (width - drawWidth) / 2;
      const drawY = y + (height - drawHeight) / 2;

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        image,
        Math.round(drawX + 5),
        Math.round(drawY),
        drawWidth,
        drawHeight,
      );
    }
  } else {
    const centerX = x + width / 2;
    context.fillStyle = "#d9b276";
    context.beginPath();
    context.arc(centerX, y + height * 0.34, height * 0.16, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#7c4f32";
    context.beginPath();
    context.roundRect(
      x + width * 0.24,
      y + height * 0.48,
      width * 0.52,
      height * 0.3,
      16,
    );
    context.fill();
  }

  context.restore();
}

function drawForegroundPickupUnloadEvents(
  context: CanvasRenderingContext2D,
  distance: number,
  events: MapEvent[],
  activeEventId: number | null,
  loadedDirt: boolean,
  rearLoaded: boolean,
  pickupUnloadTruckImage?: LoadedImageSource | null,
) {
  for (const event of events) {
    const visualX = getEventVisualScreenX(
      event,
      distance,
      loadedDirt,
      rearLoaded,
    );
    const hitboxX = getEventHitboxScreenX(event, distance);
    const eventType = resolveMapEventType(event, loadedDirt, rearLoaded);
    const hitboxHalfWidth = getEventDefinition(eventType).hitboxHalfWidth;

    if (
      eventType !== "pickup-unload" ||
      (!isEventScreenXVisible(visualX) && !isEventScreenXVisible(hitboxX))
    ) {
      continue;
    }

    drawTruck(
      context,
      visualX,
      hitboxX,
      hitboxHalfWidth,
      event.id === activeEventId,
      pickupUnloadTruckImage,
    );
  }
}

function drawForeground(
  context: CanvasRenderingContext2D,
  distance: number,
  foregroundImage?: LoadedImageSource | null,
) {
  if (foregroundImage) {
    drawForegroundSprite(context, distance, foregroundImage);
    return;
  }

  const markerOffset = (distance * 1.2) % 260;

  for (let x = markerOffset - 260; x < CANVAS_WIDTH + 260; x += 260) {
    context.fillStyle = "#f5f0d0";
    context.fillRect(x, GROUND_Y - 41, 14, 86);
    context.fillStyle = "#d64a2f";
    context.fillRect(x - 12, GROUND_Y - 45, 38, 18);
  }
}

function drawForegroundSprite(
  context: CanvasRenderingContext2D,
  distance: number,
  foregroundImage: LoadedImageSource,
) {
  const { width: sourceWidth, height: sourceHeight } =
    getImageSourceSize(foregroundImage);

  if (!sourceWidth || !sourceHeight) {
    return;
  }

  const drawWidth = CANVAS_WIDTH + 40;
  const scale = drawWidth / sourceWidth;
  const drawHeight = sourceHeight * scale;
  const drawY = FOREGROUND_DRAW_TOP_Y - FOREGROUND_SPRITE_TOP_Y * scale;
  const scrollOffset = (distance * FOREGROUND_LAYER_SPEED) % drawWidth;
  const startX = scrollOffset - drawWidth - 20;

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  for (let x = startX; x < CANVAS_WIDTH + drawWidth; x += drawWidth) {
    context.drawImage(foregroundImage, x, drawY, drawWidth, drawHeight);
  }

  context.restore();
}

function drawPickupDirt(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  hitboxHalfWidth: number,
  isActive: boolean,
) {
  context.save();
  context.fillStyle = isActive ? "#6f4e2e" : "#8c673e";
  context.beginPath();
  context.moveTo(visualX - 36, GROUND_Y + 18);
  context.lineTo(visualX - 10, GROUND_Y - 8);
  context.lineTo(visualX + 18, GROUND_Y + 12);
  context.lineTo(visualX + 34, GROUND_Y + 18);
  context.closePath();
  context.fill();
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  drawEventHitboxOutline(context, hitboxX, hitboxHalfWidth, GROUND_Y - 18, 48);
  context.restore();
}

function drawPickupDirtBackdrop(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  hitboxHalfWidth: number,
  isActive: boolean,
  dirtImage?: LoadedImageSource | null,
) {
  if (dirtImage) {
    drawPlacedSprite(
      context,
      dirtImage,
      visualX + PICKUP_DIRT_OFFSET_X,
      PICKUP_DIRT_BASE_Y,
      PICKUP_DIRT_DRAW_HEIGHT,
    );
    context.save();
    context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
    context.lineWidth = 2;
    drawEventHitboxOutline(
      context,
      hitboxX,
      hitboxHalfWidth,
      GROUND_Y - 18,
      48,
    );
    context.restore();
    return;
  }

  drawPickupDirt(context, visualX, hitboxX, hitboxHalfWidth, isActive);
}

function drawFourByFourHudIcon(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  enabled: boolean,
) {
  context.save();
  const accentFill = enabled ? "#fff0a8" : "rgba(255, 243, 215, 0.26)";
  const accentStroke = enabled ? "#fff2a8" : "rgba(255, 243, 215, 0.4)";

  context.strokeStyle = accentStroke;
  context.lineWidth = 2.5;
  context.beginPath();
  context.moveTo(centerX - 12, centerY + 9);
  context.lineTo(centerX + 12, centerY + 9);
  context.moveTo(centerX, centerY - 10);
  context.lineTo(centerX, centerY + 5);
  context.stroke();

  for (const wheelCenter of [
    [-12, -9],
    [12, -9],
    [-12, 9],
    [12, 9],
  ] as const) {
    context.fillStyle = accentFill;
    context.beginPath();
    context.arc(
      centerX + wheelCenter[0],
      centerY + wheelCenter[1],
      4,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  context.restore();
}

function drawQuestionChoiceCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  directionLabel: string,
  label: string,
) {
  context.save();
  context.fillStyle = "rgba(255, 245, 220, 0.06)";
  context.strokeStyle = "rgba(255, 229, 178, 0.18)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(x, y, width, 104, 20);
  context.fill();
  context.stroke();

  context.fillStyle = "rgba(255, 214, 133, 0.12)";
  context.beginPath();
  context.roundRect(x + 18, y + 18, 44, 44, 14);
  context.fill();

  context.fillStyle = "#f0cb75";
  context.font = '700 24px "Segoe UI", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(directionLabel, x + 40, y + 42);

  context.fillStyle = "#fff3d7";
  context.font = '600 18px "Segoe UI", sans-serif';
  context.textAlign = "start";
  context.textBaseline = "alphabetic";
  drawWrappedText(context, label, x + 78, y + 40, width - 100, 24);
  context.restore();
}

function drawSpeechBubble(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  text: string,
) {
  context.save();
  context.fillStyle = "rgba(255, 245, 220, 0.95)";
  context.strokeStyle = "rgba(111, 76, 40, 0.28)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(x, y, width, 112, 24);
  context.fill();
  context.stroke();

  context.beginPath();
  context.moveTo(x + 70, y + 112);
  context.lineTo(x + 94, y + 112);
  context.lineTo(x + 82, y + 132);
  context.closePath();
  context.fill();

  context.fillStyle = "#4e3218";
  context.font = '700 22px "Segoe UI", sans-serif';
  drawWrappedText(context, text, x + 24, y + 40, width - 48, 28);
  context.restore();
}

function drawInstructionCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  keyLabel: string,
  title: string,
  description: string,
) {
  context.save();
  context.fillStyle = "rgba(26, 19, 13, 0.96)";
  context.strokeStyle = "rgba(255, 229, 178, 0.28)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(x, y, width, height, 18);
  context.fill();
  context.stroke();

  context.fillStyle = "rgba(255, 214, 133, 0.12)";
  context.beginPath();
  context.roundRect(x + 16, y + 16, 44, 44, 14);
  context.fill();

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#fff3d7";
  context.font = '700 22px "Segoe UI", sans-serif';
  context.fillText(keyLabel, x + 38, y + 38);

  context.textAlign = "start";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#f0cb75";
  context.font = '700 16px "Segoe UI", sans-serif';
  context.fillText(title.toUpperCase(), x + 74, y + 32);

  context.fillStyle = "#fff3d7";
  context.font = '600 15px "Segoe UI", sans-serif';
  drawWrappedText(context, description, x + 74, y + 56, width - 92, 20);
  context.restore();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const lines = getWrappedTextLines(context, text, maxWidth);
  let currentY = y;

  for (const line of lines) {
    context.fillText(line, x, currentY);
    currentY += lineHeight;
  }
}

function drawWrappedParagraphText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxHeight: number,
) {
  const paragraphs = text.split("\n\n");
  let currentY = y;

  for (const paragraph of paragraphs) {
    if (currentY > y + maxHeight) {
      break;
    }

    const beforeParagraph = currentY;
    drawWrappedText(context, paragraph, x, currentY, maxWidth, lineHeight);
    currentY =
      measureWrappedTextHeight(context, paragraph, maxWidth, lineHeight) +
      beforeParagraph +
      14;
  }
}

function measureWrappedTextHeight(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
) {
  return getWrappedTextLines(context, text, maxWidth).length * lineHeight;
}

function getWrappedTextLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const cacheKey = `${context.font}__${maxWidth}__${text}`;
  const cachedLines = WRAPPED_TEXT_LAYOUT_CACHE.get(cacheKey);

  if (cachedLines) {
    return cachedLines;
  }

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  if (WRAPPED_TEXT_LAYOUT_CACHE.size >= 200) {
    const oldestKey = WRAPPED_TEXT_LAYOUT_CACHE.keys().next().value;

    if (oldestKey) {
      WRAPPED_TEXT_LAYOUT_CACHE.delete(oldestKey);
    }
  }

  WRAPPED_TEXT_LAYOUT_CACHE.set(cacheKey, lines);

  return lines;
}

function drawMudPatch(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  hitboxHalfWidth: number,
  isActive: boolean,
  mudImage?: LoadedImageSource | null,
) {
  if (mudImage) {
    drawPlacedSprite(
      context,
      mudImage,
      visualX + MUD_OFFSET_X,
      MUD_BASE_Y,
      MUD_DRAW_HEIGHT,
    );
    context.save();
    context.strokeStyle = isActive
      ? "rgba(255, 231, 156, 0.5)"
      : "rgba(255,255,255,0.18)";
    context.lineWidth = 2;
    context.setLineDash([10, 8]);
    drawEventHitboxOutline(
      context,
      hitboxX,
      hitboxHalfWidth + TRACTION_SCORE_LENIENCY_MARGIN,
      GROUND_Y - 8,
      70,
    );
    context.setLineDash([]);
    context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
    drawEventHitboxOutline(context, hitboxX, hitboxHalfWidth, GROUND_Y + 2, 50);
    context.restore();
    return;
  }

  context.save();
  context.fillStyle = isActive ? "#453217" : "#5b4322";
  context.beginPath();
  context.ellipse(visualX, GROUND_Y + 26, 48, 18, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(143, 112, 62, 0.75)";
  context.beginPath();
  context.ellipse(visualX - 14, GROUND_Y + 22, 14, 6, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = isActive
    ? "rgba(255, 231, 156, 0.5)"
    : "rgba(255,255,255,0.18)";
  context.lineWidth = 2;
  context.setLineDash([10, 8]);
  drawEventHitboxOutline(
    context,
    hitboxX,
    hitboxHalfWidth + TRACTION_SCORE_LENIENCY_MARGIN,
    GROUND_Y - 8,
    70,
  );
  context.setLineDash([]);
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  drawEventHitboxOutline(context, hitboxX, hitboxHalfWidth, GROUND_Y + 2, 50);
  context.restore();
}

function drawRearDitch(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  hitboxHalfWidth: number,
  isActive: boolean,
  holeImage?: LoadedImageSource | null,
) {
  if (holeImage) {
    drawPlacedSprite(
      context,
      holeImage,
      visualX + HOLE_OFFSET_X,
      HOLE_BASE_Y,
      HOLE_DRAW_HEIGHT,
    );
    context.save();
    context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
    context.lineWidth = 2;
    drawEventHitboxOutline(context, hitboxX, hitboxHalfWidth, GROUND_Y + 2, 50);
    context.restore();
    return;
  }

  context.save();
  context.fillStyle = "#4f361b";
  context.beginPath();
  context.ellipse(visualX, GROUND_Y + 24, 60, 22, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#2a1b0d";
  context.beginPath();
  context.ellipse(visualX + 8, GROUND_Y + 26, 34, 10, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  drawEventHitboxOutline(context, hitboxX, hitboxHalfWidth, GROUND_Y + 2, 50);
  context.restore();
}

function drawTruck(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  hitboxHalfWidth: number,
  isActive: boolean,
  truckImage?: LoadedImageSource | null,
) {
  if (truckImage) {
    drawPickupUnloadTruckSprite(
      context,
      visualX,
      hitboxX,
      hitboxHalfWidth,
      isActive,
      truckImage,
    );
    return;
  }

  context.save();
  context.fillStyle = "#35506d";
  context.fillRect(visualX - 76, GROUND_Y - 118, 110, 58);
  context.fillStyle = "#d7e1eb";
  context.fillRect(visualX + 34, GROUND_Y - 104, 44, 44);
  context.fillStyle = "#bb6d37";
  context.fillRect(visualX - 118, GROUND_Y - 92, 44, 32);
  context.fillStyle = "#1c2430";
  context.beginPath();
  context.arc(visualX - 58, GROUND_Y - 52, 18, 0, Math.PI * 2);
  context.arc(visualX + 38, GROUND_Y - 52, 18, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  drawEventHitboxOutline(
    context,
    hitboxX,
    hitboxHalfWidth,
    GROUND_Y - 126,
    104,
  );
  context.restore();
}

function drawPickupUnloadTruckSprite(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  hitboxHalfWidth: number,
  isActive: boolean,
  truckImage: LoadedImageSource,
) {
  const { width: sourceWidth, height: sourceHeight } =
    getImageSourceSize(truckImage);

  if (!sourceWidth || !sourceHeight) {
    drawTruck(context, visualX, hitboxX, hitboxHalfWidth, isActive);
    return;
  }

  const drawWidth = PICKUP_UNLOAD_TRUCK_DRAW_WIDTH;
  const drawHeight = (sourceHeight / sourceWidth) * drawWidth;
  const baseOffsetY =
    (PICKUP_UNLOAD_TRUCK_BASE_SOURCE_Y / sourceHeight) * drawHeight;
  const drawX = visualX + PICKUP_UNLOAD_TRUCK_CENTER_OFFSET_X - drawWidth / 2;
  const drawY = PICKUP_UNLOAD_TRUCK_BASE_Y - baseOffsetY;

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(truckImage, drawX, drawY, drawWidth, drawHeight);
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  drawEventHitboxOutline(
    context,
    hitboxX,
    hitboxHalfWidth,
    GROUND_Y - 126,
    104,
  );
  context.restore();
}

function drawSignage(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  hitboxHalfWidth: number,
  isActive: boolean,
  signImage?: LoadedImageSource | null,
) {
  if (signImage) {
    drawPlacedSprite(
      context,
      signImage,
      visualX + WORK_SIGN_OFFSET_X,
      WORK_SIGN_BASE_Y,
      WORK_SIGN_DRAW_HEIGHT,
    );
    context.save();
    context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
    context.lineWidth = 2;
    drawEventHitboxOutline(
      context,
      hitboxX,
      hitboxHalfWidth,
      GROUND_Y - 174,
      204,
    );
    context.restore();
    return;
  }

  context.save();
  context.fillStyle = "#e7e3cc";
  context.fillRect(visualX - 8, GROUND_Y - 120, 16, 122);
  context.fillStyle = "#d2492f";
  context.fillRect(visualX - 54, GROUND_Y - 170, 108, 54);
  context.fillStyle = "#f5f0d0";
  context.fillRect(visualX - 44, GROUND_Y - 160, 88, 34);
  context.fillStyle = "#d64a2f";
  context.fillRect(visualX - 100, GROUND_Y - 16, 28, 36);
  context.fillRect(visualX + 72, GROUND_Y - 16, 28, 36);
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  drawEventHitboxOutline(
    context,
    hitboxX,
    hitboxHalfWidth,
    GROUND_Y - 174,
    204,
  );
  context.restore();
}

function drawGreaseMarker(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  hitboxHalfWidth: number,
  isActive: boolean,
  signImage?: LoadedImageSource | null,
  instructorImage?: LoadedImageSource | null,
  greaseAnimationActive?: boolean,
) {
  if (signImage) {
    if (instructorImage && !greaseAnimationActive) {
      drawPlacedSprite(
        context,
        instructorImage,
        visualX + GREASE_VENEZITO_OFFSET_X,
        GREASE_VENEZITO_BASE_Y,
        GREASE_VENEZITO_DRAW_HEIGHT,
      );
    }

    drawPlacedSprite(
      context,
      signImage,
      visualX + GREASE_SIGN_OFFSET_X,
      GREASE_SIGN_BASE_Y,
      GREASE_SIGN_DRAW_HEIGHT,
    );
    context.save();
    context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
    context.lineWidth = 2;
    drawEventHitboxOutline(
      context,
      hitboxX,
      hitboxHalfWidth,
      GROUND_Y - 192,
      216,
    );
    context.restore();
    return;
  }

  context.save();
  context.fillStyle = "#e7e3cc";
  context.fillRect(visualX - 8, GROUND_Y - 120, 16, 122);
  context.fillStyle = isActive ? "#c98b2d" : "#7d5b28";
  context.beginPath();
  context.roundRect(visualX - 64, GROUND_Y - 188, 128, 62, 18);
  context.fill();
  context.fillStyle = "#fff3d7";
  context.font = '700 22px "Segoe UI", sans-serif';
  context.fillText("GRAXA", visualX - 40, GROUND_Y - 149);
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  drawEventHitboxOutline(
    context,
    hitboxX,
    hitboxHalfWidth,
    GROUND_Y - 192,
    216,
  );
  context.restore();
}

function drawEventHitboxOutline(
  context: CanvasRenderingContext2D,
  hitboxX: number,
  hitboxHalfWidth: number,
  topY: number,
  height: number,
) {
  context.strokeRect(
    hitboxX - hitboxHalfWidth,
    topY,
    hitboxHalfWidth * 2 * 0,
    height * 0,
  );
}

function drawPlacedSprite(
  context: CanvasRenderingContext2D,
  image: LoadedImageSource,
  centerX: number,
  baseY: number,
  drawHeight: number,
) {
  const { width: sourceWidth, height: sourceHeight } =
    getImageSourceSize(image);

  if (!sourceWidth || !sourceHeight) {
    return;
  }

  const drawWidth = (sourceWidth / sourceHeight) * drawHeight;
  const drawX = centerX - drawWidth / 2;
  const drawY = baseY - drawHeight;

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();
}
