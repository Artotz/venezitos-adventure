import { applyToPoint } from "../retro/geometry"
import type { Matrix2D, Point } from "../retro/types"
import { getImageSourceSize, type LoadedImageSource } from "../imageSource"

import {
  DEFAULT_GREASE_ANIMATION_CONFIG,
  getGreaseAnimationPose,
  sanitizeGreaseAnimationConfig,
  type GreaseAnimationConfig,
} from "./greaseAnimation"

type DrawGreaseAnimationParams = {
  context: CanvasRenderingContext2D
  elapsed: number | null
  greaseImage?: LoadedImageSource | null
  machineRootMatrix: Matrix2D
  config?: GreaseAnimationConfig
  pointProjector?: (matrix: Matrix2D, point: Point) => Point
  showPivot?: boolean
}

export function drawGreaseAnimation({
  context,
  elapsed,
  greaseImage,
  machineRootMatrix,
  config = DEFAULT_GREASE_ANIMATION_CONFIG,
  pointProjector = applyToPoint,
  showPivot = false,
}: DrawGreaseAnimationParams) {
  if (
    elapsed === null ||
    !greaseImage
  ) {
    return
  }

  const { width: sourceWidth, height: sourceHeight } = getImageSourceSize(greaseImage)

  if (!sourceWidth || !sourceHeight) {
    return
  }

  const safeConfig = sanitizeGreaseAnimationConfig(config)
  const pose = getGreaseAnimationPose(elapsed, safeConfig)

  if (!pose) {
    return
  }

  const canvasPoint = pointProjector(machineRootMatrix, pose.point)
  const drawHeight = safeConfig.spriteHeight
  const drawWidth = (sourceWidth / sourceHeight) * drawHeight
  const pivotX = drawWidth * safeConfig.spritePivotX
  const pivotY = drawHeight * safeConfig.spritePivotY

  context.save()
  context.translate(
    canvasPoint.x + safeConfig.spriteOffsetX,
    canvasPoint.y + safeConfig.spriteOffsetY + pose.offsetY,
  )
  context.rotate(pose.rotation)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = "high"
  context.drawImage(greaseImage, -pivotX, -pivotY, drawWidth, drawHeight)

  if (showPivot) {
    context.strokeStyle = "#0b0b0b"
    context.lineWidth = 4
    context.beginPath()
    context.moveTo(-10, 0)
    context.lineTo(10, 0)
    context.moveTo(0, -10)
    context.lineTo(0, 10)
    context.stroke()

    context.strokeStyle = "#6ef2ff"
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(-10, 0)
    context.lineTo(10, 0)
    context.moveTo(0, -10)
    context.lineTo(0, 10)
    context.stroke()

    context.fillStyle = "#6ef2ff"
    context.beginPath()
    context.arc(0, 0, 3, 0, Math.PI * 2)
    context.fill()
  }

  context.restore()
}
