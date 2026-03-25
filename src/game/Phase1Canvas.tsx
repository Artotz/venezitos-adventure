import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

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
import { ModeTabs } from './ModeTabs'
import {
  drawCenterGuide,
  drawPhase1Backdrop,
  drawPhase1Environment,
  drawPhase1Hud,
  drawQuestionModal,
} from './phase1/render'
import { usePhase1Game } from './phase1/usePhase1Game'

type Phase1CanvasProps = {
  activeView: 'phase1' | 'editor'
  onChangeView: (view: 'phase1' | 'editor') => void
}

export function Phase1Canvas({
  activeView,
  onChangeView,
}: Phase1CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasScale, setCanvasScale] = useState(1)
  const game = usePhase1Game()

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
    const updateCanvasScale = () => {
      const widthPadding = window.innerWidth <= 900 ? 32 : 72
      const heightPadding = window.innerWidth <= 900 ? 260 : 220
      const availableWidth = Math.max(320, window.innerWidth - widthPadding)
      const availableHeight = Math.max(260, window.innerHeight - heightPadding)
      const nextScale = Math.min(
        1,
        availableWidth / CANVAS_WIDTH,
        availableHeight / CANVAS_HEIGHT,
      )

      setCanvasScale(nextScale > 0 ? nextScale : 1)
    }

    updateCanvasScale()
    window.addEventListener('resize', updateCanvasScale)

    return () => {
      window.removeEventListener('resize', updateCanvasScale)
    }
  }, [])

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
    drawPhase1Hud({
      context,
      score: game.score,
      distance: game.distance,
      differentialLockEnabled: game.differentialLockEnabled,
    })
    if (game.questionModal) {
      drawQuestionModal(context, game.questionModal)
    }
  }, [
    game.activeEventId,
    game.distance,
    game.differentialLockEnabled,
    game.events,
    game.excavatorScene,
    game.loadedDirt,
    game.rearLoaded,
    game.animationTick,
    game.questionModal,
    game.score,
    images,
    pose.angles,
  ])

  if (!game.excavatorScene || !images) {
    return <p className="canvas-status">Carregando fase 1...</p>
  }

  const scaledCanvasWidth = Math.round(CANVAS_WIDTH * canvasScale)
  const scaledCanvasHeight = Math.round(CANVAS_HEIGHT * canvasScale)

  return (
    <div className="phase-layout">
      <div className="stage-toolbar">
        <ModeTabs activeView={activeView} onChange={onChangeView} />
        <p className="phase-toolbar-hint">
          Espaco age, <strong>S</strong> liga o bloqueio, <strong>WASD</strong>{' '}
          responde perguntas
        </p>
      </div>

      <div
        className="phase-canvas-frame"
        style={
          {
            '--phase-canvas-width': `${scaledCanvasWidth}px`,
            '--phase-canvas-height': `${scaledCanvasHeight}px`,
          } as CSSProperties
        }
      >
        <canvas
          ref={canvasRef}
          className="phase-canvas"
          aria-label="Fase 1 com a retroescavadeira andando infinitamente para a esquerda"
        />
      </div>
    </div>
  )
}
