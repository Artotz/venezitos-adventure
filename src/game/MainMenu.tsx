import { useEffect } from "react";
import heroPhase1Src from "../assets/hero-menu.jpg";
import heroPhase2Src from "../assets/hero2-menu.jpg";
import {
  isMenuConfirmCode,
  isMenuDownCode,
  isMenuLeftCode,
  isMenuRightCode,
  isMenuUpCode,
} from "./gamepadInput";
import { TEXT } from "./i18n";
import { PHASE1_MENU_DESCRIPTION, PHASE1_MENU_TITLE } from "./phase1/config";
import {
  PHASE2_MENU_ACTION_LABEL,
  PHASE2_MENU_DESCRIPTION,
  PHASE2_MENU_EYEBROW,
  PHASE2_MENU_TITLE,
} from "./phase2/config";

export type MainMenuPhase = "phase1" | "phase2";

export const MAIN_MENU_WIDTH = 1280;
export const MAIN_MENU_HEIGHT = 720;

const PHASES: Record<
  MainMenuPhase,
  {
    eyebrow: string;
    title: string;
    description: string;
    actionLabel: string;
    heroSrc: string;
  }
> = {
  phase1: {
    eyebrow: TEXT.mainMenu.phase1Eyebrow,
    title: PHASE1_MENU_TITLE,
    description: PHASE1_MENU_DESCRIPTION,
    actionLabel: TEXT.mainMenu.phase1Action,
    heroSrc: heroPhase1Src,
  },
  phase2: {
    eyebrow: PHASE2_MENU_EYEBROW,
    title: PHASE2_MENU_TITLE,
    description: PHASE2_MENU_DESCRIPTION,
    actionLabel: PHASE2_MENU_ACTION_LABEL,
    heroSrc: heroPhase2Src,
  },
};

type MainMenuProps = {
  selectedPhase: MainMenuPhase;
  onSelectPhase: (phase: MainMenuPhase) => void;
  onPlay: () => void;
};

export function MainMenu({
  selectedPhase,
  onSelectPhase,
  onPlay,
}: MainMenuProps) {
  const selected = PHASES[selectedPhase];
  const nextPhase = selectedPhase === "phase1" ? "phase2" : "phase1";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (
        isMenuLeftCode(event.code) ||
        isMenuRightCode(event.code) ||
        isMenuUpCode(event.code) ||
        isMenuDownCode(event.code)
      ) {
        event.preventDefault();
        onSelectPhase(nextPhase);
        return;
      }

      if (isMenuConfirmCode(event.code)) {
        event.preventDefault();
        onPlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextPhase, onPlay, onSelectPhase]);

  return (
    <section className={`phase-pre-game-card is-${selectedPhase}`}>
      <div className="phase-pre-game-content">
        <p className="phase-pre-game-eyebrow">{selected.eyebrow}</p>
        <h2>{selected.title}</h2>
        <p className="phase-pre-game-copy">{selected.description}</p>
        <div
          className="phase-menu-selector"
          aria-label={TEXT.mainMenu.phaseSelectorAria}
        >
          <button
            type="button"
            className={`phase-menu-dot${
              selectedPhase === "phase1" ? " is-active" : ""
            }`}
            aria-pressed={selectedPhase === "phase1"}
            onClick={() => onSelectPhase("phase1")}
          >
            {TEXT.common.phase1}
          </button>
          <button
            type="button"
            className={`phase-menu-dot${
              selectedPhase === "phase2" ? " is-active" : ""
            }`}
            aria-pressed={selectedPhase === "phase2"}
            onClick={() => onSelectPhase("phase2")}
          >
            {TEXT.common.phase2}
          </button>
        </div>
        <div className="phase-pre-game-actions">
          <button
            type="button"
            className="phase-primary-button"
            onClick={onPlay}
          >
            {selected.actionLabel}
          </button>
        </div>
      </div>

      <div className="phase-pre-game-hero" aria-hidden="true">
        <div className="phase-pre-game-hero-fade" />
        <img
          key={selectedPhase}
          src={selected.heroSrc}
          alt=""
          className="phase-pre-game-hero-image"
          draggable={false}
        />
      </div>
    </section>
  );
}
