import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { buildPhase1Pose } from "./retro/animations";
import {
  computeWorldMatrices,
  createTranslationMatrix,
} from "./retro/geometry";
import { createLayerImageMap, drawExcavator } from "./retro/render";
import {
  PHASE1_CONTINUE_CODES,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_Y,
  PLAYER_HIT_LINE_X,
  PLAYER_SCREEN_X,
} from "./phase1/config";
import { PHASE1_MANIFESTO_MODAL } from "./phase1/dialogue";
import { Phase1PreGameScreen } from "./phase1/Phase1PreGameScreen";
import {
  drawCenterGuide,
  drawPhase1Backdrop,
  drawPhase1Environment,
  drawPhase1Foreground,
  drawPhase1Hud,
  drawPhase1StartModal,
  drawPhase1SpeechModal,
  drawQuestionModal,
} from "./phase1/render";
import { usePhase1InstructorImage } from "./phase1/usePhase1InstructorImage";
import { usePhase1Game } from "./phase1/usePhase1Game";

const START_MODAL_CONTINUE_KEYS = new Set<string>(PHASE1_CONTINUE_CODES);

type Phase1CanvasProps = {
  activeView: "phase1" | "editor";
  onChangeView: (view: "phase1" | "editor") => void;
};

export function Phase1Canvas({
  activeView: _activeView,
  onChangeView,
}: Phase1CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [phaseStep, setPhaseStep] = useState<"menu" | "playing">("menu");
  const [overlayStep, setOverlayStep] = useState<"manifesto" | "controls" | null>(
    null,
  );
  const isPlaying = phaseStep === "playing";
  const game = usePhase1Game(isPlaying && overlayStep === null);
  const instructorImage = usePhase1InstructorImage();

  const pose = buildPhase1Pose({
    distance: game.distance,
    loadedDirt: game.loadedDirt,
    rearLoaded: game.rearLoaded,
    frontAnimation: game.frontAnimationRef.current,
    rearAnimation: game.rearAnimationRef.current,
  });

  const images = useMemo(
    () =>
      game.sprites ? createLayerImageMap(game.sprites, pose.sprites) : null,
    [game.sprites, pose.sprites],
  );

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
    if (!overlayStep) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!START_MODAL_CONTINUE_KEYS.has(event.code)) {
        return;
      }

      event.preventDefault();
      setOverlayStep((current) =>
        current === "manifesto" ? "controls" : null,
      );
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [overlayStep]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !game.excavatorScene || !images) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const machineY = GROUND_Y - game.excavatorScene.contentHeight + 60;
    const worldMatrices = computeWorldMatrices(
      pose.angles,
      createTranslationMatrix(
        PLAYER_SCREEN_X - game.excavatorScene.contentWidth / 2,
        machineY,
      ),
    );

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPhase1Backdrop(context);
    drawPhase1Environment({
      context,
      distance: game.distance,
      events: game.events,
      activeEventId: game.activeEventId,
      loadedDirt: game.loadedDirt,
      rearLoaded: game.rearLoaded,
    });
    drawExcavator(context, images, worldMatrices);
    drawPhase1Foreground(context, game.distance);
    drawCenterGuide(
      context,
      PLAYER_HIT_LINE_X,
      machineY + 70,
      machineY + game.excavatorScene.contentHeight - 20,
      game.activeEventId !== null,
    );
    drawPhase1Hud({
      context,
      score: game.score,
      distance: game.distance,
      differentialLockEnabled: game.differentialLockEnabled,
    });
    if (overlayStep === "manifesto") {
      drawPhase1SpeechModal(context, PHASE1_MANIFESTO_MODAL, instructorImage);
    } else if (overlayStep === "controls") {
      drawPhase1StartModal({
        context,
        instructorImage,
        images,
        machineAngles: pose.angles,
        machineContentHeight: game.excavatorScene.contentHeight,
        machineContentWidth: game.excavatorScene.contentWidth,
      });
    } else if (game.speechModal) {
      drawPhase1SpeechModal(context, game.speechModal, instructorImage);
    } else if (game.questionModal) {
      drawQuestionModal(context, game.questionModal, instructorImage);
    }
  }, [
    game.activeEventId,
    game.distance,
    game.differentialLockEnabled,
    game.events,
    game.excavatorScene,
    game.loadedDirt,
    game.rearLoaded,
    game.animationTick,
    game.questionModal,
    game.score,
    images,
    instructorImage,
    pose.angles,
    game.speechModal,
    overlayStep,
  ]);

  if (isPlaying && (!game.excavatorScene || !images)) {
    return <p className="canvas-status">Carregando fase 1...</p>;
  }

  const scaledCanvasWidth = Math.round(CANVAS_WIDTH * canvasScale);
  const scaledCanvasHeight = Math.round(CANVAS_HEIGHT * canvasScale);

  return (
    <div className="phase-layout">
      {isPlaying ? (
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
            aria-label="Fase 1 com a retroescavadeira andando infinitamente para a esquerda"
          />
        </div>
      ) : (
        <div
          className="phase-canvas-frame"
          style={
            {
              "--phase-canvas-width": `${scaledCanvasWidth}px`,
              "--phase-canvas-height": `${scaledCanvasHeight}px`,
            } as CSSProperties
          }
        >
          <Phase1PreGameScreen
            onPlay={() => {
              setPhaseStep("playing");
              setOverlayStep("manifesto");
            }}
            onOpenEditor={() => onChangeView("editor")}
          />
        </div>
      )}
    </div>
  );
}
