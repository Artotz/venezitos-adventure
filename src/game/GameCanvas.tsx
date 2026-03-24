import { useEffect, useRef } from 'react'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants'
import { GameEngine } from './engine'
import { InputManager } from './input'
import type { GameSnapshot } from './types'
import { useGameLoop } from './useGameLoop'

type GameCanvasProps = {
  paused: boolean
  resetCount: number
  onSnapshotChange: (snapshot: GameSnapshot) => void
}

export function GameCanvas({
  paused,
  resetCount,
  onSnapshotChange,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const onSnapshotChangeRef = useRef(onSnapshotChange)
  const snapshotRef = useRef<GameSnapshot>({
    score: 0,
    paused,
  })

  useEffect(() => {
    onSnapshotChangeRef.current = onSnapshotChange
  }, [onSnapshotChange])

  const emitSnapshot = (score: number, isPaused: boolean) => {
    const nextSnapshot = { score, paused: isPaused }

    if (
      snapshotRef.current.score !== nextSnapshot.score ||
      snapshotRef.current.paused !== nextSnapshot.paused
    ) {
      snapshotRef.current = nextSnapshot
      onSnapshotChangeRef.current(nextSnapshot)
    }
  }

  const drawCurrentFrame = () => {
    const canvas = canvasRef.current
    const engine = engineRef.current

    if (!canvas || !engine) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    engine.render(context)
  }

  useEffect(() => {
    const input = new InputManager()
    const engine = new GameEngine(input)

    input.attach()
    engineRef.current = engine

    drawCurrentFrame()
    emitSnapshot(engine.getScore(), false)

    return () => {
      input.detach()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    const engine = engineRef.current

    if (!engine) {
      return
    }

    drawCurrentFrame()
    emitSnapshot(engine.getScore(), paused)
  }, [paused])

  useEffect(() => {
    const engine = engineRef.current

    if (!engine) {
      return
    }

    engine.reset()
    drawCurrentFrame()
    emitSnapshot(engine.getScore(), paused)
  }, [resetCount, paused])

  useGameLoop(
    (dt) => {
      const engine = engineRef.current

      if (!engine) {
        return
      }

      engine.update(dt)
      drawCurrentFrame()
      emitSnapshot(engine.getScore(), false)
    },
    !paused,
  )

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      aria-label="Canvas do minigame"
    />
  )
}
