import { useEffect, useMemo, useRef, type MouseEvent } from "react";

import {
  applyToPoint,
  computeWorldMatrices,
  createScaleMatrix,
  createTranslationMatrix,
  multiplyMatrices,
} from "./retro/geometry";
import {
  createLayerImageMap,
  drawExcavator,
  measureBaseExcavator,
} from "./retro/render";
import { useRetroSprites } from "./retro/sprites";
import { CANVAS_HEIGHT, CANVAS_WIDTH, GROUND_Y } from "./phase1/config";
import { EditorTabs } from "./editor/EditorTabs";
import {
  drawPhase1Backdrop,
  drawPhase1Environment,
  drawPhase1Foreground,
} from "./phase1/render";
import { usePhase1CarnaubaImage } from "./phase1/usePhase1CarnaubaImage";
import { usePhase1ForegroundImage } from "./phase1/usePhase1ForegroundImage";
import { usePhase1GroundImage } from "./phase1/usePhase1GroundImage";
import { usePhase1PickupUnloadTruckImage } from "./phase1/usePhase1PickupUnloadTruckImage";
import { drawGreaseAnimation } from "./venezito/render";
import { useVenezitoGreaseImage } from "./venezito/useVenezitoGreaseImage";
import { ModeTabs } from "./ModeTabs";
import { RetroEditorSidebar } from "./editor/RetroEditorSidebar";
import { useRetroEditor } from "./editor/useRetroEditor";

const EDITOR_CANVAS_WIDTH = CANVAS_WIDTH;
const EDITOR_CANVAS_HEIGHT = CANVAS_HEIGHT;
const EDITOR_MACHINE_SCALE = 1.3;

type GameCanvasProps = {
  activeView: "phase1" | "editor";
  onChangeView: (view: "phase1" | "editor") => void;
};

export function GameCanvas({ activeView, onChangeView }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sprites = useRetroSprites();
  const editor = useRetroEditor();
  const carnaubaImage = usePhase1CarnaubaImage();
  const foregroundImage = usePhase1ForegroundImage();
  const groundImage = usePhase1GroundImage();
  const pickupUnloadTruckImage = usePhase1PickupUnloadTruckImage();
  const greaseImage = useVenezitoGreaseImage();

  const excavatorScene = useMemo(
    () => (sprites ? measureBaseExcavator(sprites) : null),
    [sprites],
  );

  const images = useMemo(
    () =>
      sprites ? createLayerImageMap(sprites, editor.displayPose.sprites) : null,
    [editor.displayPose.sprites, sprites],
  );

  const machineRootMatrix = useMemo(() => {
    if (!excavatorScene) {
      return null;
    }

    const scaledMachineWidth =
      excavatorScene.contentWidth * EDITOR_MACHINE_SCALE;
    const scaledMachineHeight =
      excavatorScene.contentHeight * EDITOR_MACHINE_SCALE;
    const machineY = GROUND_Y - scaledMachineHeight + 120;

    return multiplyMatrices(
      createTranslationMatrix(
        EDITOR_CANVAS_WIDTH / 2 - scaledMachineWidth / 2,
        machineY,
      ),
      createScaleMatrix(EDITOR_MACHINE_SCALE, EDITOR_MACHINE_SCALE),
    );
  }, [excavatorScene]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !images || !excavatorScene || !machineRootMatrix) {
      return;
    }

    canvas.width = EDITOR_CANVAS_WIDTH;
    canvas.height = EDITOR_CANVAS_HEIGHT;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const worldMatrices = computeWorldMatrices(
      editor.displayPose.angles,
      machineRootMatrix,
    );

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPhase1Backdrop(context);
    drawPhase1Environment({
      context,
      distance: 0,
      events: [],
      activeEventId: null,
      loadedDirt: false,
      rearLoaded: false,
      carnaubaImage,
      groundImage,
    });
    drawExcavator(context, images, worldMatrices);
    if (editor.activeTab === "grease") {
      drawGreaseAnimation({
        context,
        elapsed: editor.greaseCurrentTime,
        greaseImage,
        machineRootMatrix,
        config: editor.greaseConfig,
        pointProjector: applyToPoint,
        showPivot: true,
      });
    }
    drawPhase1Foreground({
      context,
      distance: 0,
      events: [],
      activeEventId: null,
      loadedDirt: false,
      rearLoaded: false,
      foregroundImage,
      pickupUnloadTruckImage,
    });

    if (editor.points.length > 0) {
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.textBaseline = "bottom";
      context.font = '14px Consolas, "Courier New", monospace';

      editor.points.forEach((point, index) => {
        const canvasPoint = applyToPoint(machineRootMatrix, point);

        context.strokeStyle = "#0b0b0b";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(canvasPoint.x - 8, canvasPoint.y);
        context.lineTo(canvasPoint.x + 8, canvasPoint.y);
        context.moveTo(canvasPoint.x, canvasPoint.y - 8);
        context.lineTo(canvasPoint.x, canvasPoint.y + 8);
        context.stroke();

        context.strokeStyle = "#f0cb75";
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(canvasPoint.x - 8, canvasPoint.y);
        context.lineTo(canvasPoint.x + 8, canvasPoint.y);
        context.moveTo(canvasPoint.x, canvasPoint.y - 8);
        context.lineTo(canvasPoint.x, canvasPoint.y + 8);
        context.stroke();

        const label = `P${index + 1} (${point.x}, ${point.y})`;
        context.fillStyle = "rgba(11, 11, 11, 0.82)";
        const textWidth = context.measureText(label).width;
        context.fillRect(canvasPoint.x + 10, canvasPoint.y - 22, textWidth + 10, 18);
        context.fillStyle = "#f4f1e8";
        context.fillText(label, canvasPoint.x + 15, canvasPoint.y - 8);
      });

      context.restore();
    }
  }, [
    carnaubaImage,
    editor.displayPose,
    editor.activeTab,
    editor.greaseConfig,
    editor.greaseCurrentTime,
    editor.points,
    excavatorScene,
    foregroundImage,
    greaseImage,
    groundImage,
    images,
    machineRootMatrix,
    pickupUnloadTruckImage,
  ]);

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (editor.activeTab !== "points" || !machineRootMatrix) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;

    editor.addPoint({
      x: (canvasX - machineRootMatrix.e) / machineRootMatrix.a,
      y: (canvasY - machineRootMatrix.f) / machineRootMatrix.d,
    });
  };

  if (!excavatorScene || !images) {
    return <p className="canvas-status">Carregando camadas retro...</p>;
  }

  return (
    <>
      <div className="stage-toolbar">
        <ModeTabs activeView={activeView} onChange={onChangeView} />
        <EditorTabs
          activeTab={editor.activeTab}
          onChange={editor.setActiveTab}
        />
      </div>

      <div className="assembly-layout">
        <RetroEditorSidebar editor={editor} />

        <div className="canvas-scroll">
          <canvas
            ref={canvasRef}
            className="game-canvas"
            aria-label="Editor da retroescavadeira usando as mesmas poses e animacoes da fase 1"
            onClick={handleCanvasClick}
          />
        </div>
      </div>
    </>
  );
}
