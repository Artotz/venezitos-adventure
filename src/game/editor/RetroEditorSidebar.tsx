import { AnimationControls } from './AnimationControls'
import { PoseControls } from './PoseControls'
import { SoundControls } from './SoundControls'
import type { useRetroEditor } from './useRetroEditor'

type RetroEditorSidebarProps = {
  editor: ReturnType<typeof useRetroEditor>
}

export function RetroEditorSidebar({ editor }: RetroEditorSidebarProps) {
  return (
    <div className="controls-panel">
      {editor.activeTab === 'poses' ? (
        <PoseControls
          displayPose={editor.displayPose}
          onAngleChange={editor.handleAngleChange}
          onReset={editor.resetPose}
        />
      ) : editor.activeTab === 'animations' ? (
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
      ) : (
        <SoundControls />
      )}
    </div>
  )
}
