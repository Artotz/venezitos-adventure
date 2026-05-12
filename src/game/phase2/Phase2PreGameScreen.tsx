type Phase2PreGameScreenProps = {
  onPlay: () => void;
  onOpenMainMenu: () => void;
};

export function Phase2PreGameScreen({
  onPlay,
  onOpenMainMenu,
}: Phase2PreGameScreenProps) {
  return (
    <section className="phase-pre-game-card phase2-pre-game-card">
      <div className="phase-pre-game-content">
        <p className="phase-pre-game-eyebrow phase2-eyebrow">Veneza Máquinas</p>
        <h2>Fase 2 - Corte de grama</h2>
        <p className="phase-pre-game-copy">
          Controle o trator com as setas ou WASD e corte toda a grama do campo.
        </p>
        <div className="phase-pre-game-actions">
          <button
            type="button"
            className="phase-primary-button phase2-primary-button"
            onClick={onPlay}
          >
            Começar (Enter)
          </button>
          <button
            type="button"
            className="phase-secondary-button phase2-secondary-button"
            onClick={onOpenMainMenu}
          >
            Voltar ao Menu
          </button>
        </div>
      </div>

      <div className="phase-pre-game-hero" aria-hidden="true">
        <div className="phase-pre-game-hero-fade phase2-hero-fade" />
      </div>
    </section>
  );
}
