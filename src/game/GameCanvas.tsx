import { useEffect, useMemo, useRef } from 'react'

import { createTranslationMatrix, computeWorldMatrices } from './retro/geometry'
import {
  createLayerImageMap,
  drawExcavator,
  measureBaseExcavator,
} from './retro/render'
import { useRetroSprites } from './retro/sprites'
import { CANVAS_HEIGHT, CANVAS_WIDTH, GROUND_Y } from './phase1/config'
import { EditorTabs } from './editor/EditorTabs'
import { drawPhase1Backdrop, drawPhase1Environment } from './phase1/render'
import { ModeTabs } from './ModeTabs'
import { RetroEditorSidebar } from './editor/RetroEditorSidebar'
import { useRetroEditor } from './editor/useRetroEditor'

const EDITOR_CANVAS_WIDTH = Math.max(CANVAS_WIDTH - 260, 1120)
const EDITOR_CANVAS_HEIGHT = CANVAS_HEIGHT

type GameCanvasProps = {
  activeView: 'phase1' | 'editor'
  onChangeView: (view: 'phase1' | 'editor') => void
}

export function GameCanvas({ activeView, onChangeView }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sprites = useRetroSprites()
  const editor = useRetroEditor()

  const excavatorScene = useMemo(
    () => (sprites ? measureBaseExcavator(sprites) : null),
    [sprites],
  )

  const images = useMemo(
    () =>
      sprites ? createLayerImageMap(sprites, editor.displayPose.sprites) : null,
    [editor.displayPose.sprites, sprites],
  )

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas || !images || !excavatorScene) {
      return
    }

    canvas.width = EDITOR_CANVAS_WIDTH
    canvas.height = EDITOR_CANVAS_HEIGHT

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const machineY = GROUND_Y - excavatorScene.contentHeight + 60
    const worldMatrices = computeWorldMatrices(
      editor.displayPose.angles,
      createTranslationMatrix(
        EDITOR_CANVAS_WIDTH / 2 - excavatorScene.contentWidth / 2,
        machineY,
      ),
    )

    context.clearRect(0, 0, canvas.width, canvas.height)
    drawPhase1Backdrop(context)
    drawPhase1Environment({
      context,
      distance: 0,
      events: [],
      activeEventId: null,
      loadedDirt: false,
      rearLoaded: false,
    })
    drawExcavator(context, images, worldMatrices)
  }, [editor.displayPose, excavatorScene, images])

  if (!excavatorScene || !images) {
    return <p className="canvas-status">Carregando camadas retro...</p>
  }

  return (
    <>
      <div className="stage-toolbar">
        <ModeTabs activeView={activeView} onChange={onChangeView} />
        <EditorTabs activeTab={editor.activeTab} onChange={editor.setActiveTab} />
      </div>

      <div className="assembly-layout">
        <RetroEditorSidebar editor={editor} />

        <div className="canvas-scroll">
          <canvas
            ref={canvasRef}
            className="game-canvas"
            aria-label="Editor da retroescavadeira usando as mesmas poses e animacoes da fase 1"
          />
        </div>
      </div>
    </>
  )
}
