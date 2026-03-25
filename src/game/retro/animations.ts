import { ANIMATION_PRESETS, BASE_ANGLES, BASE_SPRITES } from './config'
import type {
  ActiveAnimation,
  AnimationKeyframe,
  AnimationPresetId,
  ExcavatorPose,
  LayerName,
  ResolvedKeyframe,
  SpriteName,
} from './types'

type AnimationProgress = Pick<ActiveAnimation, 'presetId' | 'elapsed'> | null

export function createBasePose(): ExcavatorPose {
  return {
    angles: { ...BASE_ANGLES },
    sprites: { ...BASE_SPRITES },
  }
}

export function resolveKeyframes(
  baseAngles: Record<LayerName, number>,
  baseSprites: Record<LayerName, SpriteName>,
  keyframes: AnimationKeyframe[],
): ResolvedKeyframe[] {
  let currentAngles = { ...baseAngles }
  let currentSprites = { ...baseSprites }

  return keyframes.map((keyframe) => {
    currentAngles = {
      ...currentAngles,
      ...keyframe.changes,
    }
    currentSprites = {
      ...currentSprites,
      ...(keyframe.sprites ?? {}),
    }

    return {
      at: keyframe.at,
      angles: currentAngles,
      sprites: currentSprites,
    }
  })
}

export function interpolateAngles(
  resolvedKeyframes: ResolvedKeyframe[],
  currentTime: number,
  fallback: Record<LayerName, number>,
) {
  if (resolvedKeyframes.length === 0) {
    return fallback
  }

  if (currentTime <= resolvedKeyframes[0].at) {
    return resolvedKeyframes[0].angles
  }

  const lastKeyframe = resolvedKeyframes[resolvedKeyframes.length - 1]

  if (currentTime >= lastKeyframe.at) {
    return lastKeyframe.angles
  }

  for (let index = 0; index < resolvedKeyframes.length - 1; index += 1) {
    const from = resolvedKeyframes[index]
    const to = resolvedKeyframes[index + 1]

    if (currentTime < from.at || currentTime > to.at) {
      continue
    }

    const duration = to.at - from.at || 1
    const progress = (currentTime - from.at) / duration
    const interpolatedAngles = {} as Record<LayerName, number>

    for (const layerName of Object.keys(fallback) as LayerName[]) {
      interpolatedAngles[layerName] =
        from.angles[layerName] +
        (to.angles[layerName] - from.angles[layerName]) * progress
    }

    return interpolatedAngles
  }

  return lastKeyframe.angles
}

export function resolveSpritesAtTime(
  resolvedKeyframes: ResolvedKeyframe[],
  currentTime: number,
  fallback: Record<LayerName, SpriteName>,
) {
  if (resolvedKeyframes.length === 0) {
    return fallback
  }

  let currentSprites = fallback

  for (const keyframe of resolvedKeyframes) {
    if (keyframe.at > currentTime) {
      break
    }

    currentSprites = keyframe.sprites
  }

  return currentSprites
}

export function getAnimationPreset(presetId: AnimationPresetId) {
  return ANIMATION_PRESETS.find((preset) => preset.id === presetId) ?? null
}

export function getAnimationTotalDuration(presetId: AnimationPresetId) {
  const preset = getAnimationPreset(presetId)
  return preset?.keyframes[preset.keyframes.length - 1]?.at ?? 0
}

export function applyAnimationToPose(
  pose: ExcavatorPose,
  presetId: AnimationPresetId,
  currentTime: number,
): ExcavatorPose {
  const preset = getAnimationPreset(presetId)

  if (!preset) {
    return pose
  }

  const resolvedKeyframes = resolveKeyframes(
    pose.angles,
    pose.sprites,
    preset.keyframes,
  )

  return {
    angles: interpolateAngles(resolvedKeyframes, currentTime, pose.angles),
    sprites: resolveSpritesAtTime(resolvedKeyframes, currentTime, pose.sprites),
  }
}

export function createRollingPose(distance: number) {
  const pose = createBasePose()
  const wheelSpin = (-distance * 0.92) % 360

  pose.angles['Camada 4.png'] = wheelSpin
  pose.angles['Camada 5.png'] = wheelSpin

  return pose
}

export function buildPhase1Pose({
  distance,
  loadedDirt,
  rearLoaded,
  frontAnimation,
  rearAnimation,
}: {
  distance: number
  loadedDirt: boolean
  rearLoaded: boolean
  frontAnimation: AnimationProgress
  rearAnimation: AnimationProgress
}) {
  let pose = createRollingPose(distance)

  if (loadedDirt) {
    pose = applyAnimationToPose(pose, 'idle', getAnimationTotalDuration('idle'))
  }

  if (rearLoaded) {
    pose = applyAnimationToPose(
      pose,
      'arm-extended',
      getAnimationTotalDuration('arm-extended'),
    )
  }

  if (frontAnimation) {
    pose = applyAnimationToPose(
      pose,
      frontAnimation.presetId,
      frontAnimation.elapsed,
    )
  }

  if (rearAnimation) {
    pose = applyAnimationToPose(
      pose,
      rearAnimation.presetId,
      rearAnimation.elapsed,
    )
  }

  return pose
}
