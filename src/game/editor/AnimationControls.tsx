import { ANIMATION_PRESETS } from '../retro/config'
import type { AnimationPreset } from '../retro/types'

type AnimationControlsProps = {
  selectedAnimationId: string
  selectedAnimation: AnimationPreset | null
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  onAnimationChange: (value: string) => void
  onTimelineChange: (value: string) => void
  onTogglePlayback: () => void
}

export function AnimationControls({
  selectedAnimationId,
  selectedAnimation,
  isPlaying,
  currentTime,
  totalDuration,
  onAnimationChange,
  onTimelineChange,
  onTogglePlayback,
}: AnimationControlsProps) {
  return (
    <div className="controls-group">
      <div className="controls-header">
        <h2>Animacoes</h2>
        <button
          type="button"
          className="reset-button"
          onClick={onTogglePlayback}
          disabled={!selectedAnimation}
        >
          {isPlaying ? 'Pausar' : 'Tocar'}
        </button>
      </div>

      <label className="slider-control">
        <span className="slider-title">Preset</span>
        <select
          className="animation-select"
          value={selectedAnimationId}
          onChange={(event) => onAnimationChange(event.currentTarget.value)}
        >
          {ANIMATION_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </label>

      <label className="slider-control">
        <span className="slider-title">Timeline</span>
        <span className="slider-value">
          {Math.round(currentTime)} ms / {totalDuration} ms
        </span>
        <input
          type="range"
          min="0"
          max={String(totalDuration)}
          step="1"
          value={currentTime}
          onChange={(event) => onTimelineChange(event.currentTarget.value)}
        />
      </label>

      {selectedAnimation && (
        <div className="keyframe-list">
          {selectedAnimation.keyframes.map((keyframe, index) => (
            <div key={keyframe.at} className="keyframe-card">
              <strong>Keyframe {index}</strong>
              <span>{keyframe.at} ms</span>
              <code>{JSON.stringify(keyframe)}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
