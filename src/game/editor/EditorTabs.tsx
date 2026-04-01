import type { EditorTab } from './types'

type EditorTabsProps = {
  activeTab: EditorTab
  onChange: (tab: EditorTab) => void
}

export function EditorTabs({ activeTab, onChange }: EditorTabsProps) {
  return (
    <div className="tab-bar" role="tablist" aria-label="Controles da retro">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'poses'}
        className={`tab-button${activeTab === 'poses' ? ' is-active' : ''}`}
        onClick={() => onChange('poses')}
      >
        Poses
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'animations'}
        className={`tab-button${activeTab === 'animations' ? ' is-active' : ''}`}
        onClick={() => onChange('animations')}
      >
        Animacoes
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'grease'}
        className={`tab-button${activeTab === 'grease' ? ' is-active' : ''}`}
        onClick={() => onChange('grease')}
      >
        Venezito
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'sounds'}
        className={`tab-button${activeTab === 'sounds' ? ' is-active' : ''}`}
        onClick={() => onChange('sounds')}
      >
        Sons
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'points'}
        className={`tab-button${activeTab === 'points' ? ' is-active' : ''}`}
        onClick={() => onChange('points')}
      >
        Pontos
      </button>
    </div>
  )
}
