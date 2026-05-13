import type { EditorPoint } from './types'
import { TEXT } from '../i18n'

type PointsControlsProps = {
  points: EditorPoint[]
  onRemove: (id: string) => void
  onClear: () => void
}

export function PointsControls({
  points,
  onRemove,
  onClear,
}: PointsControlsProps) {
  const pointsCode = points
    .map((point, index) => `P${index + 1}: { x: ${point.x}, y: ${point.y} }`)
    .join('\n')

  return (
    <div className="controls-group points-controls">
      <div className="controls-header">
        <h2>{TEXT.editor.points.title}</h2>
        <button
          type="button"
          className="reset-button"
          onClick={onClear}
          disabled={points.length === 0}
        >
          {TEXT.editor.points.clear}
        </button>
      </div>

      <p className="points-help">
        {TEXT.editor.points.help}
      </p>

      <div className="points-summary">
        <strong>{points.length}</strong>
        <span>
          {points.length === 1
            ? TEXT.editor.points.savedSingular
            : TEXT.editor.points.savedPlural}
        </span>
      </div>

      {points.length > 0 ? (
        <>
          <div className="point-list">
            {points.map((point, index) => (
              <div key={point.id} className="point-card">
                <div className="point-card-copy">
                  <strong>{`P${index + 1}`}</strong>
                  <code>{`x: ${point.x}, y: ${point.y}`}</code>
                </div>
                <button
                  type="button"
                  className="reset-button"
                  onClick={() => onRemove(point.id)}
                >
                  {TEXT.common.remove}
                </button>
              </div>
            ))}
          </div>

          <div className="point-export">
            <span>{TEXT.editor.points.copyFormat}</span>
            <code>{pointsCode}</code>
          </div>
        </>
      ) : (
        <div className="empty-state">
          {TEXT.editor.points.empty}
        </div>
      )}
    </div>
  )
}
