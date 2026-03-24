import { useState } from 'react'
import { GameCanvas } from './game/GameCanvas'
import { Phase1Canvas } from './game/Phase1Canvas'
import './styles.css'

function App() {
  const [activeView, setActiveView] = useState<'phase1' | 'editor'>('phase1')

  return (
    <main className="app-shell">
      <section className="game-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Venezito Adventure</p>
            <h1>
              {activeView === 'phase1'
                ? 'Fase 1: estrada infinita'
                : 'Editor da retroescavadeira'}
            </h1>
          </div>

          <p className="panel-copy">
            {activeView === 'phase1'
              ? 'A retroescavadeira avanca sem parar e voce precisa reagir rapido aos eventos da pista.'
              : 'As conexoes informadas foram aplicadas na montagem. Use os sliders para girar cada camada e revisar a hierarquia completa.'}
          </p>
        </div>

        <div className="game-stage">
          <div className="view-switcher" role="tablist" aria-label="Modos da aplicacao">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'phase1'}
              className={`tab-button${activeView === 'phase1' ? ' is-active' : ''}`}
              onClick={() => setActiveView('phase1')}
            >
              Fase 1
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'editor'}
              className={`tab-button${activeView === 'editor' ? ' is-active' : ''}`}
              onClick={() => setActiveView('editor')}
            >
              Editor
            </button>
          </div>

          <div className="view-content">
            {activeView === 'phase1' ? <Phase1Canvas /> : <GameCanvas />}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
