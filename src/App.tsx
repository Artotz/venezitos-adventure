import { GameCanvas } from './game/GameCanvas'
import './styles.css'

function App() {
  return (
    <main className="app-shell">
      <section className="game-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Retro Mount Helper</p>
            <h1>Retro montada com articulacoes</h1>
          </div>

          <p className="panel-copy">
            As conexoes informadas foram aplicadas na montagem. Use os sliders
            para girar cada camada em relacao ao seu ponto pai e visualizar a
            hierarquia completa da retro.
          </p>
        </div>

        <div className="game-stage">
          <GameCanvas />
        </div>
      </section>
    </main>
  )
}

export default App
