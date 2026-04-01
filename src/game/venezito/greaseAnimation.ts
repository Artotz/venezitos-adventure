import pointsSource from "../../../points.txt?raw"

import type { Point } from "../retro/types"

const GREASE_POINT_PATTERN = /x:\s*(-?\d+)\s*,\s*y:\s*(-?\d+)/g

export type GreaseAnimationConfig = {
  frameDurationMs: number
  framesPerPoint: number
  wobbleRotations: number[]
  wobbleYOffsets: number[]
  spriteHeight: number
  spriteOffsetX: number
  spriteOffsetY: number
  spritePivotX: number
  spritePivotY: number
}

export const GREASE_POINTS: Point[] = Array.from(
  pointsSource.matchAll(GREASE_POINT_PATTERN),
  ([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }),
)

export const DEFAULT_GREASE_ANIMATION_CONFIG: GreaseAnimationConfig = {
  frameDurationMs: 150,
  framesPerPoint: 4,
  wobbleRotations: [-0.12, 0.08, -0.05, 0.04],
  wobbleYOffsets: [0, -4, 2, -2],
  spriteHeight: 120,
  spriteOffsetX: 50,
  spriteOffsetY: 20,
  spritePivotX: 0.65,
  spritePivotY: 0.45,
}

export function sanitizeGreaseAnimationConfig(
  config: GreaseAnimationConfig,
): GreaseAnimationConfig {
  const framesPerPoint = Math.max(1, Math.round(config.framesPerPoint))

  return {
    frameDurationMs: Math.max(1, Math.round(config.frameDurationMs)),
    framesPerPoint,
    wobbleRotations: normalizeSequence(config.wobbleRotations, framesPerPoint),
    wobbleYOffsets: normalizeSequence(config.wobbleYOffsets, framesPerPoint),
    spriteHeight: Math.max(1, config.spriteHeight),
    spriteOffsetX: config.spriteOffsetX,
    spriteOffsetY: config.spriteOffsetY,
    spritePivotX: clamp(config.spritePivotX, 0, 1),
    spritePivotY: clamp(config.spritePivotY, 0, 1),
  }
}

export function getGreaseAnimationTotalDuration(
  config: GreaseAnimationConfig = DEFAULT_GREASE_ANIMATION_CONFIG,
) {
  const safeConfig = sanitizeGreaseAnimationConfig(config)

  return (
    GREASE_POINTS.length *
    safeConfig.framesPerPoint *
    safeConfig.frameDurationMs
  )
}

export function getGreaseAnimationPose(
  elapsed: number,
  config: GreaseAnimationConfig = DEFAULT_GREASE_ANIMATION_CONFIG,
) {
  if (GREASE_POINTS.length === 0) {
    return null
  }

  const safeConfig = sanitizeGreaseAnimationConfig(config)
  const maxFrameIndex = GREASE_POINTS.length * safeConfig.framesPerPoint - 1
  const frameIndex = Math.min(
    maxFrameIndex,
    Math.floor(elapsed / safeConfig.frameDurationMs),
  )
  const pointIndex = Math.floor(frameIndex / safeConfig.framesPerPoint)
  const wobbleIndex = frameIndex % safeConfig.framesPerPoint

  return {
    pointIndex,
    point: GREASE_POINTS[pointIndex],
    rotation: safeConfig.wobbleRotations[wobbleIndex] ?? 0,
    offsetY: safeConfig.wobbleYOffsets[wobbleIndex] ?? 0,
  }
}

function normalizeSequence(values: number[], length: number) {
  if (length <= 0) {
    return []
  }

  if (values.length === 0) {
    return Array.from({ length }, () => 0)
  }

  return Array.from({ length }, (_, index) => values[index] ?? values.at(-1) ?? 0)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
