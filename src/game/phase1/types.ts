export type MapEventType = 'pickup' | 'dig' | 'traction'
export type EventStatus = 'upcoming' | 'active' | 'resolved' | 'missed'

export type MapEvent = {
  id: number
  type: MapEventType
  visualX: number
  hitboxX: number
  status: EventStatus
}

export type EventInfo = {
  title: string
  description: string
  hint: string
}
