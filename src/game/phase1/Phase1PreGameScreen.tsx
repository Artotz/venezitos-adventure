import {
  EVENT_BUTTON_LABEL,
  PHASE1_BRIEFING_DESCRIPTION,
  PHASE1_BRIEFING_TITLE,
  PHASE1_MENU_DESCRIPTION,
  PHASE1_MENU_TITLE,
  QUESTION_OPTION_KEYS_LABEL,
  TRACTION_TOGGLE_KEY_LABEL,
} from './config'

type Phase1PreGameScreenProps = {
  step: 'menu' | 'briefing'
  onPlay: () => void
  onBack: () => void
  onStart: () => void
}

export function Phase1PreGameScreen({
  step,
  onPlay,
  onBack,
  onStart,
}: Phase1PreGameScreenProps) {
  if (step === 'menu') {
    return (
      <section className="phase-pre-game-card">
        <p className="phase-pre-game-eyebrow">Pre-jogo</p>
        <h2>{PHASE1_MENU_TITLE}</h2>
        <p className="phase-pre-game-copy">{PHASE1_MENU_DESCRIPTION}</p>
        <div className="phase-pre-game-actions">
          <button type="button" className="phase-primary-button" onClick={onPlay}>
            Jogar
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="phase-pre-game-card">
      <p className="phase-pre-game-eyebrow">Antes de entrar</p>
      <h2>{PHASE1_BRIEFING_TITLE}</h2>
      <p className="phase-pre-game-copy">{PHASE1_BRIEFING_DESCRIPTION}</p>
      <div className="phase-pre-game-checklist">
        <p>
          <strong>{EVENT_BUTTON_LABEL}</strong> aciona eventos manuais quando a
          hitbox estiver alinhada.
        </p>
        <p>
          <strong>{TRACTION_TOGGLE_KEY_LABEL}</strong> liga o bloqueio de
          diferencial nas areas de baixa tracao.
        </p>
        <p>
          <strong>{QUESTION_OPTION_KEYS_LABEL}</strong> responde as perguntas do
          instrutor.
        </p>
      </div>
      <div className="phase-pre-game-actions">
        <button type="button" className="phase-secondary-button" onClick={onBack}>
          Voltar
        </button>
        <button
          type="button"
          className="phase-primary-button"
          onClick={onStart}
        >
          Iniciar fase
        </button>
      </div>
    </section>
  )
}
