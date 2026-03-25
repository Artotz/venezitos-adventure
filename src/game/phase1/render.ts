import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  EVENT_HITBOX_HALF_WIDTH,
  GROUND_Y,
  PHASE1_START_MODAL_DESCRIPTION,
  PHASE1_START_MODAL_HINT,
  PHASE1_START_MODAL_TITLE,
  TRACTION_SCORE_LENIENCY_MARGIN,
} from "./config";
import { drawExcavator } from "../retro/render";
import {
  computeWorldMatrices,
  createScaleMatrix,
  createTranslationMatrix,
  multiplyMatrices,
} from "../retro/geometry";
import type { LayerName } from "../retro/types";
import {
  getEventHitboxScreenX,
  getEventVisualScreenX,
  isEventScreenXVisible,
  resolveMapEventType,
} from "./eventPositioner";
import type { MapEvent, QuestionModalState } from "./types";

type Phase1SceneParams = {
  context: CanvasRenderingContext2D;
  distance: number;
  events: MapEvent[];
  activeEventId: number | null;
  loadedDirt: boolean;
  rearLoaded: boolean;
};

type Phase1HudParams = {
  context: CanvasRenderingContext2D;
  score: number;
  distance: number;
  differentialLockEnabled: boolean;
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
}: Phase1SceneParams) {
  drawBackground(
    context,
    distance,
    events,
    activeEventId,
    loadedDirt,
    rearLoaded,
  );
  drawGround(context, distance, events, activeEventId, loadedDirt, rearLoaded);
  drawForeground(context, distance);
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

export function drawPhase1Hud({
  context,
  score,
  distance,
  differentialLockEnabled,
}: Phase1HudParams) {
  const hudY = 26;
  const leftX = 28;
  const centerX = CANVAS_WIDTH / 2 - 140;
  const rightX = CANVAS_WIDTH - 292;

  drawHudCard(context, leftX, hudY, "Pontuacao", String(score));
  drawDifferentialLockCard(context, centerX, hudY, differentialLockEnabled);
  drawHudCard(
    context,
    rightX,
    hudY,
    "Distancia",
    `${Math.floor(distance / 10)} m`,
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
    machineStageY + 18,
    260,
    82,
    "W",
    "Nao faz nada",
    "Ainda nao foi atribuido.",
  );
  drawInstructionCard(
    context,
    machineStageX + 18,
    centerY - 44,
    224,
    92,
    "A",
    "Pickup",
    "Eventos de pickup.",
  );
  drawInstructionCard(
    context,
    machineStageX + machineStageWidth - 242,
    centerY - 44,
    224,
    92,
    "D",
    "Dig",
    "Eventos de dig.",
  );
  drawInstructionCard(
    context,
    centerX - 130,
    machineStageY + machineStageHeight - 100,
    260,
    82,
    "S",
    "Tracao",
    "Liga o bloqueio.",
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

  if (image instanceof HTMLImageElement) {
    const maxWidth = width - 52;
    const maxHeight = height - 152;
    const scale = Math.min(
      maxWidth / image.naturalWidth,
      maxHeight / image.naturalHeight,
    );
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
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
  events: MapEvent[],
  activeEventId: number | null,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  const farOffset = (distance * 0.08) % 320;
  const midOffset = (distance * 0.18) % 280;
  const backgroundYOffset = GROUND_Y - 485;

  context.fillStyle = "rgba(255, 244, 214, 0.25)";
  context.beginPath();
  context.arc(910, 110, 58, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#6d8b57";
  for (let x = farOffset - 320; x < CANVAS_WIDTH + 320; x += 320) {
    context.beginPath();
    context.moveTo(x, 480 + backgroundYOffset);
    context.lineTo(x + 140, 350 + backgroundYOffset);
    context.lineTo(x + 300, 480 + backgroundYOffset);
    context.closePath();
    context.fill();
  }

  context.fillStyle = "#8f6c46";
  for (let x = midOffset - 280; x < CANVAS_WIDTH + 280; x += 280) {
    context.fillRect(x + 40, 370 + backgroundYOffset, 30, 120);
    context.beginPath();
    context.arc(x + 55, 355 + backgroundYOffset, 44, 0, Math.PI * 2);
    context.fill();
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

    if (!isEventScreenXVisible(visualX) && !isEventScreenXVisible(hitboxX)) {
      continue;
    }

    if (eventType === "pickup-unload") {
      drawTruck(context, visualX, hitboxX, event.id === activeEventId);
    }

    if (eventType === "dig-load") {
      drawSignage(context, visualX, hitboxX, event.id === activeEventId);
    }

    if (eventType === "question") {
      drawQuestionMarker(context, visualX, hitboxX, event.id === activeEventId);
    }
  }
}

function drawGround(
  context: CanvasRenderingContext2D,
  distance: number,
  events: MapEvent[],
  activeEventId: number | null,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  context.fillStyle = "#a77943";
  context.fillRect(0, GROUND_Y - 8, CANVAS_WIDTH, 90);

  context.fillStyle = "#6e4b2a";
  context.fillRect(0, GROUND_Y + 46, CANVAS_WIDTH, 90);

  context.fillStyle = "#d8b16c";
  const laneOffset = distance % 120;
  for (let x = laneOffset - 120; x < CANVAS_WIDTH + 120; x += 120) {
    context.fillRect(x, GROUND_Y + 12, 70, 8);
  }

  context.fillStyle = "rgba(40, 23, 10, 0.28)";
  const dirtOffset = (distance * 1.4) % 90;
  for (let x = dirtOffset - 90; x < CANVAS_WIDTH + 90; x += 90) {
    context.beginPath();
    context.ellipse(x + 20, GROUND_Y + 58, 24, 8, 0, 0, Math.PI * 2);
    context.fill();
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

    if (!isEventScreenXVisible(visualX) && !isEventScreenXVisible(hitboxX)) {
      continue;
    }

    const isActive = event.id === activeEventId;

    if (eventType === "pickup-load") {
      drawPickupDirt(context, visualX, hitboxX, isActive);
    }

    if (eventType === "dig-unload") {
      drawRearDitch(context, visualX, hitboxX, isActive);
    }

    if (eventType === "traction") {
      drawMudPatch(context, visualX, hitboxX, isActive);
    }
  }
}

function drawHudCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: string,
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

  context.fillStyle = "rgba(255, 243, 215, 0.14)";
  context.beginPath();
  context.arc(x + 216, y + 42, 12, 0, Math.PI * 2);
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
  context.fillText("BLOQ. DIF.", x + 22, y + 24);

  context.fillStyle = enabled ? "#fff0a8" : "#fff3d7";
  context.font = '700 28px "Segoe UI", sans-serif';
  context.fillText(enabled ? "LIGADO" : "DESLIGADO", x + 22, y + 60);

  drawDifferentialLockIcon(context, x + 212, y + 20, enabled);
  context.restore();
}

function drawForeground(context: CanvasRenderingContext2D, distance: number) {
  const markerOffset = (distance * 1.2) % 260;

  for (let x = markerOffset - 260; x < CANVAS_WIDTH + 260; x += 260) {
    context.fillStyle = "#f5f0d0";
    context.fillRect(x, GROUND_Y - 41, 14, 86);
    context.fillStyle = "#d64a2f";
    context.fillRect(x - 12, GROUND_Y - 45, 38, 18);
  }
}

function drawPickupDirt(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
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
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 18,
    EVENT_HITBOX_HALF_WIDTH * 2,
    48,
  );
  context.restore();
}

function drawQuestionMarker(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save();
  context.fillStyle = "#e8ddba";
  context.fillRect(visualX - 10, GROUND_Y - 144, 20, 146);
  context.fillStyle = isActive ? "#d68b1f" : "#ae3a26";
  context.beginPath();
  context.roundRect(visualX - 54, GROUND_Y - 210, 108, 66, 18);
  context.fill();
  context.fillStyle = "#fff3d7";
  context.font = '700 44px "Segoe UI", sans-serif';
  context.fillText("?", visualX - 14, GROUND_Y - 160);
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 214,
    EVENT_HITBOX_HALF_WIDTH * 2,
    220,
  );
  context.restore();
}

function drawDifferentialLockIcon(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  enabled: boolean,
) {
  context.save();
  context.strokeStyle = enabled ? "#fff2a8" : "rgba(255, 243, 215, 0.24)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(x + 6, y + 22);
  context.lineTo(x + 26, y + 22);
  context.moveTo(x + 34, y + 22);
  context.lineTo(x + 54, y + 22);
  context.stroke();

  context.fillStyle = enabled ? "#fff0a8" : "rgba(255, 243, 215, 0.18)";
  context.beginPath();
  context.arc(x + 6, y + 22, 6, 0, Math.PI * 2);
  context.arc(x + 54, y + 22, 6, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = enabled ? "#fff0a8" : "rgba(255, 243, 215, 0.28)";
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(x + 20, y + 8, 20, 28, 8);
  context.stroke();
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
  const words = text.split(" ");
  let currentLine = "";
  let currentY = y;

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      continue;
    }

    context.fillText(currentLine, x, currentY);
    currentLine = word;
    currentY += lineHeight;
  }

  if (currentLine) {
    context.fillText(currentLine, x, currentY);
  }
}

function drawMudPatch(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
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
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH - TRACTION_SCORE_LENIENCY_MARGIN,
    GROUND_Y - 8,
    (EVENT_HITBOX_HALF_WIDTH + TRACTION_SCORE_LENIENCY_MARGIN) * 2,
    70,
  );
  context.setLineDash([]);
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y + 2,
    EVENT_HITBOX_HALF_WIDTH * 2,
    50,
  );
  context.restore();
}

function drawRearDitch(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
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
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y + 2,
    EVENT_HITBOX_HALF_WIDTH * 2,
    50,
  );
  context.restore();
}

function drawTruck(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
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
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 126,
    EVENT_HITBOX_HALF_WIDTH * 2,
    104,
  );
  context.restore();
}

function drawSignage(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
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
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 174,
    EVENT_HITBOX_HALF_WIDTH * 2,
    204,
  );
  context.restore();
}
