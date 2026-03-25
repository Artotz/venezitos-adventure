import { EVENT_CONFIG, PLAYER_SCREEN_X } from './config'
import type { EventInfo, EventStatus, MapEvent } from './types'

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

export function describeMapEvent(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
): EventInfo {
  if (event.type === 'pickup') {
    return loadedDirt
      ? {
          title: 'Descarregar carregadeira',
          description: 'Caminhao esperando a frente',
          hint: 'Para a maquina e descarrega a areia da frente.',
        }
      : {
          title: 'Carregar carregadeira',
          description: 'Punhado de terra no caminho',
          hint: 'A carregadeira enche a frente sem desfazer a traseira.',
        }
  }

  if (event.type === 'dig') {
    return rearLoaded
      ? {
          title: 'Descarregar retroescavadeira',
          description: 'Vala para descarregar atras',
          hint: 'A retro abre e descarrega atras sem mexer a frente.',
        }
      : {
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
