import type { AnimationPresetId } from '../retro/types'

export type MapEventType =
  | 'pickup-load'
  | 'pickup-unload'
  | 'dig-load'
  | 'dig-unload'
  | 'traction'

export type MapEventGroup = 'pickup' | 'dig' | 'traction'
export type EventStatus = 'upcoming' | 'active' | 'resolved' | 'missed'

export type MapEvent = {
  id: number
  group: MapEventGroup
  hitboxX: number
  status: EventStatus
  type: MapEventType | null
}

export type EventAnimationConfig = {
  target: 'front' | 'rear'
  presetId: AnimationPresetId
  label: string
  lockMovement: boolean
  loadStateOnComplete?: {
    loadedDirt?: boolean
    rearLoaded?: boolean
  }
}

export type EventDefinition = {
  type: MapEventType
  group: MapEventGroup
  visualOffset: number
  key: string
  title: string
  description: string
  hint: string
  successMessage: string
  reward: number
  animation?: EventAnimationConfig
}
