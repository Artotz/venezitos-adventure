import type { AnimationPresetId } from '../retro/types'
import type { VenezitoMood } from './venezito'

export type ManualEventType =
  | 'pickup-load'
  | 'pickup-unload'
  | 'dig-load'
  | 'dig-unload'
  | 'grease'

export type EnvironmentalEventType = 'traction'
export type ModalEventType = 'question'
export type MapEventType =
  | ManualEventType
  | EnvironmentalEventType
  | ModalEventType

export type ManualEventGroup = 'pickup' | 'dig' | 'grease'
export type EnvironmentalEventGroup = 'traction'
export type ModalEventGroup = 'question'
export type MapEventGroup =
  | ManualEventGroup
  | EnvironmentalEventGroup
  | ModalEventGroup
export type EventStatus = 'upcoming' | 'active' | 'resolved' | 'missed'

export type MapEvent = {
  id: number
  group: MapEventGroup
  hitboxX: number
  status: EventStatus
  type: MapEventType | null
}

export type RetroEventAnimationConfig = {
  kind: 'retro-preset'
  target: 'front' | 'rear'
  presetId: AnimationPresetId
  label: string
  lockMovement: boolean
  loadStateOnComplete?: {
    loadedDirt?: boolean
    rearLoaded?: boolean
  }
}

export type GreaseEventAnimationConfig = {
  kind: 'grease'
  label: string
  lockMovement: boolean
  durationMs: number
}

export type EventAnimationConfig =
  | RetroEventAnimationConfig
  | GreaseEventAnimationConfig

export type GreaseAnimationState = {
  hasStarted: boolean
  elapsed: number
  durationMs: number
  lastSoundPointIndex: number
}

type BaseEventDefinition<
  TType extends MapEventType,
  TGroup extends MapEventGroup,
  TInteraction extends string,
> = {
  type: TType
  group: TGroup
  interaction: TInteraction
  visualOffset: number
  hitboxHalfWidth: number
  title: string
  description: string
  hint: string
  successMessage: string
}

export type ManualEventDefinition = BaseEventDefinition<
  ManualEventType,
  ManualEventGroup,
  'manual'
> & {
  acceptedCodes: KeyboardEvent['code'][]
  keyLabel: string
  reward: number
  animation?: EventAnimationConfig
}

export type TractionEventDefinition = BaseEventDefinition<
  'traction',
  'traction',
  'traction-zone'
> & {
  toggleCodes: KeyboardEvent['code'][]
  toggleKeyLabel: string
  activeSpeed: number
  drainPerFrame: number
  rewardPerFrame: number
  failureMessage: string
}

export type QuestionEventDefinition = BaseEventDefinition<
  'question',
  'question',
  'question-modal'
> & {
  modalTitle: string
  selectionHint: string
  approachSlowdownDistance: number
  approachTargetSpeed: number
}

export type EventDefinition =
  | ManualEventDefinition
  | TractionEventDefinition
  | QuestionEventDefinition

export type QuestionChoiceDirection = 'up' | 'left' | 'right' | 'down'

export type DirectionalChoiceMap<T> = Record<QuestionChoiceDirection, T>

export type Phase1QuestionChoice = {
  label: string
}

export type Phase1Question = {
  id: string
  prompt: string
  choices: DirectionalChoiceMap<Phase1QuestionChoice>
  correctDirection: QuestionChoiceDirection
  successMessage: string
  failureMessage: string
  reward: number
  penalty: number
}

export type QuestionModalState = {
  eventId: number
  title: string
  selectionHint: string
  question: Phase1Question
}

export type Phase1SpeechModalState = {
  title: string
  speech: string
  body: string
  continueHint: string
  mood: VenezitoMood
}
