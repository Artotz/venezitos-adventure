import type { ExcavatorPose } from '../retro/types'
import { AnimationControls } from './AnimationControls'
import { EditorTabs } from './EditorTabs'
import { PoseControls } from './PoseControls'
import type { useRetroEditor } from './useRetroEditor'

type RetroEditorSidebarProps = {
  editor: ReturnType<typeof useRetroEditor>
}

export function RetroEditorSidebar({ editor }: RetroEditorSidebarProps) {
  const summaryPose: ExcavatorPose = editor.displayPose

  return (
    <div className="controls-panel">
      <EditorTabs activeTab={editor.activeTab} onChange={editor.setActiveTab} />

      <div className="phase-card">
        <p className="phase-label">Editor</p>
        <h2>Fonte de verdade da fase</h2>
        <p className="phase-copy">
          O preview usa as mesmas poses base, sprites e presets que movem a
          retroescavadeira em `Phase1Canvas`.
        </p>
      </div>

      <div className="phase-card phase-stats">
        <div>
          <span className="stat-label">Preset</span>
          <strong>{editor.selectedAnimation?.name ?? 'Nenhum'}</strong>
        </div>
        <div>
          <span className="stat-label">Timeline</span>
          <strong>{Math.round(editor.currentTime)} ms</strong>
        </div>
        <div>
          <span className="stat-label">Cacamba</span>
          <strong>{summaryPose.sprites['Camada 2.png']}</strong>
        </div>
        <div>
          <span className="stat-label">Traseira</span>
          <strong>{summaryPose.sprites['Camada 8.png']}</strong>
        </div>
      </div>

      {editor.activeTab === 'poses' ? (
        <PoseControls
          displayPose={editor.displayPose}
          onAngleChange={editor.handleAngleChange}
          onReset={editor.resetPose}
        />
      ) : (
        <AnimationControls
          selectedAnimationId={editor.selectedAnimationId}
          selectedAnimation={editor.selectedAnimation}
          isPlaying={editor.isPlaying}
          currentTime={editor.currentTime}
          totalDuration={editor.totalDuration}
          onAnimationChange={editor.handleAnimationChange}
          onTimelineChange={editor.handleTimelineChange}
          onTogglePlayback={editor.togglePlayback}
        />
      )}
    </div>
  )
}
