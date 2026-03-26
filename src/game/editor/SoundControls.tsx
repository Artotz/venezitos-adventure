import { useEffect, useRef, useState } from 'react'

import { createPhase1SoundPlayer, PHASE1_SOUND_OPTIONS } from '../phase1/sounds'
import { createAnimationSoundPlayer, RETRO_SOUND_OPTIONS } from '../retro/sounds'

export function SoundControls() {
  const [volumePercent, setVolumePercent] = useState(30)
  const retroPlayerRef = useRef<ReturnType<typeof createAnimationSoundPlayer> | null>(null)
  const phase1PlayerRef = useRef<ReturnType<typeof createPhase1SoundPlayer> | null>(
    null,
  )

  const resetPlayers = () => {
    retroPlayerRef.current?.dispose()
    phase1PlayerRef.current?.dispose()
    retroPlayerRef.current = createAnimationSoundPlayer()
    phase1PlayerRef.current = createPhase1SoundPlayer()
  }

  useEffect(() => {
    resetPlayers()

    return () => {
      retroPlayerRef.current?.dispose()
      phase1PlayerRef.current?.dispose()
    }
  }, [])

  const volume = volumePercent / 100

  return (
    <div className="controls-group sound-controls">
      <div className="controls-header">
        <h2>Sons</h2>
        <button type="button" className="reset-button" onClick={resetPlayers}>
          Parar todos
        </button>
      </div>

      <label className="slider-control">
        <span className="slider-title">Volume global</span>
        <span className="slider-value">{volumePercent}%</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volumePercent}
          onChange={(event) => setVolumePercent(Number(event.currentTarget.value))}
        />
      </label>

      <div className="sound-section">
        <h3>Retro</h3>
        <div className="sound-list">
          {RETRO_SOUND_OPTIONS.map((sound) => (
            <div key={sound.id} className="sound-card">
              <div className="sound-card-copy">
                <strong>{sound.label}</strong>
                <span>{sound.id}</span>
              </div>
              <button
                type="button"
                className="reset-button"
                onClick={() => {
                  retroPlayerRef.current?.playSound(sound.id, volume)
                }}
              >
                Tocar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sound-section">
        <h3>Fase 1</h3>
        <div className="sound-list">
          {PHASE1_SOUND_OPTIONS.map((sound) => (
            <div key={sound.id} className="sound-card">
              <div className="sound-card-copy">
                <strong>{sound.label}</strong>
                <span>{sound.id}</span>
              </div>
              <button
                type="button"
                className="reset-button"
                onClick={() => {
                  phase1PlayerRef.current?.playSound(sound.id, volume)
                }}
              >
                Tocar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
