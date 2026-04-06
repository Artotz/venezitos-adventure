import dirtSoundSrc from "../../assets/sfx/dirt.mp3";
import dirtSoundAltSrc from "../../assets/sfx/dirt-2.mp3";
import unloadSoundSrc from "../../assets/sfx/unload.mp3";
import { createSoundPlayer, type SoundOption } from "../audio";
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
    animationSound: [{ at: 1600 + 1500, soundId: "dirt-2", volume: 0.3 }],
  },
  {
    id: "arm-unload",
    animationSound: [{ at: 1900, soundId: "unload", volume: 0.3 }],
  },
];

export const RETRO_SOUND_SOURCES: Record<AnimationSoundId, string> = {
  dirt: dirtSoundSrc,
  "dirt-2": dirtSoundAltSrc,
  unload: unloadSoundSrc,
};

export const RETRO_SOUND_OPTIONS: SoundOption<AnimationSoundId>[] = [
  { id: "dirt", label: "Terra 1" },
  { id: "dirt-2", label: "Terra 2" },
  { id: "unload", label: "Descarga" },
];

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
  return createSoundPlayer(RETRO_SOUND_SOURCES);
}
