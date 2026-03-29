import type { EditorPoint } from './types'

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
        <h2>Pontos</h2>
        <button
          type="button"
          className="reset-button"
          onClick={onClear}
          disabled={points.length === 0}
        >
          Limpar
        </button>
      </div>

      <p className="points-help">
        Clique no desenho da retro para salvar coordenadas relativas a maquina.
      </p>

      <div className="points-summary">
        <strong>{points.length}</strong>
        <span>{points.length === 1 ? 'ponto salvo' : 'pontos salvos'}</span>
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
                  Remover
                </button>
              </div>
            ))}
          </div>

          <div className="point-export">
            <span>Formato para copiar</span>
            <code>{pointsCode}</code>
          </div>
        </>
      ) : (
        <div className="empty-state">
          Nenhum ponto salvo ainda.
        </div>
      )}
    </div>
  )
}
