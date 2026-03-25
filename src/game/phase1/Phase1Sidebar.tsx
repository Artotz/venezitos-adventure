import { EVENT_BUTTON } from './config'
import type { EventInfo, MapEvent } from './types'

type Phase1SidebarProps = {
  score: number
  distance: number
  speed: number
  loadedDirt: boolean
  hits: number
  fails: number
  activeAnimationLabel: string
  message: string
  activeEvent: MapEvent | null
  nextEvent: MapEvent | null
  activeEventInfo: EventInfo | null
  nextEventInfo: EventInfo | null
}

export function Phase1Sidebar({
  score,
  distance,
  speed,
  loadedDirt,
  hits,
  fails,
  activeAnimationLabel,
  message,
  activeEvent,
  nextEvent,
  activeEventInfo,
  nextEventInfo,
}: Phase1SidebarProps) {
  return (
    <div className="phase-sidebar">
      <div className="phase-card">
        <p className="phase-label">Fase 1</p>
        <h2>Estrada para a esquerda</h2>
        <p className="phase-copy">
          A retroescavadeira avanca para a esquerda e os eventos aparecem no
          proprio mapa.
        </p>
      </div>

      <div className="phase-card phase-stats">
        <div>
          <span className="stat-label">Pontuacao</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span className="stat-label">Distancia</span>
          <strong>{Math.floor(distance / 10)} m</strong>
        </div>
        <div>
          <span className="stat-label">Velocidade</span>
          <strong>{Math.round(speed)}</strong>
        </div>
        <div>
          <span className="stat-label">Terra</span>
          <strong>{loadedDirt ? 'Cheia' : 'Vazia'}</strong>
        </div>
      </div>

      <div className="phase-card phase-stats">
        <div>
          <span className="stat-label">Acertos</span>
          <strong>{hits}</strong>
        </div>
        <div>
          <span className="stat-label">Falhas</span>
          <strong>{fails}</strong>
        </div>
        <div>
          <span className="stat-label">Animacao</span>
          <strong>{activeAnimationLabel}</strong>
        </div>
        <div>
          <span className="stat-label">Controles</span>
          <strong>{EVENT_BUTTON}</strong>
        </div>
      </div>

      <div className="phase-card">
        <p className="phase-label">Status</p>
        <p className="phase-hint">{message}</p>
      </div>

      <div className="phase-card event-card">
        <p className="phase-label">Evento Atual</p>
        {activeEvent ? (
          <>
            <h3>{activeEventInfo?.title}</h3>
            <p>{activeEventInfo?.description}</p>
            <p>
              Pressione <strong>{EVENT_BUTTON}</strong> para responder.
            </p>
            <p className="phase-copy">{activeEventInfo?.hint}</p>
          </>
        ) : (
          <p className="phase-copy">Nenhum evento em contato com a maquina.</p>
        )}
      </div>

      <div className="phase-card">
        <p className="phase-label">Proximo do mapa</p>
        {nextEvent ? (
          <p className="phase-copy">
            {nextEventInfo?.title} em aproximadamente{' '}
            {Math.max(0, Math.round((nextEvent.hitboxX - distance) / 10))} m.
          </p>
        ) : (
          <p className="phase-copy">
            Todos os eventos dessa sequencia foram consumidos.
          </p>
        )}
      </div>
    </div>
  )
}
