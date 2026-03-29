import { useMemo, useState } from 'react'

import {
  ANIMATION_PRESETS,
  BASE_ANGLES,
  BASE_SPRITES,
} from '../retro/config'
import {
  applyAnimationToPose,
  getAnimationTotalDuration,
} from '../retro/animations'
import type {
  AnimationPresetId,
  ExcavatorPose,
  LayerName,
} from '../retro/types'
import { useGameLoop } from '../useGameLoop'
import type { EditorPoint, EditorTab } from './types'

export function useRetroEditor() {
  const [basePose, setBasePose] = useState<ExcavatorPose>({
    angles: { ...BASE_ANGLES },
    sprites: { ...BASE_SPRITES },
  })
  const [activeTab, setActiveTab] = useState<EditorTab>('poses')
  const [selectedAnimationId, setSelectedAnimationId] =
    useState<AnimationPresetId>(ANIMATION_PRESETS[0]?.id ?? 'idle')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [points, setPoints] = useState<EditorPoint[]>([])

  const selectedAnimation = useMemo(
    () =>
      ANIMATION_PRESETS.find((preset) => preset.id === selectedAnimationId) ??
      null,
    [selectedAnimationId],
  )

  const totalDuration = selectedAnimation
    ? getAnimationTotalDuration(selectedAnimation.id)
    : 0

  useGameLoop(
    (dt) => {
      setCurrentTime((previous) => {
        const next = previous + dt * 1000

        if (next >= totalDuration) {
          setIsPlaying(false)
          return totalDuration
        }

        return next
      })
    },
    isPlaying && totalDuration > 0,
  )

  const displayPose = useMemo(() => {
    if (!selectedAnimation) {
      return basePose
    }

    return applyAnimationToPose(basePose, selectedAnimation.id, currentTime)
  }, [basePose, currentTime, selectedAnimation])

  const handleAngleChange = (layerName: LayerName, value: string) => {
    const nextAngle = Number(value)

    setIsPlaying(false)
    setCurrentTime(0)
    setBasePose({
      angles: {
        ...displayPose.angles,
        [layerName]: nextAngle,
      },
      sprites: { ...displayPose.sprites },
    })
  }

  const handleAnimationChange = (value: string) => {
    setBasePose({
      angles: { ...displayPose.angles },
      sprites: { ...displayPose.sprites },
    })
    setSelectedAnimationId(value as AnimationPresetId)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const handleTimelineChange = (value: string) => {
    setCurrentTime(Number(value))
    setIsPlaying(false)
  }

  const togglePlayback = () => {
    if (!selectedAnimation) {
      return
    }

    setIsPlaying((current) => !current)
  }

  const resetPose = () => {
    setBasePose({
      angles: { ...BASE_ANGLES },
      sprites: { ...BASE_SPRITES },
    })
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const addPoint = (point: { x: number; y: number }) => {
    setPoints((current) => [
      ...current,
      {
        id: `point-${current.length + 1}-${Date.now()}`,
        x: Math.round(point.x),
        y: Math.round(point.y),
      },
    ])
  }

  const removePoint = (id: string) => {
    setPoints((current) => current.filter((point) => point.id !== id))
  }

  const clearPoints = () => {
    setPoints([])
  }

  return {
    activeTab,
    setActiveTab,
    selectedAnimation,
    selectedAnimationId,
    isPlaying,
    currentTime,
    totalDuration,
    basePose,
    displayPose,
    handleAngleChange,
    handleAnimationChange,
    handleTimelineChange,
    togglePlayback,
    resetPose,
    points,
    addPoint,
    removePoint,
    clearPoints,
  }
}
