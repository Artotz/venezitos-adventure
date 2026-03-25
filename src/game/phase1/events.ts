import { CANVAS_WIDTH, EVENT_CONFIG, PLAYER_SCREEN_X } from './config'
import type {
  EventInfo,
  EventStatus,
  MapEvent,
  MapEventVariant,
} from './types'

export function getEventVisualScreenX(event: MapEvent, distance: number) {
  return PLAYER_SCREEN_X - (event.visualX - distance)
}

export function getEventHitboxScreenX(event: MapEvent, distance: number) {
  return PLAYER_SCREEN_X - (event.hitboxX - distance)
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

export function resolveMapEventVariant(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
): MapEventVariant {
  if (event.variant) {
    return event.variant
  }

  if (event.type === 'pickup') {
    return loadedDirt ? 'pickup-unload' : 'pickup-load'
  }

  if (event.type === 'dig') {
    return rearLoaded ? 'dig-unload' : 'dig-load'
  }

  return 'traction'
}

export function isEventVisibleOnMap(event: MapEvent, distance: number) {
  const visualX = getEventVisualScreenX(event, distance)
  const hitboxX = getEventHitboxScreenX(event, distance)

  return !(
    visualX < -220 ||
    visualX > CANVAS_WIDTH + 220 ||
    hitboxX < -220 ||
    hitboxX > CANVAS_WIDTH + 220
  )
}

export function assignSpawnedEventVariants(
  events: MapEvent[],
  distance: number,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  let hasChanges = false

  const nextEvents = events.map((event) => {
    if (event.variant || !isEventVisibleOnMap(event, distance)) {
      return event
    }

    hasChanges = true

    return {
      ...event,
      variant: resolveMapEventVariant(event, loadedDirt, rearLoaded),
    }
  })

  return hasChanges ? nextEvents : events
}

export function describeMapEvent(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
): EventInfo {
  const variant = resolveMapEventVariant(event, loadedDirt, rearLoaded)

  if (variant === 'pickup-unload') {
    return {
      title: 'Descarregar carregadeira',
      description: 'Caminhao esperando a frente',
      hint: 'Pare a maquina e descarregue a terra da frente.',
    }
  }

  if (variant === 'pickup-load') {
    return {
      title: 'Carregar carregadeira',
      description: 'Punhado de terra no caminho',
      hint: 'A carregadeira enche a frente sem mexer na traseira.',
    }
  }

  if (variant === 'dig-unload') {
    return {
      title: 'Descarregar retroescavadeira',
      description: 'Vala para descarregar atras',
      hint: 'A retro abre e descarrega atras sem mexer na frente.',
    }
  }

  if (variant === 'dig-load') {
    return {
      title: 'Carregar retroescavadeira',
      description: 'Ponto de escavacao atras',
      hint: 'A retroescavadeira carrega a traseira e persiste no final.',
    }
  }

  return {
    title: EVENT_CONFIG[event.type].title,
    description: EVENT_CONFIG[event.type].description,
    hint: EVENT_CONFIG[event.type].hint,
  }
}
