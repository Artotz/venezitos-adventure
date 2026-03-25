export type MapEventType = 'pickup' | 'dig' | 'traction'
export type EventStatus = 'upcoming' | 'active' | 'resolved' | 'missed'
export type MapEventVariant =
  | 'pickup-load'
  | 'pickup-unload'
  | 'dig-load'
  | 'dig-unload'
  | 'traction'

export type MapEvent = {
  id: number
  type: MapEventType
  visualX: number
  hitboxX: number
  status: EventStatus
  variant: MapEventVariant | null
}

export type EventInfo = {
  title: string
  description: string
  hint: string
}
