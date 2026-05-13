import {
  PHASE2_MENU_EYEBROW,
  PHASE2_PRE_GAME_ACTION_LABEL,
  PHASE2_PRE_GAME_BACK_LABEL,
  PHASE2_PRE_GAME_DESCRIPTION,
  PHASE2_PRE_GAME_TITLE,
} from "./config";

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
        <p className="phase-pre-game-eyebrow phase2-eyebrow">
          {PHASE2_MENU_EYEBROW}
        </p>
        <h2>{PHASE2_PRE_GAME_TITLE}</h2>
        <p className="phase-pre-game-copy">{PHASE2_PRE_GAME_DESCRIPTION}</p>
        <div className="phase-pre-game-actions">
          <button
            type="button"
            className="phase-primary-button phase2-primary-button"
            onClick={onPlay}
          >
            {PHASE2_PRE_GAME_ACTION_LABEL}
          </button>
          <button
            type="button"
            className="phase-secondary-button phase2-secondary-button"
            onClick={onOpenMainMenu}
          >
            {PHASE2_PRE_GAME_BACK_LABEL}
          </button>
        </div>
      </div>

      <div className="phase-pre-game-hero" aria-hidden="true">
        <div className="phase-pre-game-hero-fade phase2-hero-fade" />
      </div>
    </section>
  );
}
