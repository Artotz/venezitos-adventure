import { useEffect, useRef, type MutableRefObject } from "react";
import tractorDrivingSoundSrc from "../../assets/sfx/phase2-tractor-driving.mp3";

const PHASE2_TRACTOR_VOLUME = 0.28;
const LOOP_RESTART_BEFORE_END_SECONDS = 0.12;
const LOOP_RESTART_AT_SECONDS = 0.03;
const LOOP_WATCH_INTERVAL_MS = 80;

export function usePhase2TractorDrivingSound(
  active: boolean,
  restartKey: string,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopWatcherRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = new Audio(tractorDrivingSoundSrc);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = PHASE2_TRACTOR_VOLUME;
    audio.load();
    audioRef.current = audio;

    const handleEnded = () => {
      restartLoop(audio);
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      stopLoopWatcher(loopWatcherRef);
      audio.removeEventListener("ended", handleEnded);
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
      stopLoopWatcher(loopWatcherRef);
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    restartAudio(audio);

    stopLoopWatcher(loopWatcherRef);
    loopWatcherRef.current = window.setInterval(() => {
      if (audio.paused) {
        return;
      }

      const remaining = audio.duration - audio.currentTime;

      if (
        Number.isFinite(remaining) &&
        remaining <= LOOP_RESTART_BEFORE_END_SECONDS
      ) {
        restartLoop(audio);
      }
    }, LOOP_WATCH_INTERVAL_MS);

    return () => {
      stopLoopWatcher(loopWatcherRef);
    };
  }, [active, restartKey]);
}

function restartLoop(audio: HTMLAudioElement) {
  audio.currentTime = LOOP_RESTART_AT_SECONDS;

  if (audio.paused) {
    void audio.play().catch(() => {
      // Keep gameplay unaffected if the browser refuses a replay attempt.
    });
  }
}

function restartAudio(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // Browsers can still reject playback when the phase was not started by a user gesture.
  });
}

function stopLoopWatcher(loopWatcherRef: MutableRefObject<number | null>) {
  if (loopWatcherRef.current === null) {
    return;
  }

  window.clearInterval(loopWatcherRef.current);
  loopWatcherRef.current = null;
}
