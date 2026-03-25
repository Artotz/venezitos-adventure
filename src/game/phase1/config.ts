import type { MapEvent, MapEventType } from './types'

export const CANVAS_WIDTH = 1560
export const CANVAS_HEIGHT = 620
export const GROUND_Y = 485
export const PLAYER_SCREEN_X = 980
export const PLAYER_HIT_LINE_X = PLAYER_SCREEN_X - 200
export const BASE_SPEED = 220
export const LOW_TRACTION_SPEED = 72
export const EVENT_HITBOX_HALF_WIDTH = 70
export const EVENT_BUTTON = 'E'
export const INITIAL_MESSAGE =
  'A retro anda para a esquerda. Responda aos eventos quando eles chegarem.'

export const EVENT_CONFIG: Record<
  MapEventType,
  { key: string; title: string; description: string; hint: string }
> = {
  pickup: {
    key: EVENT_BUTTON,
    title: 'Evento da carregadeira',
    description: 'Punhado de terra ou caminhao',
    hint: 'O mesmo evento alterna entre carregar e descarregar a frente.',
  },
  dig: {
    key: EVENT_BUTTON,
    title: 'Evento da retroescavadeira',
    description: 'Escavar ou descarregar na vala',
    hint: 'O mesmo evento alterna entre carregar e descarregar a traseira.',
  },
  traction: {
    key: EVENT_BUTTON,
    title: 'Ligar 4x4',
    description: 'Lamacal no caminho',
    hint: 'A maquina desacelera ate voce apertar o botao.',
  },
}

export const INITIAL_EVENTS: MapEvent[] = [
  { id: 0, type: 'pickup', visualX: 760, hitboxX: 700, status: 'upcoming' },
  { id: 1, type: 'traction', visualX: 1730, hitboxX: 1650, status: 'upcoming' },
  { id: 2, type: 'dig', visualX: 2800, hitboxX: 2720, status: 'upcoming' },
  { id: 3, type: 'pickup', visualX: 3880, hitboxX: 3820, status: 'upcoming' },
  { id: 4, type: 'dig', visualX: 5060, hitboxX: 4980, status: 'upcoming' },
  { id: 5, type: 'traction', visualX: 6230, hitboxX: 6150, status: 'upcoming' },
  { id: 6, type: 'pickup', visualX: 7410, hitboxX: 7350, status: 'upcoming' },
  { id: 7, type: 'dig', visualX: 8600, hitboxX: 8520, status: 'upcoming' },
  { id: 8, type: 'pickup', visualX: 9830, hitboxX: 9750, status: 'upcoming' },
]
