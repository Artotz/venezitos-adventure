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

export function useRetroEditor() {
  const [basePose, setBasePose] = useState<ExcavatorPose>({
    angles: { ...BASE_ANGLES },
    sprites: { ...BASE_SPRITES },
  })
  const [activeTab, setActiveTab] = useState<'poses' | 'animations'>('poses')
  const [selectedAnimationId, setSelectedAnimationId] =
    useState<AnimationPresetId>(ANIMATION_PRESETS[0]?.id ?? 'idle')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

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
        return next > totalDuration ? 0 : next
      })
    },
    isPlaying && totalDuration > 0,
  )

  const displayPose = useMemo(() => {
    if (!selectedAnimation || (!isPlaying && currentTime === 0)) {
      return basePose
    }

    return applyAnimationToPose(basePose, selectedAnimation.id, currentTime)
  }, [basePose, currentTime, isPlaying, selectedAnimation])

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
  }
}
