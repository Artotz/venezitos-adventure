import { PHASE1_MENU_DESCRIPTION, PHASE1_MENU_TITLE } from "./config";

type Phase1PreGameScreenProps = {
  onPlay: () => void;
  onOpenEditor: () => void;
};

export function Phase1PreGameScreen({
  onPlay,
  onOpenEditor,
}: Phase1PreGameScreenProps) {
  return (
    <section className="phase-pre-game-card">
      <p className="phase-pre-game-eyebrow">Veneza Equipamentos</p>
      <h2>{PHASE1_MENU_TITLE}</h2>
      <p className="phase-pre-game-copy">{PHASE1_MENU_DESCRIPTION}</p>
      <div className="phase-pre-game-actions">
        <button type="button" className="phase-primary-button" onClick={onPlay}>
          Jogar
        </button>
        <button
          type="button"
          className="phase-secondary-button"
          onClick={onOpenEditor}
        >
          Editor
        </button>
      </div>
    </section>
  );
}
