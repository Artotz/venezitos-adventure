import heroSrc from "../../assets/hero.png";
import { PHASE1_MENU_DESCRIPTION, PHASE1_MENU_TITLE } from "./config";

type Phase1PreGameScreenProps = {
  onPlay: () => void;
  onPlayPhase2: () => void;
  onOpenEditor: () => void;
};

export function Phase1PreGameScreen({
  onPlay,
  onPlayPhase2,
  onOpenEditor,
}: Phase1PreGameScreenProps) {
  return (
    <section className="phase-pre-game-card">
      <div className="phase-pre-game-content">
        <p className="phase-pre-game-eyebrow">Veneza Equipamentos</p>
        <h2>{PHASE1_MENU_TITLE}</h2>
        <p className="phase-pre-game-copy">{PHASE1_MENU_DESCRIPTION}</p>
        <div className="phase-pre-game-actions">
          <button
            type="button"
            className="phase-primary-button"
            onClick={onPlay}
          >
            Jogar fase 1
          </button>
          <button
            type="button"
            className="phase-primary-button"
            onClick={onPlayPhase2}
          >
            Jogar fase 2
          </button>
          <button
            type="button"
            className="phase-secondary-button"
            onClick={onOpenEditor}
          >
            Editor
          </button>
        </div>
      </div>

      <div className="phase-pre-game-hero" aria-hidden="true">
        <div className="phase-pre-game-hero-fade" />
        <img
          src={heroSrc}
          alt=""
          className="phase-pre-game-hero-image"
          draggable={false}
        />
      </div>
    </section>
  );
}
