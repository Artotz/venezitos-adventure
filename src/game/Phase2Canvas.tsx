import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./phase2/config";
import { drawPhase2Scene } from "./phase2/render";
import { usePhase2Game } from "./phase2/usePhase2Game";

type Phase2CanvasProps = {
  onChangeView: (view: "phase1" | "phase2" | "editor") => void;
};

export function Phase2Canvas({ onChangeView }: Phase2CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const game = usePhase2Game(true);

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

    drawPhase2Scene(context, game);
  }, [game]);

  const scaledCanvasWidth = Math.round(CANVAS_WIDTH * canvasScale);
  const scaledCanvasHeight = Math.round(CANVAS_HEIGHT * canvasScale);

  return (
    <div className="phase-layout">
      <div className="phase-canvas-shell">
        <div className="phase-overlay-actions">
          <button
            type="button"
            className="phase-secondary-button"
            onClick={() => onChangeView("phase1")}
          >
            Menu principal
          </button>
          <button
            type="button"
            className="phase-secondary-button"
            onClick={() => onChangeView("editor")}
          >
            Editor
          </button>
        </div>

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
            aria-label="Fase 2 com um trator em visao de cima desviando de pedras"
          />
        </div>
      </div>
    </div>
  );
}
