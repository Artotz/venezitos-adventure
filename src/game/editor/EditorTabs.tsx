import type { EditorTab } from './types'
import { TEXT } from '../i18n'

type EditorTabsProps = {
  activeTab: EditorTab
  onChange: (tab: EditorTab) => void
}

export function EditorTabs({ activeTab, onChange }: EditorTabsProps) {
  return (
    <div className="tab-bar" role="tablist" aria-label={TEXT.editor.tabsAria}>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'poses'}
        className={`tab-button${activeTab === 'poses' ? ' is-active' : ''}`}
        onClick={() => onChange('poses')}
      >
        {TEXT.editor.tabs.poses}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'animations'}
        className={`tab-button${activeTab === 'animations' ? ' is-active' : ''}`}
        onClick={() => onChange('animations')}
      >
        {TEXT.editor.tabs.animations}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'grease'}
        className={`tab-button${activeTab === 'grease' ? ' is-active' : ''}`}
        onClick={() => onChange('grease')}
      >
        {TEXT.editor.tabs.grease}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'sounds'}
        className={`tab-button${activeTab === 'sounds' ? ' is-active' : ''}`}
        onClick={() => onChange('sounds')}
      >
        {TEXT.editor.tabs.sounds}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'points'}
        className={`tab-button${activeTab === 'points' ? ' is-active' : ''}`}
        onClick={() => onChange('points')}
      >
        {TEXT.editor.tabs.points}
      </button>
    </div>
  )
}
