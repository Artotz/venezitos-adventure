import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./phase2/config";
import { Phase2PreGameScreen } from "./phase2/Phase2PreGameScreen";
import { PauseMenu } from "./PauseMenu";
import { drawPhase2Scene } from "./phase2/render";
import { usePhase2Game } from "./phase2/usePhase2Game";
import { usePhase2TractorSprite } from "./phase2/usePhase2TractorSprite";

type Phase2CanvasProps = {
  onChangeView: (view: "phase1" | "phase2" | "editor") => void;
};

export function Phase2Canvas({ onChangeView }: Phase2CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const game = usePhase2Game(gameStarted, isPauseMenuOpen);
  const tractorSprite = usePhase2TractorSprite();

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

      setCanvasScale(nextScale > 0 ? nextScale : 1);
    };

    updateCanvasScale();
    window.addEventListener("resize", updateCanvasScale);

    return () => {
      window.removeEventListener("resize", updateCanvasScale);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    drawPhase2Scene(context, game, tractorSprite);
  }, [game, tractorSprite]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Escape" || event.repeat) {
        return;
      }

      event.preventDefault();
      setIsPauseMenuOpen((current) => !current);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (gameStarted) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Enter" || event.repeat) {
        return;
      }

      event.preventDefault();
      setGameStarted(true);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted]);

  const scaledCanvasWidth = Math.round(CANVAS_WIDTH * canvasScale);
  const scaledCanvasHeight = Math.round(CANVAS_HEIGHT * canvasScale);

  return (
    <div className="phase-layout">
      {!gameStarted ? (
        <Phase2PreGameScreen
          onPlay={() => setGameStarted(true)}
          onOpenMainMenu={() => onChangeView("phase1")}
        />
      ) : (
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
              aria-label="Fase 2 com um trator em visao de cima cortando grama"
            />
          </div>
          {isPauseMenuOpen ? (
            <PauseMenu
              onResume={() => setIsPauseMenuOpen(false)}
              onOpenMainMenu={() => {
                setIsPauseMenuOpen(false);
                onChangeView("phase1");
              }}
              onOpenEditor={() => {
                setIsPauseMenuOpen(false);
                onChangeView("editor");
              }}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

