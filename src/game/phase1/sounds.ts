import engineStartSoundSrc from '../../assets/sfx/engine-start.mp3'
import mudSoundSrc from '../../assets/sfx/mud.mp3'
import mistakeSoundSrc from '../../assets/sfx/mistake.mp3'
import successSoundSrc from '../../assets/sfx/success.mp3'

export type Phase1SoundId = 'engine-start' | 'mud' | 'success' | 'failure'

const SOUND_SOURCES: Record<Phase1SoundId, string> = {
  'engine-start': engineStartSoundSrc,
  mud: mudSoundSrc,
  success: successSoundSrc,
  failure: mistakeSoundSrc,
}

export type Phase1SoundPlayback = {
  done: Promise<void>
}

export type Phase1SoundPlayer = ReturnType<typeof createPhase1SoundPlayer>

export function createPhase1SoundPlayer() {
  const idlePool = Object.fromEntries(
    Object.entries(SOUND_SOURCES).map(([soundId, src]) => {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audio.load()
      return [soundId, audio]
    }),
  ) as Record<Phase1SoundId, HTMLAudioElement>
  const activeInstances = new Set<HTMLAudioElement>()

  const cleanupInstance = (audio: HTMLAudioElement) => {
    audio.pause()
    audio.currentTime = 0
    activeInstances.delete(audio)
  }

  return {
    playSound(soundId: Phase1SoundId, volume: number): Phase1SoundPlayback | null {
      const seedAudio = idlePool[soundId]

      if (!seedAudio) {
        return null
      }

      const nextAudio = seedAudio.cloneNode(true) as HTMLAudioElement
      nextAudio.volume = Math.max(0, Math.min(volume, 1))
      activeInstances.add(nextAudio)

      let resolveDone = () => {}
      const done = new Promise<void>((resolve) => {
        resolveDone = resolve
      })

      const handleFinish = () => {
        nextAudio.removeEventListener('ended', handleFinish)
        nextAudio.removeEventListener('error', handleFinish)
        cleanupInstance(nextAudio)
        resolveDone()
      }

      nextAudio.addEventListener('ended', handleFinish)
      nextAudio.addEventListener('error', handleFinish)

      void nextAudio.play().catch(() => {
        handleFinish()
      })

      return { done }
    },
    dispose() {
      activeInstances.forEach((audio) => cleanupInstance(audio))
      Object.values(idlePool).forEach((audio) => {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      })
      activeInstances.clear()
    },
  }
}
