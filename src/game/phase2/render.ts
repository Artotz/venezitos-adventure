import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_SCORE_VALUE,
  CELL_GAP,
  CELL_SIZE,
  FIELD_HEIGHT,
  FIELD_LEFT,
  FIELD_TOP,
  FIELD_WIDTH,
  PLANTER_HEIGHT,
  PLANTER_WIDTH,
  PLOW_HEIGHT,
  PLOW_WIDTH,
  SPRAYER_HEIGHT,
  SPRAYER_WIDTH,
  STAGE_DURATION_SECONDS,
} from "./config";
import type { Phase2GameSnapshot } from "./types";
import type { Phase2VehicleSprites } from "./usePhase2TractorSprite";

export function drawPhase2Scene(
  context: CanvasRenderingContext2D,
  game: Phase2GameSnapshot,
  vehicleSprites: Phase2VehicleSprites,
) {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawBackdrop(context);
  drawField(context, game);
  drawVehicle(context, game, vehicleSprites);
  drawHud(context, game);
  if (game.stage === "cane" && game.isComplete) {
    drawCompletionMessage(context, game);
  }
}

function drawBackdrop(context: CanvasRenderingContext2D) {
  context.fillStyle = "#6f8f4f";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "#58723f";
  for (let y = 0; y < CANVAS_HEIGHT; y += 36) {
    context.fillRect(0, y, CANVAS_WIDTH, 18);
  }

  context.fillStyle = "#4e6b39";
  context.fillRect(FIELD_LEFT - 18, FIELD_TOP - 18, FIELD_WIDTH + 36, FIELD_HEIGHT + 36);

  context.strokeStyle = "rgba(29, 43, 26, 0.42)";
  context.lineWidth = 8;
  context.strokeRect(FIELD_LEFT - 18, FIELD_TOP - 18, FIELD_WIDTH + 36, FIELD_HEIGHT + 36);
}

function drawField(context: CanvasRenderingContext2D, game: Phase2GameSnapshot) {
  for (const cell of game.cells) {
    const x = FIELD_LEFT + cell.column * CELL_SIZE + CELL_GAP / 2;
    const y = FIELD_TOP + cell.row * CELL_SIZE + CELL_GAP / 2;
    const size = CELL_SIZE - CELL_GAP;

    const isSoil = cell.cut;

    context.fillStyle = isSoil
      ? getSoilColor(cell.column, cell.row)
      : getGrassColor(cell.column, cell.row);
    context.fillRect(x, y, size, size);

    if (isSoil) {
      drawDirtTexture(context, x, y, size, cell.id);
      if (cell.planted) {
        drawPlantingTexture(context, x, y, size, cell.id);
      }
      if (cell.cane) {
        drawCaneTexture(context, x, y, size, cell.id, game.isComplete);
      }
    } else {
      drawGrassTexture(context, x, y, size, cell.id);
    }
  }
}

function drawGrassTexture(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  seed: number,
) {
  context.strokeStyle = "rgba(218, 236, 148, 0.24)";
  context.lineWidth = 2;

  for (let index = 0; index < 4; index += 1) {
    const bladeX = x + 8 + ((seed * 17 + index * 11) % Math.max(1, size - 16));
    const bladeY = y + 10 + ((seed * 23 + index * 7) % Math.max(1, size - 20));

    context.beginPath();
    context.moveTo(bladeX, bladeY + 8);
    context.lineTo(bladeX + 3, bladeY);
    context.stroke();
  }
}

function drawDirtTexture(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  seed: number,
) {
  context.fillStyle = "rgba(61, 39, 22, 0.18)";

  for (let index = 0; index < 3; index += 1) {
    const dotX = x + 7 + ((seed * 13 + index * 19) % Math.max(1, size - 14));
    const dotY = y + 7 + ((seed * 29 + index * 5) % Math.max(1, size - 14));

    context.beginPath();
    context.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
    context.fill();
  }
}

function drawVehicle(
  context: CanvasRenderingContext2D,
  game: Phase2GameSnapshot,
  vehicleSprites: Phase2VehicleSprites,
) {
  const implementSprite =
    game.stage === "plowing"
      ? vehicleSprites.plow
      : game.stage === "cane"
        ? vehicleSprites.sprayer
        : vehicleSprites.planter;
  const implementWidth =
    game.stage === "plowing"
      ? PLOW_WIDTH
      : game.stage === "cane"
        ? SPRAYER_WIDTH
        : PLANTER_WIDTH;
  const implementHeight =
    game.stage === "plowing"
      ? PLOW_HEIGHT
      : game.stage === "cane"
        ? SPRAYER_HEIGHT
        : PLANTER_HEIGHT;

  drawImplement(
    context,
    game,
    implementSprite,
    implementWidth,
    implementHeight,
  );
  drawHitch(context, game);
  drawTractor(context, game, vehicleSprites.tractor);
}

function drawPlantingTexture(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  seed: number,
) {
  const greenColors = ["#6fbd55", "#8cd45f", "#4f9b3f"];

  for (let index = 0; index < 7; index += 1) {
    const dotX = x + 6 + ((seed * 11 + index * 17) % Math.max(1, size - 12));
    const dotY = y + 6 + ((seed * 19 + index * 13) % Math.max(1, size - 12));

    context.fillStyle = greenColors[(seed + index) % greenColors.length];
    context.beginPath();
    context.arc(dotX, dotY, index % 2 === 0 ? 2.6 : 2, 0, Math.PI * 2);
    context.fill();
  }
}

function drawCaneTexture(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  seed: number,
  mature: boolean,
) {
  context.strokeStyle = "#2f7f35";
  context.lineWidth = mature ? 3.4 : 2.4;
  const stalks = mature ? 8 : 5;

  for (let index = 0; index < stalks; index += 1) {
    const caneX = x + 5 + ((seed * 13 + index * 7) % Math.max(1, size - 10));
    const baseY = y + size - 4 - ((seed + index * 5) % 5);
    const topY = mature
      ? y + 2 + ((seed * 3 + index * 4) % 7)
      : y + 9 + ((seed * 3 + index * 4) % 10);

    context.beginPath();
    context.moveTo(caneX, baseY);
    context.lineTo(caneX + (index % 2 === 0 ? 5 : -4), topY);
    context.stroke();

    context.fillStyle = index % 2 === 0 ? "#83c84f" : "#6daf42";
    context.beginPath();
    context.ellipse(
      caneX + 4,
      topY + (mature ? 10 : 8),
      mature ? 4.8 : 3.4,
      mature ? 10 : 7,
      -0.45,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
}

function drawCompletionMessage(
  context: CanvasRenderingContext2D,
  game: Phase2GameSnapshot,
) {
  const boxWidth = 640;
  const boxHeight = 178;
  const boxX = CANVAS_WIDTH / 2 - boxWidth / 2;
  const boxY = CANVAS_HEIGHT / 2 - boxHeight / 2;
  const cellPoints =
    (game.cutCells + game.plantedCells + game.caneCells) * CELL_SCORE_VALUE;

  context.fillStyle = "rgba(18, 26, 18, 0.86)";
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = "rgba(240, 195, 78, 0.75)";
  context.lineWidth = 3;
  context.strokeRect(boxX, boxY, boxWidth, boxHeight);

  context.fillStyle = "#f4ead0";
  context.font = '700 36px "Segoe UI", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillText("Muito bem, plantio concluido", CANVAS_WIDTH / 2, boxY + 54);

  context.fillStyle = "#d8c9a6";
  context.font = '18px "Segoe UI", sans-serif';
  context.fillText(
    `Celulas: ${cellPoints.toFixed(1)} pts  |  Tempo total: ${game.totalElapsedTime.toFixed(1)}s`,
    CANVAS_WIDTH / 2,
    boxY + 96,
  );

  context.fillStyle = "#f0c34e";
  context.font = '700 26px "Segoe UI", sans-serif';
  context.fillText(
    `Pontuacao final: ${game.score.toFixed(1)}`,
    CANVAS_WIDTH / 2,
    boxY + 136,
  );
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
}

function drawTractor(
  context: CanvasRenderingContext2D,
  game: Phase2GameSnapshot,
  tractorSprite: CanvasImageSource | null,
) {
  const { tractor } = game;

  context.save();
  context.translate(tractor.x, tractor.y);
  context.rotate(tractor.angle);

  if (tractorSprite) {
    context.drawImage(
      tractorSprite,
      -tractor.width / 2,
      -tractor.height / 2,
      tractor.width,
      tractor.height,
    );
  } else {
    drawFallbackTractor(context, game);
  }

  context.restore();
}

function drawImplement(
  context: CanvasRenderingContext2D,
  game: Phase2GameSnapshot,
  implementSprite: CanvasImageSource | null,
  width: number,
  height: number,
) {
  if (!implementSprite) {
    return;
  }

  context.save();
  context.translate(game.plow.x, game.plow.y);
  context.rotate(game.plow.angle);
  context.drawImage(
    implementSprite,
    -width / 2,
    -height / 2,
    width,
    height,
  );
  context.restore();
}

function drawHitch(context: CanvasRenderingContext2D, game: Phase2GameSnapshot) {
  const tractorRear = projectLocalPoint(
    game.tractor.x,
    game.tractor.y,
    game.tractor.angle,
    0,
    game.tractor.height / 2 - 8,
  );
  const plowFront = projectLocalPoint(
    game.plow.x,
    game.plow.y,
    game.plow.angle,
    0,
    -PLOW_HEIGHT / 2 + 8,
  );

  context.strokeStyle = "#263322";
  context.lineWidth = 6;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(tractorRear.x, tractorRear.y);
  context.lineTo(plowFront.x, plowFront.y);
  context.stroke();

  context.strokeStyle = "#5a6a49";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(tractorRear.x, tractorRear.y);
  context.lineTo(plowFront.x, plowFront.y);
  context.stroke();
}

function projectLocalPoint(
  originX: number,
  originY: number,
  angle: number,
  localX: number,
  localY: number,
) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: originX + localX * cos - localY * sin,
    y: originY + localX * sin + localY * cos,
  };
}

function drawFallbackTractor(context: CanvasRenderingContext2D, game: Phase2GameSnapshot) {
  const { tractor } = game;

  context.fillStyle = "#1b1f1a";
  context.fillRect(-tractor.width / 2 - 12, -tractor.height / 2 + 8, 16, 30);
  context.fillRect(tractor.width / 2 - 4, -tractor.height / 2 + 8, 16, 30);
  context.fillRect(-tractor.width / 2 - 12, tractor.height / 2 - 40, 18, 34);
  context.fillRect(tractor.width / 2 - 6, tractor.height / 2 - 40, 18, 34);

  context.fillStyle = "#216d35";
  context.fillRect(-tractor.width / 2, -tractor.height / 2, tractor.width, tractor.height);

  context.fillStyle = "#e0b747";
  context.fillRect(-tractor.width / 2 + 10, -tractor.height / 2 + 10, tractor.width - 20, 28);
  context.fillRect(-tractor.width / 2 + 14, tractor.height / 2 - 32, tractor.width - 28, 18);

  context.fillStyle = "#23352f";
  context.fillRect(-tractor.width / 2 + 12, -6, tractor.width - 24, 24);

  context.fillStyle = tractor.moving ? "#f4e18d" : "#d8cb8d";
  context.beginPath();
  context.moveTo(0, -tractor.height / 2 - 12);
  context.lineTo(-12, -tractor.height / 2 + 8);
  context.lineTo(12, -tractor.height / 2 + 8);
  context.closePath();
  context.fill();
}

function drawHud(context: CanvasRenderingContext2D, game: Phase2GameSnapshot) {
  context.save();
  context.globalAlpha = 0.76;
  context.fillStyle = "rgba(18, 26, 18, 0.72)";
  context.fillRect(28, 28, 322, 96);

  context.strokeStyle = "rgba(229, 214, 164, 0.18)";
  context.lineWidth = 2;
  context.strokeRect(28, 28, 322, 96);
  context.restore();

  context.fillStyle = "#f4ead0";
  context.font = '700 18px "Segoe UI", sans-serif';
  context.fillText(
    game.stage === "cane"
      ? "Fase 2 - Cana"
      : game.stage === "planting"
        ? "Fase 2 - Plantio"
        : "Fase 2 - Corte de grama",
    46,
    58,
  );

  context.fillStyle = "#d8c9a6";
  context.font = '14px "Segoe UI", sans-serif';
  context.fillText(
    game.stage === "cane"
      ? `Cana: ${game.caneCells}/${game.totalCells}`
      : game.stage === "planting"
        ? `Plantadas: ${game.plantedCells}/${game.totalCells}`
        : `Celulas: ${game.cutCells}/${game.totalCells}`,
    46,
    84,
  );
  context.fillText(
    `Tempo: ${game.elapsedTime.toFixed(1)}/${STAGE_DURATION_SECONDS}s`,
    46,
    108,
  );

  const barX = CANVAS_WIDTH - 314;
  const barY = 38;
  const barWidth = 250;
  const barHeight = 18;
  const cellProgress = getCellProgress(game);

  context.save();
  context.globalAlpha = 0.76;
  context.fillStyle = "rgba(18, 26, 18, 0.72)";
  context.fillRect(barX - 18, 28, barWidth + 36, 76);
  context.strokeStyle = "rgba(229, 214, 164, 0.18)";
  context.strokeRect(barX - 18, 28, barWidth + 36, 76);
  context.restore();

  context.fillStyle = "#f4ead0";
  context.font = '700 16px "Segoe UI", sans-serif';
  context.fillText(`Progresso ${Math.round(cellProgress * 100)}%`, barX, 56);

  context.fillStyle = "#3a4b31";
  context.fillRect(barX, barY + 28, barWidth, barHeight);
  context.fillStyle = game.isComplete ? "#f0c34e" : "#95c954";
  context.fillRect(barX, barY + 28, barWidth * cellProgress, barHeight);
  context.strokeStyle = "rgba(255, 255, 255, 0.18)";
  context.strokeRect(barX, barY + 28, barWidth, barHeight);

  context.fillStyle = game.isComplete ? "#f0c34e" : "#f4ead0";
  context.font = '700 18px "Segoe UI", sans-serif';
  context.textAlign = "right";
  context.fillText(game.message, CANVAS_WIDTH - 52, CANVAS_HEIGHT - 34);
  context.textAlign = "left";
}

function getGrassColor(column: number, row: number) {
  return (column + row) % 2 === 0 ? "#4f9b3f" : "#5daa46";
}

function getCellProgress(game: Phase2GameSnapshot) {
  if (game.stage === "planting") {
    return game.cutCells > 0 ? game.plantedCells / game.cutCells : 0;
  }

  if (game.stage === "cane") {
    return game.plantedCells > 0 ? game.caneCells / game.plantedCells : 0;
  }

  return game.totalCells > 0 ? game.cutCells / game.totalCells : 0;
}

function getSoilColor(column: number, row: number) {
  return (column + row) % 2 === 0 ? "#8a6137" : "#76512f";
}
