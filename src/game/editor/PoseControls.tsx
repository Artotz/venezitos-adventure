import { CONTROLLABLE_LAYERS, LAYER_CONFIG } from '../retro/config'
import { TEXT } from '../i18n'
import type { ExcavatorPose, LayerName } from '../retro/types'

type PoseControlsProps = {
  displayPose: ExcavatorPose
  onAngleChange: (layerName: LayerName, value: string) => void
  onReset: () => void
}

export function PoseControls({
  displayPose,
  onAngleChange,
  onReset,
}: PoseControlsProps) {
  return (
    <div className="controls-group">
      <div className="controls-header">
        <h2>{TEXT.editor.pose.title}</h2>
        <button type="button" className="reset-button" onClick={onReset}>
          {TEXT.common.reset}
        </button>
      </div>

      {CONTROLLABLE_LAYERS.map((layerName) => {
        const config = LAYER_CONFIG[layerName]
        const displayValue = displayPose.angles[layerName]
        const sliderValue = Math.round(displayValue)

        return (
          <label key={layerName} className="slider-control">
            <span className="slider-title">{config.label}</span>
            <span className="slider-value">{sliderValue} deg</span>
            <input
              type="range"
              min={config.min}
              max={config.max}
              step="1"
              value={sliderValue}
              onChange={(event) =>
                onAngleChange(layerName, event.currentTarget.value)
              }
            />
          </label>
        )
      })}
    </div>
  )
}
