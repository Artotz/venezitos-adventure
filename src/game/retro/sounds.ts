import dirtSoundSrc from "../../assets/sfx/dirt.mp3";
import dirtSoundAltSrc from "../../assets/sfx/dirt-2.mp3";
import unloadSoundSrc from "../../assets/sfx/unload.mp3";
import type {
  AnimationPresetId,
  AnimationSoundId,
  AnimationSoundPreset,
} from "./types";

export const ANIMATION_SOUND_PRESETS: AnimationSoundPreset[] = [
  {
    id: "idle",
    animationSound: [{ at: 300, soundId: "dirt", volume: 0.3 }],
  },
  {
    id: "idle2",
    animationSound: [{ at: 1800, soundId: "unload", volume: 0.3 }],
  },
  {
    id: "arm-extended",
    animationSound: [{ at: 1600, soundId: "dirt-2", volume: 0.3 }],
  },
  {
    id: "arm-unload",
    animationSound: [{ at: 1900, soundId: "unload", volume: 0.3 }],
  },
];

const SOUND_SOURCES: Record<AnimationSoundId, string> = {
  dirt: dirtSoundSrc,
  "dirt-2": dirtSoundAltSrc,
  unload: unloadSoundSrc,
};

export function getAnimationSoundPreset(presetId: AnimationPresetId) {
  return (
    ANIMATION_SOUND_PRESETS.find((preset) => preset.id === presetId) ?? null
  );
}

export function getAnimationSoundCuesAtTime(
  presetId: AnimationPresetId,
  currentTime: number,
) {
  return (
    getAnimationSoundPreset(presetId)?.animationSound.filter(
      (cue) => cue.at === currentTime,
    ) ?? []
  );
}

export function getAnimationSoundCuesInRange(
  presetId: AnimationPresetId,
  previousTime: number,
  currentTime: number,
) {
  const soundPreset = getAnimationSoundPreset(presetId);

  if (!soundPreset) {
    return [];
  }

  const start = Math.min(previousTime, currentTime);
  const end = Math.max(previousTime, currentTime);

  return soundPreset.animationSound.filter(
    (cue) => cue.at > start && cue.at <= end,
  );
}

export type AnimationSoundPlayer = ReturnType<
  typeof createAnimationSoundPlayer
>;

export function createAnimationSoundPlayer() {
  const idlePool = Object.fromEntries(
    Object.entries(SOUND_SOURCES).map(([soundId, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.load();
      return [soundId, audio];
    }),
  ) as Record<AnimationSoundId, HTMLAudioElement>;
  const activeInstances = new Set<HTMLAudioElement>();

  const cleanupInstance = (audio: HTMLAudioElement) => {
    audio.pause();
    audio.currentTime = 0;
    activeInstances.delete(audio);
  };

  return {
    playSound(soundId: AnimationSoundId, volume: number) {
      const seedAudio = idlePool[soundId];

      if (!seedAudio) {
        return;
      }

      const nextAudio = seedAudio.cloneNode(true) as HTMLAudioElement;
      nextAudio.volume = Math.max(0, Math.min(volume, 1));
      activeInstances.add(nextAudio);

      const handleFinish = () => {
        nextAudio.removeEventListener("ended", handleFinish);
        nextAudio.removeEventListener("error", handleFinish);
        cleanupInstance(nextAudio);
      };

      nextAudio.addEventListener("ended", handleFinish);
      nextAudio.addEventListener("error", handleFinish);

      void nextAudio.play().catch(() => {
        handleFinish();
      });
    },
    dispose() {
      activeInstances.forEach((audio) => cleanupInstance(audio));
      Object.values(idlePool).forEach((audio) => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });
      activeInstances.clear();
    },
  };
}
