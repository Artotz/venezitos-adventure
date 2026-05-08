type PauseMenuProps = {
  onResume: () => void;
  onOpenMainMenu: () => void;
  onOpenEditor: () => void;
};

export function PauseMenu({
  onResume,
  onOpenMainMenu,
  onOpenEditor,
}: PauseMenuProps) {
  return (
    <div className="phase-pause-overlay" role="dialog" aria-modal="true">
      <div className="phase-pause-menu">
        <p className="phase-pause-eyebrow">Pausado</p>
        <h2>Menu de pausa</h2>
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
