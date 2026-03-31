import pointsSource from "../../../points.txt?raw";

import type { Point } from "../retro/types";

const GREASE_POINT_PATTERN = /x:\s*(-?\d+)\s*,\s*y:\s*(-?\d+)/g;

export const GREASE_POINTS: Point[] = Array.from(
  pointsSource.matchAll(GREASE_POINT_PATTERN),
  ([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }),
);

export const GREASE_FRAME_DURATION_MS = 150;
export const GREASE_FRAMES_PER_POINT = 4;
export const GREASE_WOBBLE_ROTATIONS = [-0.12, 0.08, -0.05, 0.04];
export const GREASE_WOBBLE_Y_OFFSETS = [0, -4, 2, -2];

// Ajuste aqui o tamanho base do Venezito durante a animacao de graxa.
export const GREASE_SPRITE_HEIGHT = 120;
// Ajuste aqui o offset base em relacao ao ponto vindo do points.txt.
export const GREASE_SPRITE_OFFSET_X = 50;
export const GREASE_SPRITE_OFFSET_Y = 20;
// Ajuste aqui o pivot de rotacao em coordenadas normalizadas do sprite.
// (0, 0) = canto superior esquerdo, (0.5, 0.5) = centro, (1, 1) = canto inferior direito.
export const GREASE_SPRITE_PIVOT_X = 0.65;
export const GREASE_SPRITE_PIVOT_Y = 0.45;

export function getGreaseAnimationTotalDuration() {
  return (
    GREASE_POINTS.length * GREASE_FRAMES_PER_POINT * GREASE_FRAME_DURATION_MS
  );
}

export function getGreaseAnimationPose(elapsed: number) {
  if (GREASE_POINTS.length === 0) {
    return null;
  }

  const maxFrameIndex = GREASE_POINTS.length * GREASE_FRAMES_PER_POINT - 1;
  const frameIndex = Math.min(
    maxFrameIndex,
    Math.floor(elapsed / GREASE_FRAME_DURATION_MS),
  );
  const pointIndex = Math.floor(frameIndex / GREASE_FRAMES_PER_POINT);
  const wobbleIndex = frameIndex % GREASE_FRAMES_PER_POINT;

  return {
    pointIndex,
    point: GREASE_POINTS[pointIndex],
    rotation: GREASE_WOBBLE_ROTATIONS[wobbleIndex] ?? 0,
    offsetY: GREASE_WOBBLE_Y_OFFSETS[wobbleIndex] ?? 0,
  };
}
