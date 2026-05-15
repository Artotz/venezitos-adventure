import { useCallback, useEffect } from "react";
import menuMusicSrc from "../assets/sfx/menu-music.mp3";

const MENU_MUSIC_VOLUME = 0.2;
const MENU_MUSIC_STOP_DELAY_MS = 180;

let menuMusicAudio: HTMLAudioElement | null = null;
let stopTimeoutId: number | null = null;

function getMenuMusicAudio() {
  if (!menuMusicAudio) {
    menuMusicAudio = new Audio(menuMusicSrc);
    menuMusicAudio.loop = true;
    menuMusicAudio.preload = "auto";
    menuMusicAudio.volume = MENU_MUSIC_VOLUME;
    menuMusicAudio.load();
  }

  return menuMusicAudio;
}

function cancelScheduledStop() {
  if (stopTimeoutId === null) {
    return;
  }

  window.clearTimeout(stopTimeoutId);
  stopTimeoutId = null;
}

export function useMainMenuMusic() {
  useEffect(() => {
    cancelScheduledStop();
    getMenuMusicAudio();

    return () => {
      scheduleMenuMusicStop();
    };
  }, []);

  return useCallback(() => {
    cancelScheduledStop();

    const audio = getMenuMusicAudio();

    if (!audio.paused) {
      return;
    }

    void audio.play().catch(() => {
      // Browsers can reject playback until a trusted user interaction.
    });
  }, []);
}

function scheduleMenuMusicStop() {
  cancelScheduledStop();

  stopTimeoutId = window.setTimeout(() => {
    if (!menuMusicAudio) {
      return;
    }

    menuMusicAudio.pause();
    menuMusicAudio.currentTime = 0;
    stopTimeoutId = null;
  }, MENU_MUSIC_STOP_DELAY_MS);
}
