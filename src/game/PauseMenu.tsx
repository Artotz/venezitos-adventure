import type { Phase1ControlScheme } from "./phase1/controls";

type PauseMenuProps = {
  onResume: () => void;
  onOpenMainMenu: () => void;
  onOpenEditor: () => void;
  controlScheme?: Phase1ControlScheme;
  onToggleControlScheme?: () => void;
};

export function PauseMenu({
  onResume,
  onOpenMainMenu,
  onOpenEditor,
  controlScheme,
  onToggleControlScheme,
}: PauseMenuProps) {
  return (
    <div className="phase-pause-overlay" role="dialog" aria-modal="true">
      <div className="phase-pause-menu">
        <p className="phase-pause-eyebrow">Pausado</p>
        <h2>Menu de pausa</h2>
        {controlScheme && onToggleControlScheme ? (
          <div className="phase-control-toggle">
            <div>
              <span>Controles</span>
              <strong>{controlScheme.name}</strong>
              <small>
                {controlScheme.driveSummary}. {controlScheme.eventSummary}.
              </small>
            </div>
            <button
              type="button"
              className="phase-secondary-button"
              onClick={onToggleControlScheme}
            >
              Alternar
            </button>
          </div>
        ) : null}
        <div className="phase-pause-actions">
          <button
            type="button"
            className="phase-primary-button"
            onClick={onResume}
          >
            Retomar
          </button>
          <button
            type="button"
            className="phase-secondary-button"
            onClick={onOpenMainMenu}
          >
            Menu principal
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
    </div>
  );
}
