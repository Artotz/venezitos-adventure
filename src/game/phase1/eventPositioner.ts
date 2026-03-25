import {
  CANVAS_WIDTH,
  EVENT_HITBOX_HALF_WIDTH,
  EVENT_DESPAWN_MARGIN,
  EVENT_SPAWN_MARGIN,
  PLAYER_HIT_LINE_X,
  PLAYER_SCREEN_X,
} from './config'
import { getEventDefinition } from './eventCatalog'
import type { EventStatus, MapEvent, MapEventGroup, MapEventType } from './types'

type EventSpawnSlot = {
  group: MapEventGroup
  hitboxX: number
}

// Edite aqui apenas a ordem e o posicionamento dos spawns no mapa.
const EVENT_SPAWN_PLAN: EventSpawnSlot[] = [
  { group: 'pickup', hitboxX: 700 },
  { group: 'traction', hitboxX: 1650 },
  { group: 'dig', hitboxX: 2720 },
  { group: 'question', hitboxX: 3820 },
  { group: 'pickup', hitboxX: 4980 },
  { group: 'traction', hitboxX: 6150 },
  { group: 'dig', hitboxX: 7350 },
  { group: 'pickup', hitboxX: 8520 },
  { group: 'dig', hitboxX: 9750 },
]

export const INITIAL_EVENTS: MapEvent[] = EVENT_SPAWN_PLAN.map((slot, id) => ({
  id,
  group: slot.group,
  hitboxX: slot.hitboxX,
  status: 'upcoming',
  type: null,
}))

export function getEventHitboxScreenX(event: MapEvent, distance: number) {
  return PLAYER_SCREEN_X - (event.hitboxX - distance)
}

export function isEventScreenXVisible(screenX: number) {
  return (
    screenX >= -EVENT_SPAWN_MARGIN &&
    screenX <= CANVAS_WIDTH + EVENT_DESPAWN_MARGIN
  )
}

export function updateEventStatus(
  events: MapEvent[],
  eventId: number,
  status: EventStatus,
) {
  return events.map((event) =>
    event.id === eventId ? { ...event, status } : event,
  )
}

export function cloneEvents(events: MapEvent[]) {
  return events.map((event) => ({ ...event }))
}

export function resolveSpawnedEventType(
  group: MapEventGroup,
  loadedDirt: boolean,
  rearLoaded: boolean,
): MapEventType {
  if (group === 'pickup') {
    return loadedDirt ? 'pickup-unload' : 'pickup-load'
  }

  if (group === 'dig') {
    return rearLoaded ? 'dig-unload' : 'dig-load'
  }

  if (group === 'traction') {
    return 'traction'
  }

  return 'question'
}

export function resolveMapEventType(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  return event.type ?? resolveSpawnedEventType(event.group, loadedDirt, rearLoaded)
}

export function getEventVisualX(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  const eventType = resolveMapEventType(event, loadedDirt, rearLoaded)
  const { visualOffset } = getEventDefinition(eventType)

  return event.hitboxX + visualOffset
}

export function getEventVisualScreenX(
  event: MapEvent,
  distance: number,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  return PLAYER_SCREEN_X - (getEventVisualX(event, loadedDirt, rearLoaded) - distance)
}

export function assignSpawnedEventTypes(
  events: MapEvent[],
  distance: number,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  let hasChanges = false

  const nextEvents = events.map((event) => {
    const eventType = resolveMapEventType(event, loadedDirt, rearLoaded)
    const visualX = getEventVisualScreenX(
      { ...event, type: eventType },
      distance,
      loadedDirt,
      rearLoaded,
    )
    const hitboxX = getEventHitboxScreenX(event, distance)

    if (
      event.type ||
      (!isEventScreenXVisible(visualX) && !isEventScreenXVisible(hitboxX))
    ) {
      return event
    }

    hasChanges = true

    return {
      ...event,
      type: eventType,
    }
  })

  return hasChanges ? nextEvents : events
}

export function createInitialPhase1Events() {
  return assignSpawnedEventTypes(cloneEvents(INITIAL_EVENTS), 0, false, false)
}

export function isWithinEventHitZone(screenX: number, extraMargin = 0) {
  return Math.abs(screenX - PLAYER_HIT_LINE_X) <= EVENT_HITBOX_HALF_WIDTH + extraMargin
}

export function isWithinTractionScoreLeniencyZone(
  events: MapEvent[],
  distance: number,
  extraMargin: number,
) {
  return events.some((event) => {
    if (event.group !== 'traction') {
      return false
    }

    return isWithinEventHitZone(getEventHitboxScreenX(event, distance), extraMargin)
  })
}

export function describeMapEvent(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  return getEventDefinition(resolveMapEventType(event, loadedDirt, rearLoaded))
}
