type ModeTabsProps = {
  activeView: 'phase1' | 'editor'
  onChange: (view: 'phase1' | 'editor') => void
}

export function ModeTabs({ activeView, onChange }: ModeTabsProps) {
  return (
    <div className="view-switcher" role="tablist" aria-label="Modos da aplicacao">
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'phase1'}
        className={`tab-button${activeView === 'phase1' ? ' is-active' : ''}`}
        onClick={() => onChange('phase1')}
      >
        Fase 1
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'editor'}
        className={`tab-button${activeView === 'editor' ? ' is-active' : ''}`}
        onClick={() => onChange('editor')}
      >
        Editor
      </button>
    </div>
  )
}
