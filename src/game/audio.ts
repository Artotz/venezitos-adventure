export type SoundPlayback = {
  done: Promise<void>
}

export type SoundOption<SoundId extends string> = {
  id: SoundId
  label: string
}

export function createSoundPlayer<SoundId extends string>(
  soundSources: Record<SoundId, string>,
) {
  const idlePool = Object.fromEntries(
    (Object.keys(soundSources) as SoundId[]).map((soundId) => {
      const src = soundSources[soundId]
      const audio = new Audio(src)
      audio.preload = 'auto'
      audio.load()
      return [soundId, audio]
    }),
  ) as Record<SoundId, HTMLAudioElement>
  const activeInstances = new Set<HTMLAudioElement>()

  const cleanupInstance = (audio: HTMLAudioElement) => {
    audio.pause()
    audio.currentTime = 0
    activeInstances.delete(audio)
  }

  return {
    playSound(soundId: SoundId, volume: number): SoundPlayback | null {
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
      for (const soundId of Object.keys(idlePool) as SoundId[]) {
        const audio = idlePool[soundId]
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
      activeInstances.clear()
    },
  }
}
