import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  EVENT_HITBOX_HALF_WIDTH,
  GROUND_Y,
} from './config'
import { getEventHitboxScreenX, getEventVisualScreenX } from './events'
import type { MapEvent } from './types'

type Phase1SceneParams = {
  context: CanvasRenderingContext2D
  distance: number
  events: MapEvent[]
  activeEventId: number | null
  loadedDirt: boolean
  rearLoaded: boolean
}

export function drawPhase1Backdrop(context: CanvasRenderingContext2D) {
  const skyGradient = context.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  skyGradient.addColorStop(0, '#3d78b2')
  skyGradient.addColorStop(0.5, '#87b6df')
  skyGradient.addColorStop(1, '#d9c58d')
  context.fillStyle = skyGradient
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

export function drawPhase1Environment({
  context,
  distance,
  events,
  activeEventId,
  loadedDirt,
  rearLoaded,
}: Phase1SceneParams) {
  drawBackground(
    context,
    distance,
    events,
    activeEventId,
    loadedDirt,
    rearLoaded,
  )
  drawGround(
    context,
    distance,
    events,
    activeEventId,
    loadedDirt,
    rearLoaded,
  )
  drawForeground(context, distance)
}

export function drawCenterGuide(
  context: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  bottomY: number,
  hasActiveEvent: boolean,
) {
  context.save()
  context.strokeStyle = hasActiveEvent
    ? 'rgba(255, 230, 140, 0.95)'
    : 'rgba(255,255,255,0.42)'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(centerX, topY)
  context.lineTo(centerX, bottomY)
  context.stroke()
  context.restore()
}

function drawBackground(
  context: CanvasRenderingContext2D,
  distance: number,
  events: MapEvent[],
  activeEventId: number | null,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  const farOffset = (distance * 0.08) % 320
  const midOffset = (distance * 0.18) % 280

  context.fillStyle = 'rgba(255, 244, 214, 0.25)'
  context.beginPath()
  context.arc(910, 110, 58, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#6d8b57'
  for (let x = farOffset - 320; x < CANVAS_WIDTH + 320; x += 320) {
    context.beginPath()
    context.moveTo(x, 480)
    context.lineTo(x + 140, 350)
    context.lineTo(x + 300, 480)
    context.closePath()
    context.fill()
  }

  context.fillStyle = '#8f6c46'
  for (let x = midOffset - 280; x < CANVAS_WIDTH + 280; x += 280) {
    context.fillRect(x + 40, 370, 30, 120)
    context.beginPath()
    context.arc(x + 55, 355, 44, 0, Math.PI * 2)
    context.fill()
  }

  for (const event of events) {
    const visualX = getEventVisualScreenX(event, distance)
    const hitboxX = getEventHitboxScreenX(event, distance)

    if (
      visualX < -220 ||
      visualX > CANVAS_WIDTH + 220 ||
      hitboxX < -220 ||
      hitboxX > CANVAS_WIDTH + 220
    ) {
      continue
    }

    if (event.type === 'pickup' && loadedDirt) {
      drawTruck(context, visualX, hitboxX, event.id === activeEventId)
    }

    if (event.type === 'dig' && !rearLoaded) {
      drawSignage(context, visualX, hitboxX, event.id === activeEventId)
    }
  }
}

function drawGround(
  context: CanvasRenderingContext2D,
  distance: number,
  events: MapEvent[],
  activeEventId: number | null,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  context.fillStyle = '#a77943'
  context.fillRect(0, GROUND_Y - 8, CANVAS_WIDTH, 90)

  context.fillStyle = '#6e4b2a'
  context.fillRect(0, GROUND_Y + 46, CANVAS_WIDTH, 90)

  context.fillStyle = '#d8b16c'
  const laneOffset = distance % 120
  for (let x = laneOffset - 120; x < CANVAS_WIDTH + 120; x += 120) {
    context.fillRect(x, GROUND_Y + 12, 70, 8)
  }

  context.fillStyle = 'rgba(40, 23, 10, 0.28)'
  const dirtOffset = (distance * 1.4) % 90
  for (let x = dirtOffset - 90; x < CANVAS_WIDTH + 90; x += 90) {
    context.beginPath()
    context.ellipse(x + 20, GROUND_Y + 58, 24, 8, 0, 0, Math.PI * 2)
    context.fill()
  }

  for (const event of events) {
    const visualX = getEventVisualScreenX(event, distance)
    const hitboxX = getEventHitboxScreenX(event, distance)

    if (
      visualX < -220 ||
      visualX > CANVAS_WIDTH + 220 ||
      hitboxX < -220 ||
      hitboxX > CANVAS_WIDTH + 220
    ) {
      continue
    }

    const isActive = event.id === activeEventId

    if (event.type === 'pickup' && !loadedDirt) {
      drawPickupDirt(context, visualX, hitboxX, isActive)
    }

    if (event.type === 'dig' && rearLoaded) {
      drawRearDitch(context, visualX, hitboxX, isActive)
    }

    if (event.type === 'traction') {
      drawMudPatch(context, visualX, hitboxX, isActive)
    }
  }
}

function drawForeground(context: CanvasRenderingContext2D, distance: number) {
  const markerOffset = (distance * 1.2) % 260

  for (let x = markerOffset - 260; x < CANVAS_WIDTH + 260; x += 260) {
    context.fillStyle = '#f5f0d0'
    context.fillRect(x, 444, 14, 86)
    context.fillStyle = '#d64a2f'
    context.fillRect(x - 12, 440, 38, 18)
  }
}

function drawPickupDirt(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save()
  context.fillStyle = isActive ? '#6f4e2e' : '#8c673e'
  context.beginPath()
  context.moveTo(visualX - 36, GROUND_Y + 18)
  context.lineTo(visualX - 10, GROUND_Y - 8)
  context.lineTo(visualX + 18, GROUND_Y + 12)
  context.lineTo(visualX + 34, GROUND_Y + 18)
  context.closePath()
  context.fill()
  context.strokeStyle = isActive ? '#fff2a8' : 'rgba(255,255,255,0.35)'
  context.lineWidth = 2
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 18,
    EVENT_HITBOX_HALF_WIDTH * 2,
    48,
  )
  context.restore()
}

function drawMudPatch(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save()
  context.fillStyle = isActive ? '#453217' : '#5b4322'
  context.beginPath()
  context.ellipse(visualX, GROUND_Y + 26, 48, 18, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = 'rgba(143, 112, 62, 0.75)'
  context.beginPath()
  context.ellipse(visualX - 14, GROUND_Y + 22, 14, 6, 0, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = isActive ? '#fff2a8' : 'rgba(255,255,255,0.35)'
  context.lineWidth = 2
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y + 2,
    EVENT_HITBOX_HALF_WIDTH * 2,
    50,
  )
  context.restore()
}

function drawRearDitch(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save()
  context.fillStyle = '#4f361b'
  context.beginPath()
  context.ellipse(visualX, GROUND_Y + 24, 60, 22, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#2a1b0d'
  context.beginPath()
  context.ellipse(visualX + 8, GROUND_Y + 26, 34, 10, 0, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = isActive ? '#fff2a8' : 'rgba(255,255,255,0.35)'
  context.lineWidth = 2
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y + 2,
    EVENT_HITBOX_HALF_WIDTH * 2,
    50,
  )
  context.restore()
}

function drawTruck(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save()
  context.fillStyle = '#35506d'
  context.fillRect(visualX - 76, GROUND_Y - 118, 110, 58)
  context.fillStyle = '#d7e1eb'
  context.fillRect(visualX + 34, GROUND_Y - 104, 44, 44)
  context.fillStyle = '#bb6d37'
  context.fillRect(visualX - 118, GROUND_Y - 92, 44, 32)
  context.fillStyle = '#1c2430'
  context.beginPath()
  context.arc(visualX - 58, GROUND_Y - 52, 18, 0, Math.PI * 2)
  context.arc(visualX + 38, GROUND_Y - 52, 18, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = isActive ? '#fff2a8' : 'rgba(255,255,255,0.35)'
  context.lineWidth = 2
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 126,
    EVENT_HITBOX_HALF_WIDTH * 2,
    104,
  )
  context.restore()
}

function drawSignage(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save()
  context.fillStyle = '#e7e3cc'
  context.fillRect(visualX - 8, GROUND_Y - 120, 16, 122)
  context.fillStyle = '#d2492f'
  context.fillRect(visualX - 54, GROUND_Y - 170, 108, 54)
  context.fillStyle = '#f5f0d0'
  context.fillRect(visualX - 44, GROUND_Y - 160, 88, 34)
  context.fillStyle = '#d64a2f'
  context.fillRect(visualX - 100, GROUND_Y - 16, 28, 36)
  context.fillRect(visualX + 72, GROUND_Y - 16, 28, 36)
  context.strokeStyle = isActive ? '#fff2a8' : 'rgba(255,255,255,0.35)'
  context.lineWidth = 2
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 174,
    EVENT_HITBOX_HALF_WIDTH * 2,
    204,
  )
  context.restore()
}
