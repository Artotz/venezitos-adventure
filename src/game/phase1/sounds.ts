import engineStartSoundSrc from '../../assets/sfx/engine-start.mp3'
import mudSoundSrc from '../../assets/sfx/mud.mp3'
import mistakeSoundSrc from '../../assets/sfx/mistake.mp3'
import successSoundSrc from '../../assets/sfx/success.mp3'
import { createSoundPlayer, type SoundOption, type SoundPlayback } from '../audio'
import { TEXT } from '../i18n'

export type Phase1SoundId = 'engine-start' | 'mud' | 'success' | 'failure'

export const PHASE1_SOUND_SOURCES: Record<Phase1SoundId, string> = {
  'engine-start': engineStartSoundSrc,
  mud: mudSoundSrc,
  success: successSoundSrc,
  failure: mistakeSoundSrc,
}

export const PHASE1_SOUND_OPTIONS: SoundOption<Phase1SoundId>[] = [
  { id: 'engine-start', label: TEXT.phase1.sounds.engineStart },
  { id: 'mud', label: TEXT.phase1.sounds.mud },
  { id: 'success', label: TEXT.phase1.sounds.success },
  { id: 'failure', label: TEXT.phase1.sounds.failure },
]

export type Phase1SoundPlayback = SoundPlayback

export type Phase1SoundPlayer = ReturnType<typeof createPhase1SoundPlayer>

export function createPhase1SoundPlayer() {
  return createSoundPlayer(PHASE1_SOUND_SOURCES)
}
