import {
  GREASE_POINTS,
  type GreaseAnimationConfig,
} from "../venezito/greaseAnimation"

type GreaseControlsProps = {
  config: GreaseAnimationConfig
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  currentPointIndex: number | null
  onTogglePlayback: () => void
  onTimelineChange: (value: string) => void
  onReset: () => void
  onScalarConfigChange: (
    key: keyof Omit<GreaseAnimationConfig, "wobbleRotations" | "wobbleYOffsets">,
    value: string,
  ) => void
  onSequenceConfigChange: (
    key: "wobbleRotations" | "wobbleYOffsets",
    index: number,
    value: string,
  ) => void
}

const SCALAR_FIELDS: Array<{
  key: keyof Omit<GreaseAnimationConfig, "wobbleRotations" | "wobbleYOffsets">
  label: string
  min: number
  max: number
  step: number
  suffix: string
}> = [
  {
    key: "frameDurationMs",
    label: "Duracao por frame",
    min: 20,
    max: 1000,
    step: 1,
    suffix: "ms",
  },
  {
    key: "framesPerPoint",
    label: "Frames por ponto",
    min: 1,
    max: 8,
    step: 1,
    suffix: "",
  },
  {
    key: "spriteHeight",
    label: "Altura do sprite",
    min: 40,
    max: 260,
    step: 1,
    suffix: "px",
  },
  {
    key: "spriteOffsetX",
    label: "Offset X",
    min: -200,
    max: 200,
    step: 1,
    suffix: "px",
  },
  {
    key: "spriteOffsetY",
    label: "Offset Y",
    min: -200,
    max: 200,
    step: 1,
    suffix: "px",
  },
  {
    key: "spritePivotX",
    label: "Pivot X",
    min: 0,
    max: 1,
    step: 0.01,
    suffix: "",
  },
  {
    key: "spritePivotY",
    label: "Pivot Y",
    min: 0,
    max: 1,
    step: 0.01,
    suffix: "",
  },
]

export function GreaseControls({
  config,
  isPlaying,
  currentTime,
  totalDuration,
  currentPointIndex,
  onTogglePlayback,
  onTimelineChange,
  onReset,
  onScalarConfigChange,
  onSequenceConfigChange,
}: GreaseControlsProps) {
  const configCode = JSON.stringify(config, null, 2)

  return (
    <div className="controls-group grease-controls">
      <div className="controls-header">
        <h2>Venezito Grease</h2>
        <div className="controls-actions">
          <button type="button" className="reset-button" onClick={onReset}>
            Resetar
          </button>
          <button type="button" className="reset-button" onClick={onTogglePlayback}>
            {isPlaying ? "Pausar" : "Tocar"}
          </button>
        </div>
      </div>

      <p className="points-help">
        Preview usando {GREASE_POINTS.length} pontos da maquina.
        {currentPointIndex === null
          ? " Ajuste os parametros e toque a animacao."
          : ` Ponto atual: ${currentPointIndex + 1}/${GREASE_POINTS.length}.`}
      </p>

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
          value={Math.min(currentTime, totalDuration)}
          onChange={(event) => onTimelineChange(event.currentTarget.value)}
        />
      </label>

      {SCALAR_FIELDS.map((field) => {
        const rawValue = config[field.key]
        const valueLabel =
          field.step < 1 ? Number(rawValue).toFixed(2) : Math.round(Number(rawValue))

        return (
          <label key={field.key} className="slider-control">
            <span className="slider-title">{field.label}</span>
            <span className="slider-value">
              {valueLabel}
              {field.suffix ? ` ${field.suffix}` : ""}
            </span>
            <input
              type="range"
              min={String(field.min)}
              max={String(field.max)}
              step={String(field.step)}
              value={String(rawValue)}
              onChange={(event) =>
                onScalarConfigChange(field.key, event.currentTarget.value)
              }
            />
          </label>
        )
      })}

      <div className="grease-sequence-grid">
        {config.wobbleRotations.map((value, index) => (
          <label key={`rotation-${index}`} className="slider-control">
            <span className="slider-title">{`Rotacao frame ${index + 1}`}</span>
            <span className="slider-value">{value.toFixed(2)} rad</span>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.01"
              value={String(value)}
              onChange={(event) =>
                onSequenceConfigChange(
                  "wobbleRotations",
                  index,
                  event.currentTarget.value,
                )
              }
            />
          </label>
        ))}

        {config.wobbleYOffsets.map((value, index) => (
          <label key={`offset-${index}`} className="slider-control">
            <span className="slider-title">{`Offset Y frame ${index + 1}`}</span>
            <span className="slider-value">{Math.round(value)} px</span>
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={String(value)}
              onChange={(event) =>
                onSequenceConfigChange(
                  "wobbleYOffsets",
                  index,
                  event.currentTarget.value,
                )
              }
            />
          </label>
        ))}
      </div>

      <div className="point-export">
        <span>Config atual</span>
        <code>{configCode}</code>
      </div>
    </div>
  )
}
