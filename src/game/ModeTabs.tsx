import { TEXT } from "./i18n"

type ModeTabsProps = {
  activeView: 'phase1' | 'phase2' | 'editor'
  onChange: (view: 'phase1' | 'phase2' | 'editor') => void
}

export function ModeTabs({ activeView, onChange }: ModeTabsProps) {
  return (
    <div className="view-switcher" role="tablist" aria-label={TEXT.modeTabs.aria}>
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'phase1'}
        className={`tab-button${activeView === 'phase1' ? ' is-active' : ''}`}
        onClick={() => onChange('phase1')}
      >
        {TEXT.common.phase1}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'phase2'}
        className={`tab-button${activeView === 'phase2' ? ' is-active' : ''}`}
        onClick={() => onChange('phase2')}
      >
        {TEXT.common.phase2}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'editor'}
        className={`tab-button${activeView === 'editor' ? ' is-active' : ''}`}
        onClick={() => onChange('editor')}
      >
        {TEXT.common.editor}
      </button>
    </div>
  )
}
