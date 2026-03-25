import { BASE_ANGLES, BASE_SPRITES, DRAW_ORDER } from './config'
import {
  computeBounds,
  computeWorldMatrices,
  createIdentityMatrix,
  createTranslationMatrix,
} from './geometry'
import type {
  ExcavatorPose,
  LayerName,
  LoadedSpriteMap,
  Matrix2D,
  SpriteName,
} from './types'

export function createLayerImageMap(
  sprites: LoadedSpriteMap,
  spriteSelection: Record<LayerName, SpriteName>,
) {
  const images = {} as Record<LayerName, HTMLImageElement>

  for (const layerName of DRAW_ORDER) {
    images[layerName] = sprites[spriteSelection[layerName]]
  }

  return images
}

export function createExcavatorScene(
  images: Record<LayerName, HTMLImageElement>,
  angles: Record<LayerName, number>,
  padding = 0,
) {
  const preliminaryMatrices = computeWorldMatrices(
    angles,
    createIdentityMatrix(),
  )
  const bounds = computeBounds(images, preliminaryMatrices)
  const worldMatrices = computeWorldMatrices(
    angles,
    createTranslationMatrix(padding - bounds.minX, padding - bounds.minY),
  )
  const finalBounds = computeBounds(images, worldMatrices)
  const contentWidth = finalBounds.maxX - finalBounds.minX
  const contentHeight = finalBounds.maxY - finalBounds.minY

  return {
    contentWidth,
    contentHeight,
    canvasWidth: Math.ceil(contentWidth + padding * 2),
    canvasHeight: Math.ceil(contentHeight + padding * 2),
    worldMatrices,
  }
}

export function createSceneFromPose(
  sprites: LoadedSpriteMap,
  pose: ExcavatorPose,
  padding = 0,
) {
  return createExcavatorScene(
    createLayerImageMap(sprites, pose.sprites),
    pose.angles,
    padding,
  )
}

export function measureBaseExcavator(sprites: LoadedSpriteMap) {
  return createExcavatorScene(
    createLayerImageMap(sprites, BASE_SPRITES),
    BASE_ANGLES,
  )
}

export function drawExcavator(
  context: CanvasRenderingContext2D,
  images: Record<LayerName, HTMLImageElement>,
  worldMatrices: Map<LayerName, Matrix2D>,
) {
  context.imageSmoothingEnabled = false

  for (const layerName of DRAW_ORDER) {
    const matrix = worldMatrices.get(layerName)
    const image = images[layerName]

    if (!matrix || !image) {
      continue
    }

    context.setTransform(
      matrix.a,
      matrix.b,
      matrix.c,
      matrix.d,
      matrix.e,
      matrix.f,
    )
    context.drawImage(image, 0, 0)
  }

  context.setTransform(1, 0, 0, 1, 0, 0)
}
