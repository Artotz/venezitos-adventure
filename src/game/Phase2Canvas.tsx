import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { isGamepadPauseCode } from "./gamepadInput";
import { TEXT } from "./i18n";
import { MainMenu, MAIN_MENU_HEIGHT, MAIN_MENU_WIDTH } from "./MainMenu";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./phase2/config";
import { Phase2StageIntroCard } from "./phase2/Phase2StageIntroCard";
import { PauseMenu } from "./PauseMenu";
import { drawPhase2Scene } from "./phase2/render";
import { usePhase2TractorDrivingSound } from "./phase2/sounds";
import type { Phase2Stage } from "./phase2/types";
import { usePhase2Game } from "./phase2/usePhase2Game";
import { usePhase2TractorSprite } from "./phase2/usePhase2TractorSprite";

type Phase2CanvasProps = {
  onChangeView: (view: "phase1" | "phase2" | "editor") => void;
};

export function Phase2Canvas({ onChangeView }: Phase2CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [menuScale, setMenuScale] = useState(1);
  const [phaseStep, setPhaseStep] = useState<"menu" | "playing">("menu");
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
  const [stageIntro, setStageIntro] = useState<Phase2Stage | null>(null);
  const isPlaying = phaseStep === "playing";
  const game = usePhase2Game(isPlaying, isPauseMenuOpen || stageIntro !== null);
  const vehicleSprites = usePhase2TractorSprite();
  usePhase2TractorDrivingSound(isPlaying && !game.isComplete, game.stage);

  useEffect(() => {
    const updateCanvasScale = () => {
      const viewportPadding = window.innerWidth <= 900 ? 16 : 24;
      const availableWidth = Math.max(320, window.innerWidth - viewportPadding);
      const availableHeight = Math.max(
        260,
        window.innerHeight - viewportPadding,
      );
      const nextScale = Math.min(
        1,
        availableWidth / CANVAS_WIDTH,
        availableHeight / CANVAS_HEIGHT,
      );
      const nextMenuScale = Math.min(
        availableWidth / MAIN_MENU_WIDTH,
        availableHeight / MAIN_MENU_HEIGHT,
      );

      setCanvasScale(nextScale > 0 ? nextScale : 1);
      setMenuScale(nextMenuScale > 0 ? nextMenuScale : 1);
    };

    updateCanvasScale();
    window.addEventListener("resize", updateCanvasScale);

    return () => {
      window.removeEventListener("resize", updateCanvasScale);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!isPlaying || !canvas) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    drawPhase2Scene(context, game, vehicleSprites);
  }, [game, vehicleSprites]);

  useEffect(() => {
    if (!isPlaying) {
      setIsPauseMenuOpen(false);
      setStageIntro(null);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.code !== "Escape" && !isGamepadPauseCode(event.code)) ||
        event.repeat
      ) {
        return;
      }

      event.preventDefault();
      setIsPauseMenuOpen((current) => !current);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || game.isComplete) {
      setStageIntro(null);
      return;
    }

    setStageIntro(game.stage);

    const timeoutId = window.setTimeout(() => {
      setStageIntro((current) => (current === game.stage ? null : current));
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [game.isComplete, game.stage, isPlaying]);

  const scaledCanvasWidth = Math.round(CANVAS_WIDTH * canvasScale);
  const scaledCanvasHeight = Math.round(CANVAS_HEIGHT * canvasScale);
  const scaledMenuWidth = Math.round(MAIN_MENU_WIDTH * menuScale);
  const scaledMenuHeight = Math.round(MAIN_MENU_HEIGHT * menuScale);

  return (
    <div className="phase-layout">
      {isPlaying ? (
        <div className="phase-canvas-shell">
          <div
            className="phase-canvas-frame"
            style={
              {
                "--phase-canvas-width": `${scaledCanvasWidth}px`,
                "--phase-canvas-height": `${scaledCanvasHeight}px`,
              } as CSSProperties
            }
          >
            <canvas
              ref={canvasRef}
              className="phase-canvas"
              aria-label={TEXT.phase2.aria.canvas}
            />
          </div>
          {isPauseMenuOpen ? (
            <PauseMenu
              onResume={() => setIsPauseMenuOpen(false)}
              onOpenMainMenu={() => {
                setIsPauseMenuOpen(false);
                setPhaseStep("menu");
              }}
            />
          ) : null}
          {stageIntro && !isPauseMenuOpen ? (
            <Phase2StageIntroCard stage={stageIntro} />
          ) : null}
        </div>
      ) : (
        <div
          className="phase-canvas-frame"
          style={
            {
              "--phase-canvas-width": `${scaledMenuWidth}px`,
              "--phase-canvas-height": `${scaledMenuHeight}px`,
            } as CSSProperties
          }
        >
          <MainMenu
            selectedPhase="phase2"
            onSelectPhase={onChangeView}
            onPlay={() => setPhaseStep("playing")}
          />
        </div>
      )}
    </div>
  );
}

