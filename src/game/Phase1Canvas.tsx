import { useEffect, useMemo, useRef } from 'react'

import { buildPhase1Pose } from './retro/animations'
import { computeWorldMatrices, createTranslationMatrix } from './retro/geometry'
import { createLayerImageMap, drawExcavator } from './retro/render'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_Y,
  PLAYER_HIT_LINE_X,
  PLAYER_SCREEN_X,
} from './phase1/config'
import { describeMapEvent } from './phase1/events'
import { Phase1Sidebar } from './phase1/Phase1Sidebar'
import {
  drawCenterGuide,
  drawPhase1Backdrop,
  drawPhase1Environment,
} from './phase1/render'
import { usePhase1Game } from './phase1/usePhase1Game'

export function Phase1Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const game = usePhase1Game()

  const activeEvent = useMemo(
    () =>
      game.activeEventId !== null
        ? game.events.find((event) => event.id === game.activeEventId) ?? null
        : null,
    [game.activeEventId, game.events],
  )

  const nextEvent = useMemo(
    () => game.events.find((event) => event.status === 'upcoming') ?? null,
    [game.events],
  )

  const activeEventInfo = useMemo(
    () =>
      activeEvent
        ? describeMapEvent(activeEvent, game.loadedDirt, game.rearLoaded)
        : null,
    [activeEvent, game.loadedDirt, game.rearLoaded],
  )

  const nextEventInfo = useMemo(
    () =>
      nextEvent
        ? describeMapEvent(nextEvent, game.loadedDirt, game.rearLoaded)
        : null,
    [game.loadedDirt, game.rearLoaded, nextEvent],
  )

  const pose = buildPhase1Pose({
    distance: game.distance,
    loadedDirt: game.loadedDirt,
    rearLoaded: game.rearLoaded,
    frontAnimation: game.frontAnimationRef.current,
    rearAnimation: game.rearAnimationRef.current,
  })

  const images = useMemo(
    () => (game.sprites ? createLayerImageMap(game.sprites, pose.sprites) : null),
    [game.sprites, pose.sprites],
  )

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas || !game.excavatorScene || !images) {
      return
    }

    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const machineY = GROUND_Y - game.excavatorScene.contentHeight + 60
    const worldMatrices = computeWorldMatrices(
      pose.angles,
      createTranslationMatrix(
        PLAYER_SCREEN_X - game.excavatorScene.contentWidth / 2,
        machineY,
      ),
    )

    context.clearRect(0, 0, canvas.width, canvas.height)
    drawPhase1Backdrop(context)
    drawPhase1Environment({
      context,
      distance: game.distance,
      events: game.events,
      activeEventId: game.activeEventId,
      loadedDirt: game.loadedDirt,
      rearLoaded: game.rearLoaded,
    })
    drawExcavator(context, images, worldMatrices)
    drawCenterGuide(
      context,
      PLAYER_HIT_LINE_X,
      machineY + 70,
      machineY + game.excavatorScene.contentHeight - 20,
      game.activeEventId !== null,
    )
  }, [
    game.activeEventId,
    game.distance,
    game.events,
    game.excavatorScene,
    game.loadedDirt,
    game.rearLoaded,
    game.animationTick,
    images,
    pose.angles,
  ])

  if (!game.excavatorScene || !images) {
    return <p className="canvas-status">Carregando fase 1...</p>
  }

  return (
    <div className="phase-layout">
      <Phase1Sidebar
        score={game.score}
        distance={game.distance}
        speed={game.speed}
        loadedDirt={game.loadedDirt}
        hits={game.hits}
        fails={game.fails}
        activeAnimationLabel={game.activeAnimationLabel}
        message={game.message}
        activeEvent={activeEvent}
        nextEvent={nextEvent}
        activeEventInfo={activeEventInfo}
        nextEventInfo={nextEventInfo}
      />

      <div className="phase-canvas-frame">
        <canvas
          ref={canvasRef}
          className="phase-canvas"
          aria-label="Fase 1 com a retroescavadeira andando infinitamente para a esquerda"
        />
      </div>
    </div>
  )
}
