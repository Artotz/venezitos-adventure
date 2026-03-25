import { DRAW_ORDER, LAYER_CONFIG } from './config'
import type { LayerName, Matrix2D, Point } from './types'

export function createIdentityMatrix(): Matrix2D {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
}

export function createTranslationMatrix(x: number, y: number): Matrix2D {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y }
}

export function createScaleMatrix(scaleX: number, scaleY: number): Matrix2D {
  return { a: scaleX, b: 0, c: 0, d: scaleY, e: 0, f: 0 }
}

export function createRotationMatrix(angleInRadians: number): Matrix2D {
  const cosine = Math.cos(angleInRadians)
  const sine = Math.sin(angleInRadians)

  return {
    a: cosine,
    b: sine,
    c: -sine,
    d: cosine,
    e: 0,
    f: 0,
  }
}

export function multiplyMatrices(left: Matrix2D, right: Matrix2D): Matrix2D {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    e: left.a * right.e + left.c * right.f + left.e,
    f: left.b * right.e + left.d * right.f + left.f,
  }
}

export function applyToPoint(matrix: Matrix2D, point: Point): Point {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  }
}

export function computeWorldMatrices(
  angles: Record<LayerName, number>,
  rootMatrix: Matrix2D,
) {
  const worldMatrices = new Map<LayerName, Matrix2D>()

  const resolveLayerMatrix = (layerName: LayerName): Matrix2D => {
    const cached = worldMatrices.get(layerName)

    if (cached) {
      return cached
    }

    const layerConfig = LAYER_CONFIG[layerName]

    if (layerConfig.parent === null) {
      worldMatrices.set(layerName, rootMatrix)
      return rootMatrix
    }

    const parentMatrix = resolveLayerMatrix(layerConfig.parent)
    const parentAnchor = layerConfig.parentPoint ?? { x: 0, y: 0 }
    const childAnchor = layerConfig.childPoint ?? { x: 0, y: 0 }
    const angleInRadians = (angles[layerName] * Math.PI) / 180

    const localMatrix = multiplyMatrices(
      multiplyMatrices(
        createTranslationMatrix(parentAnchor.x, parentAnchor.y),
        createRotationMatrix(angleInRadians),
      ),
      createTranslationMatrix(-childAnchor.x, -childAnchor.y),
    )

    const worldMatrix = multiplyMatrices(parentMatrix, localMatrix)
    worldMatrices.set(layerName, worldMatrix)
    return worldMatrix
  }

  for (const layerName of DRAW_ORDER) {
    resolveLayerMatrix(layerName)
  }

  return worldMatrices
}

export function computeBounds(
  images: Record<LayerName, HTMLImageElement>,
  worldMatrices: Map<LayerName, Matrix2D>,
) {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const layerName of DRAW_ORDER) {
    const matrix = worldMatrices.get(layerName)
    const image = images[layerName]

    if (!matrix || !image) {
      continue
    }

    const corners = [
      applyToPoint(matrix, { x: 0, y: 0 }),
      applyToPoint(matrix, { x: image.width, y: 0 }),
      applyToPoint(matrix, { x: 0, y: image.height }),
      applyToPoint(matrix, { x: image.width, y: image.height }),
    ]

    for (const corner of corners) {
      minX = Math.min(minX, corner.x)
      minY = Math.min(minY, corner.y)
      maxX = Math.max(maxX, corner.x)
      maxY = Math.max(maxY, corner.y)
    }
  }

  return {
    minX: Number.isFinite(minX) ? minX : 0,
    minY: Number.isFinite(minY) ? minY : 0,
    maxX: Number.isFinite(maxX) ? maxX : 0,
    maxY: Number.isFinite(maxY) ? maxY : 0,
  }
}
