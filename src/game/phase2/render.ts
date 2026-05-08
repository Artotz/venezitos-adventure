import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_GAP,
  CELL_SIZE,
  FIELD_HEIGHT,
  FIELD_LEFT,
  FIELD_TOP,
  FIELD_WIDTH,
} from "./config";
import type { Phase2Cell, Phase2GameSnapshot } from "./types";

export function drawPhase2Scene(
  context: CanvasRenderingContext2D,
  game: Phase2GameSnapshot,
) {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawBackdrop(context);
  drawField(context, game.cells);
  drawTractor(context, game);
  drawHud(context, game);
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

function drawField(context: CanvasRenderingContext2D, cells: Phase2Cell[]) {
  for (const cell of cells) {
    const x = FIELD_LEFT + cell.column * CELL_SIZE + CELL_GAP / 2;
    const y = FIELD_TOP + cell.row * CELL_SIZE + CELL_GAP / 2;
    const size = CELL_SIZE - CELL_GAP;

    context.fillStyle = cell.cut ? "#8a6137" : getGrassColor(cell.column, cell.row);
    context.fillRect(x, y, size, size);

    if (cell.cut) {
      drawDirtTexture(context, x, y, size, cell.id);
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

function drawTractor(context: CanvasRenderingContext2D, game: Phase2GameSnapshot) {
  const { tractor } = game;

  context.save();
  context.translate(tractor.x, tractor.y);
  context.rotate(tractor.angle);

  context.fillStyle = "rgba(22, 24, 18, 0.25)";
  context.fillRect(
    -tractor.width / 2 - 8,
    -tractor.height / 2 + 8,
    tractor.width + 16,
    tractor.height,
  );

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

  context.strokeStyle = "rgba(255, 255, 255, 0.18)";
  context.lineWidth = 3;
  context.strokeRect(-tractor.width / 2, -tractor.height / 2, tractor.width, tractor.height);

  context.restore();
}

function drawHud(context: CanvasRenderingContext2D, game: Phase2GameSnapshot) {
  context.fillStyle = "rgba(18, 26, 18, 0.82)";
  context.fillRect(28, 28, 430, 146);

  context.strokeStyle = "rgba(229, 214, 164, 0.22)";
  context.lineWidth = 2;
  context.strokeRect(28, 28, 430, 146);

  context.fillStyle = "#f4ead0";
  context.font = '700 22px "Segoe UI", sans-serif';
  context.fillText("Fase 2 - Corte de grama", 52, 66);

  context.fillStyle = "#d8c9a6";
  context.font = '16px "Segoe UI", sans-serif';
  context.fillText("WASD / setas movem o trator", 52, 94);
  context.fillText(`Celulas: ${game.cutCells}/${game.totalCells}`, 52, 120);
  context.fillText(`Tempo: ${game.elapsedTime.toFixed(1)}s`, 52, 146);

  const barX = CANVAS_WIDTH - 390;
  const barY = 38;
  const barWidth = 330;
  const barHeight = 24;

  context.fillStyle = "rgba(18, 26, 18, 0.78)";
  context.fillRect(barX - 24, 28, barWidth + 48, 96);
  context.strokeStyle = "rgba(229, 214, 164, 0.22)";
  context.strokeRect(barX - 24, 28, barWidth + 48, 96);

  context.fillStyle = "#f4ead0";
  context.font = '700 18px "Segoe UI", sans-serif';
  context.fillText(`Progresso ${Math.round(game.progress * 100)}%`, barX, 58);

  context.fillStyle = "#3a4b31";
  context.fillRect(barX, barY + 34, barWidth, barHeight);
  context.fillStyle = game.isComplete ? "#f0c34e" : "#95c954";
  context.fillRect(barX, barY + 34, barWidth * game.progress, barHeight);
  context.strokeStyle = "rgba(255, 255, 255, 0.18)";
  context.strokeRect(barX, barY + 34, barWidth, barHeight);

  context.fillStyle = game.isComplete ? "#f0c34e" : "#f4ead0";
  context.font = '700 18px "Segoe UI", sans-serif';
  context.textAlign = "right";
  context.fillText(game.message, CANVAS_WIDTH - 52, CANVAS_HEIGHT - 34);
  context.textAlign = "left";
}

function getGrassColor(column: number, row: number) {
  return (column + row) % 2 === 0 ? "#4f9b3f" : "#5daa46";
}
