import { EVENT_BUTTON } from './config'
import type { EventDefinition, MapEventType } from './types'

// Edite aqui os eventos concretos da fase 1: textos, pontos e animacoes.
export const EVENT_DEFINITIONS: Record<MapEventType, EventDefinition> = {
  'pickup-load': {
    type: 'pickup-load',
    group: 'pickup',
    visualOffset: 360,
    key: EVENT_BUTTON,
    title: 'Carregar carregadeira',
    description: 'Punhado de terra no caminho',
    hint: 'A carregadeira enche a frente sem mexer na traseira.',
    successMessage: 'Terra apanhada. A cacamba esta carregada.',
    reward: 180,
    animation: {
      target: 'front',
      presetId: 'idle',
      label: 'Ciclo de cacamba 1',
      lockMovement: false,
      loadStateOnComplete: {
        loadedDirt: true,
      },
    },
  },
  'pickup-unload': {
    type: 'pickup-unload',
    group: 'pickup',
    visualOffset: 360,
    key: EVENT_BUTTON,
    title: 'Descarregar carregadeira',
    description: 'Caminhao esperando a frente',
    hint: 'Pare a maquina e descarregue a terra da frente.',
    successMessage: 'Terra descarregada no caminhao.',
    reward: 180,
    animation: {
      target: 'front',
      presetId: 'idle2',
      label: 'Ciclo de cacamba 2',
      lockMovement: true,
      loadStateOnComplete: {
        loadedDirt: false,
      },
    },
  },
  'dig-load': {
    type: 'dig-load',
    group: 'dig',
    visualOffset: -220,
    key: EVENT_BUTTON,
    title: 'Carregar retroescavadeira',
    description: 'Ponto de escavacao atras',
    hint: 'A retroescavadeira carrega a traseira e persiste no final.',
    successMessage: 'Retroescavadeira carregada atras.',
    reward: 180,
    animation: {
      target: 'rear',
      presetId: 'arm-extended',
      label: 'Braco estendido',
      lockMovement: true,
      loadStateOnComplete: {
        rearLoaded: true,
      },
    },
  },
  'dig-unload': {
    type: 'dig-unload',
    group: 'dig',
    visualOffset: -220,
    key: EVENT_BUTTON,
    title: 'Descarregar retroescavadeira',
    description: 'Vala para descarregar atras',
    hint: 'A retro abre e descarrega atras sem mexer na frente.',
    successMessage: 'Retroescavadeira descarregada na vala.',
    reward: 180,
    animation: {
      target: 'rear',
      presetId: 'arm-unload',
      label: 'Descarregando traseira',
      lockMovement: true,
      loadStateOnComplete: {
        rearLoaded: false,
      },
    },
  },
  traction: {
    type: 'traction',
    group: 'traction',
    visualOffset: 80,
    key: EVENT_BUTTON,
    title: 'Ligar 4x4',
    description: 'Lamacal no caminho',
    hint: 'A maquina desacelera ate voce apertar o botao.',
    successMessage: '4x4 ligado. A tracao voltou ao normal.',
    reward: 180,
  },
}

export function getEventDefinition(type: MapEventType) {
  return EVENT_DEFINITIONS[type]
}
