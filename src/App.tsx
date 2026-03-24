import { useState } from 'react'
import { GameCanvas } from './game/GameCanvas'
import type { GameSnapshot } from './game/types'
import './styles.css'

const initialSnapshot: GameSnapshot = {
  score: 0,
  paused: false,
}

function App() {
  const [paused, setPaused] = useState(false)
  const [resetCount, setResetCount] = useState(0)
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot)

  const handleTogglePaused = () => {
    setPaused((current) => !current)
  }

  const handleReset = () => {
    setPaused(false)
    setResetCount((current) => current + 1)
    setSnapshot(initialSnapshot)
  }

  const handleSnapshotChange = (nextSnapshot: GameSnapshot) => {
    setSnapshot(nextSnapshot)
  }

  return (
    <main className="app-shell">
      <section className="game-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">MiniGame Base</p>
            <h1>Top-down Canvas Playground</h1>
          </div>

          <div className="hud" aria-label="HUD do jogo">
            <div className="hud-card">
              <span className="hud-label">Score</span>
              <strong>{snapshot.score}</strong>
            </div>
            <div className="hud-card">
              <span className="hud-label">Status</span>
              <strong>{snapshot.paused ? 'Paused' : 'Running'}</strong>
            </div>
          </div>
        </div>

        <div className="game-stage">
          <GameCanvas
            paused={paused}
            resetCount={resetCount}
            onSnapshotChange={handleSnapshotChange}
          />

          {paused && (
            <div className="pause-overlay" role="dialog" aria-modal="true">
              <p className="overlay-label">Paused</p>
              <h2>Loop interrompido</h2>
              <p>
                O React continua no controle da interface enquanto o canvas fica
                congelado.
              </p>
            </div>
          )}
        </div>

        <div className="controls">
          <button type="button" className="primary-button" onClick={handleTogglePaused}>
            {paused ? 'Continuar' : 'Pausar'}
          </button>
          <button type="button" className="secondary-button" onClick={handleReset}>
            Resetar
          </button>
        </div>

        <p className="help-text">
          Movimento: <kbd>WASD</kbd> ou <kbd>Setas</kbd>
        </p>
      </section>
    </main>
  )
}

export default App
