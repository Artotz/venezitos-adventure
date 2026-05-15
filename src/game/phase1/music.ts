import { useEffect, useRef } from "react";
import phase1MusicSrc from "../../assets/sfx/audiodollar-big-rock-production-rock-508503.mp3";

const PHASE1_MUSIC_VOLUME = 0.1;

export function usePhase1BackgroundMusic(active: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(phase1MusicSrc);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = PHASE1_MUSIC_VOLUME;
    audio.load();
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute("src");
      audio.load();

      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!active) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    if (!audio.paused) {
      return;
    }

    void audio.play().catch(() => {
      // Browsers can reject playback until a trusted interaction starts the phase.
    });
  }, [active]);
}
