import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  ROAD_CENTER_X,
  ROAD_LEFT,
  ROAD_RIGHT,
  ROAD_WIDTH,
  SHOULDER_WIDTH,
} from "./config";
import type { Phase2GameSnapshot, Phase2Obstacle } from "./types";

export function drawPhase2Scene(
  context: CanvasRenderingContext2D,
  game: Phase2GameSnapshot,
) {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawBackdrop(context, game.roadOffset);
  drawRoad(context, game.roadOffset);
  drawObstacles(context, game.obstacles);
  drawTractor(context, game);
  drawHud(context, game);
}

function drawBackdrop(context: CanvasRenderingContext2D, roadOffset: number) {
  const sky = context.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0, "#8fd3ff");
  sky.addColorStop(0.34, "#b9ebff");
  sky.addColorStop(0.34, "#6b9c44");
  sky.addColorStop(1, "#4c6f31");
  context.fillStyle = sky;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "#75994d";
  context.fillRect(0, 120, ROAD_LEFT - SHOULDER_WIDTH * 0.35, CANVAS_HEIGHT);
  context.fillRect(
    ROAD_RIGHT + SHOULDER_WIDTH * 0.35,
    120,
    CANVAS_WIDTH - ROAD_RIGHT,
    CANVAS_HEIGHT,
  );

  context.strokeStyle = "rgba(255, 255, 255, 0.08)";
  context.lineWidth = 3;
  for (let y = -60; y < CANVAS_HEIGHT + 60; y += 58) {
    const stripeY = ((y + roadOffset * 0.35) % (CANVAS_HEIGHT + 120)) - 60;
    context.beginPath();
    context.moveTo(0, stripeY);
    context.lineTo(ROAD_LEFT - 10, stripeY - 24);
    context.stroke();
    context.beginPath();
    context.moveTo(ROAD_RIGHT + 10, stripeY);
    context.lineTo(CANVAS_WIDTH, stripeY - 24);
    context.stroke();
  }
}

function drawRoad(context: CanvasRenderingContext2D, roadOffset: number) {
  context.fillStyle = "#8e6034";
  context.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "#a97846";
  context.fillRect(ROAD_LEFT, 0, 18, CANVAS_HEIGHT);
  context.fillRect(ROAD_RIGHT - 18, 0, 18, CANVAS_HEIGHT);

  context.fillStyle = "rgba(78, 50, 24, 0.22)";
  for (let y = -80; y < CANVAS_HEIGHT + 120; y += 120) {
    const segmentY = ((y + roadOffset) % (CANVAS_HEIGHT + 200)) - 100;
    context.fillRect(ROAD_LEFT + 24, segmentY, ROAD_WIDTH - 48, 54);
  }

  context.strokeStyle = "rgba(245, 223, 168, 0.8)";
  context.lineWidth = 8;
  context.setLineDash([44, 34]);
  context.lineDashOffset = -roadOffset * 1.45;
  context.beginPath();
  context.moveTo(ROAD_CENTER_X, -40);
  context.lineTo(ROAD_CENTER_X, CANVAS_HEIGHT + 40);
  context.stroke();
  context.setLineDash([]);
}

function drawObstacles(
  context: CanvasRenderingContext2D,
  obstacles: Phase2Obstacle[],
) {
  obstacles.forEach((obstacle) => {
    context.save();
    context.translate(obstacle.x, obstacle.y);
    context.rotate(obstacle.rotation);

    context.fillStyle = "rgba(43, 30, 24, 0.32)";
    context.beginPath();
    context.ellipse(0, obstacle.size * 0.1, obstacle.size * 0.68, obstacle.size * 0.52, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#6c625e";
    context.beginPath();
    context.moveTo(-obstacle.size * 0.45, -obstacle.size * 0.2);
    context.lineTo(-obstacle.size * 0.1, -obstacle.size * 0.48);
    context.lineTo(obstacle.size * 0.4, -obstacle.size * 0.24);
    context.lineTo(obstacle.size * 0.48, obstacle.size * 0.18);
    context.lineTo(obstacle.size * 0.1, obstacle.size * 0.46);
    context.lineTo(-obstacle.size * 0.38, obstacle.size * 0.25);
    context.closePath();
    context.fill();

    context.strokeStyle = "#928782";
    context.lineWidth = 4;
    context.stroke();
    context.restore();
  });
}

function drawTractor(context: CanvasRenderingContext2D, game: Phase2GameSnapshot) {
  const { tractor, collisionFlash } = game;
  const left = tractor.x - tractor.width / 2;
  const top = tractor.y - tractor.height / 2;

  context.save();
  context.translate(left, top);

  context.fillStyle = "rgba(14, 20, 18, 0.25)";
  context.fillRect(10, tractor.height - 6, tractor.width - 20, 14);

  context.fillStyle = collisionFlash > 0 ? "#ff8f6b" : "#2d8a42";
  context.fillRect(18, 16, tractor.width - 36, tractor.height - 34);

  context.fillStyle = "#f0c64f";
  context.fillRect(28, 38, tractor.width - 56, 56);
  context.fillRect(34, 106, tractor.width - 68, 28);

  context.fillStyle = "#203a31";
  context.fillRect(32, 24, tractor.width - 64, 38);

  context.fillStyle = "#1e1f1d";
  context.fillRect(-2, 28, 22, 44);
  context.fillRect(tractor.width - 20, 28, 22, 44);
  context.fillRect(4, 102, 18, 50);
  context.fillRect(tractor.width - 22, 102, 18, 50);

  context.fillStyle = "#151614";
  context.fillRect(tractor.width / 2 - 8, 0, 16, 20);

  context.strokeStyle = "rgba(255, 255, 255, 0.18)";
  context.lineWidth = 3;
  context.strokeRect(18, 16, tractor.width - 36, tractor.height - 34);

  context.restore();
}

function drawHud(context: CanvasRenderingContext2D, game: Phase2GameSnapshot) {
  context.fillStyle = "rgba(14, 18, 16, 0.78)";
  context.fillRect(28, 28, 370, 136);

  context.strokeStyle = "rgba(240, 214, 160, 0.2)";
  context.lineWidth = 2;
  context.strokeRect(28, 28, 370, 136);

  context.fillStyle = "#f2e5c3";
  context.font = '700 20px "Segoe UI", sans-serif';
  context.fillText("Fase 2 mockada", 50, 64);

  context.fillStyle = "#d2c29e";
  context.font = '16px "Segoe UI", sans-serif';
  context.fillText("Setas / WASD para mover o trator", 50, 92);
  context.fillText(`Distancia: ${Math.floor(game.distance)} m`, 50, 118);
  context.fillText(`Pontuacao: ${Math.floor(game.score)}`, 50, 142);

  context.textAlign = "right";
  context.fillStyle = "#f7d782";
  context.fillText(`${Math.round(game.speed)} px/s`, CANVAS_WIDTH - 42, 60);
  context.textAlign = "left";

  if (game.message) {
    context.fillStyle = "rgba(14, 18, 16, 0.74)";
    context.fillRect(CANVAS_WIDTH - 470, 28, 430, 60);
    context.strokeStyle = "rgba(240, 214, 160, 0.18)";
    context.strokeRect(CANVAS_WIDTH - 470, 28, 430, 60);
    context.fillStyle = "#f4efe0";
    context.font = '700 18px "Segoe UI", sans-serif';
    context.fillText(game.message, CANVAS_WIDTH - 444, 66);
  }
}
