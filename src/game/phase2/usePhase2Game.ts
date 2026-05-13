import { useEffect, useRef, useState } from "react";
import { isMenuConfirmCode } from "../gamepadInput";
import { InputManager } from "../input";
import { useGameLoop } from "../useGameLoop";
import {
  CELL_SIZE,
  CONFIRM_PLANTING_MESSAGE,
  FIELD_COLUMNS,
  FIELD_HEIGHT,
  FIELD_LEFT,
  FIELD_ROWS,
  FIELD_TOP,
  FIELD_WIDTH,
  INITIAL_MESSAGE,
  PLANTING_COMPLETE_MESSAGE,
  PLANTING_MESSAGE,
  PLOW_HITBOX_HEIGHT,
  PLOW_HITBOX_WIDTH,
  PLOW_HEIGHT,
  PLOW_FOLLOW_RESPONSE,
  PLOW_MAX_ARTICULATION,
  PLOW_TONGUE_LENGTH,
  PLOW_TURN_SWING,
  READY_TO_PLANT_MESSAGE,
  RESTART_DISTANCE,
  TRACTOR_HEIGHT,
  TRACTOR_HITBOX_HEIGHT,
  TRACTOR_HITBOX_WIDTH,
  TRACTOR_SPEED,
  TRACTOR_START_X,
  TRACTOR_START_Y,
  TRACTOR_TURN_RESPONSE,
  TRACTOR_WIDTH,
} from "./config";
import type { Phase2Cell, Phase2GameSnapshot, Phase2Stage } from "./types";

const MOVEMENT_KEY_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
]);

function createInitialCells(): Phase2Cell[] {
  return Array.from({ length: FIELD_COLUMNS * FIELD_ROWS }, (_, index) => ({
    id: index,
    column: index % FIELD_COLUMNS,
    row: Math.floor(index / FIELD_COLUMNS),
    cut: false,
    planted: false,
  }));
}

function createInitialSnapshot(): Phase2GameSnapshot {
  const cells = createInitialCells();

  return {
    stage: "plowing",
    awaitingPlantConfirmation: false,
    score: 0,
    cutCells: 0,
    plantedCells: 0,
    totalCells: cells.length,
    progress: 0,
    elapsedTime: 0,
    message: INITIAL_MESSAGE,
    isComplete: false,
    tractor: {
      x: TRACTOR_START_X,
      y: TRACTOR_START_Y,
      width: TRACTOR_WIDTH,
      height: TRACTOR_HEIGHT,
      angle: 0,
      moving: false,
    },
    plow: {
      x: TRACTOR_START_X,
      y: TRACTOR_START_Y + getPlowCenterOffset(),
      angle: 0,
    },
    cells,
  };
}

export function usePhase2Game(enabled = true, paused = false) {
  const inputRef = useRef<InputManager | null>(null);
  const [snapshot, setSnapshot] = useState(createInitialSnapshot);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const input = new InputManager();
    input.attach();
    inputRef.current = input;

    const preventPageScroll = (event: KeyboardEvent) => {
      if (MOVEMENT_KEY_CODES.has(event.code)) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", preventPageScroll);

    const handlePlantingConfirmation = (event: KeyboardEvent) => {
      if ((event.code !== "Space" && !isMenuConfirmCode(event.code)) || event.repeat) {
        return;
      }

      setSnapshot((current) => {
        if (!current.awaitingPlantConfirmation) {
          return current;
        }

        event.preventDefault();

        return {
          ...current,
          stage: "planting",
          awaitingPlantConfirmation: false,
          plantedCells: 0,
          progress: 0,
          message: PLANTING_MESSAGE,
          isComplete: false,
          cells: current.cells.map((cell) => ({
            ...cell,
            cut: true,
            planted: false,
          })),
        };
      });
    };

    window.addEventListener("keydown", handlePlantingConfirmation);

    return () => {
      window.removeEventListener("keydown", preventPageScroll);
      window.removeEventListener("keydown", handlePlantingConfirmation);
      input.detach();
      if (inputRef.current === input) {
        inputRef.current = null;
      }
    };
  }, [enabled]);

  useGameLoop(
    (dt) => {
      if (!enabled || paused) {
        return;
      }

      const movement = inputRef.current?.getMovementVector() ?? { x: 0, y: 0 };

      setSnapshot((current) => {
        if (current.awaitingPlantConfirmation) {
          return current;
        }

        const steering = movement.x;
        const throttle = -movement.y;
        const isMoving = throttle !== 0;
        const turnDirection = isMoving ? steering * Math.sign(throttle) : 0;
        const nextAngle =
          current.tractor.angle + turnDirection * TRACTOR_TURN_RESPONSE * dt;
        const forwardX = Math.sin(nextAngle);
        const forwardY = -Math.cos(nextAngle);
        const halfWidth = TRACTOR_HITBOX_WIDTH / 2;
        const halfHeight = TRACTOR_HITBOX_HEIGHT / 2;
        const targetPlowAngle =
          isMoving
            ? nextAngle - turnDirection * PLOW_TURN_SWING
            : current.plow.angle;
        const nextPlowAngle = approachAngle(
          current.plow.angle,
          targetPlowAngle,
          PLOW_FOLLOW_RESPONSE * dt,
        );
        const constrainedPlowAngle = constrainPlowAngle(
          nextPlowAngle,
          nextAngle,
        );

        const nextX = clamp(
          nextXFromMotion(),
          FIELD_LEFT + halfWidth,
          FIELD_LEFT + FIELD_WIDTH - halfWidth,
        );
        const nextY = clamp(
          nextYFromMotion(),
          FIELD_TOP + halfHeight,
          FIELD_TOP + FIELD_HEIGHT - halfHeight,
        );
        const nextPlow = getPlowPosition(nextX, nextY, nextAngle, constrainedPlowAngle);

        const shouldAskPlantingConfirmation =
          current.stage === "plowing" &&
          current.isComplete &&
          isTractorAtStart(nextX, nextY);
        let newlyChanged = 0;
        const nextCells = current.cells.map((cell) => {
          if (
            (current.stage === "plowing" ? cell.cut : cell.planted) ||
            !doesPlowCoverCell(nextPlow.x, nextPlow.y, constrainedPlowAngle, cell)
          ) {
            return cell;
          }

          newlyChanged += 1;
          return current.stage === "plowing"
            ? { ...cell, cut: true }
            : { ...cell, planted: true };
        });

        const nextStage = current.stage;
        const nextCutCells =
          current.stage === "plowing"
            ? current.cutCells + newlyChanged
            : current.cutCells;
        const nextPlantedCells =
          current.stage === "planting"
            ? current.plantedCells + newlyChanged
            : current.plantedCells;
        const progress =
          nextStage === "planting"
            ? nextPlantedCells / current.totalCells
            : nextCutCells / current.totalCells;
        const isComplete =
          nextStage === "planting"
            ? nextPlantedCells === current.totalCells
            : nextCutCells === current.totalCells;

        return {
          ...current,
          stage: nextStage,
          awaitingPlantConfirmation: shouldAskPlantingConfirmation,
          score: current.score + newlyChanged * 10,
          cutCells: nextCutCells,
          plantedCells: nextPlantedCells,
          progress,
          elapsedTime: current.elapsedTime + dt,
          message: getNextMessage({
            isComplete,
            newlyChanged,
            progress,
            shouldAskPlantingConfirmation,
            stage: nextStage,
          }),
          isComplete,
          tractor: {
            ...current.tractor,
            x: nextX,
            y: nextY,
            angle: nextAngle,
            moving: isMoving,
          },
          plow: {
            x: nextPlow.x,
            y: nextPlow.y,
            angle: constrainedPlowAngle,
          },
          cells: nextCells,
        };

        function nextXFromMotion() {
          return current.tractor.x + forwardX * throttle * TRACTOR_SPEED * dt;
        }

        function nextYFromMotion() {
          return current.tractor.y + forwardY * throttle * TRACTOR_SPEED * dt;
        }
      });
    },
    enabled && !paused,
  );

  return snapshot;
}

function doesPlowCoverCell(
  plowX: number,
  plowY: number,
  plowAngle: number,
  cell: Phase2Cell,
) {
  const cellLeft = FIELD_LEFT + cell.column * CELL_SIZE;
  const cellTop = FIELD_TOP + cell.row * CELL_SIZE;
  const cellRight = cellLeft + CELL_SIZE;
  const cellBottom = cellTop + CELL_SIZE;
  const cos = Math.cos(plowAngle);
  const sin = Math.sin(plowAngle);
  const plowLeft = -PLOW_HITBOX_WIDTH / 2;
  const plowRight = PLOW_HITBOX_WIDTH / 2;
  const plowTop = -PLOW_HITBOX_HEIGHT / 2;
  const plowBottom = PLOW_HITBOX_HEIGHT / 2;
  const corners = [
    { x: cellLeft, y: cellTop },
    { x: cellRight, y: cellTop },
    { x: cellRight, y: cellBottom },
    { x: cellLeft, y: cellBottom },
  ];
  let minLocalX = Infinity;
  let maxLocalX = -Infinity;
  let minLocalY = Infinity;
  let maxLocalY = -Infinity;

  for (const corner of corners) {
    const dx = corner.x - plowX;
    const dy = corner.y - plowY;
    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;

    minLocalX = Math.min(minLocalX, localX);
    maxLocalX = Math.max(maxLocalX, localX);
    minLocalY = Math.min(minLocalY, localY);
    maxLocalY = Math.max(maxLocalY, localY);
  }

  return (
    minLocalX < plowRight &&
    maxLocalX > plowLeft &&
    minLocalY < plowBottom &&
    maxLocalY > plowTop
  );
}

function getNextMessage({
  isComplete,
  newlyChanged,
  progress,
  shouldAskPlantingConfirmation,
  stage,
}: {
  isComplete: boolean;
  newlyChanged: number;
  progress: number;
  shouldAskPlantingConfirmation: boolean;
  stage: Phase2Stage;
}) {
  if (shouldAskPlantingConfirmation) {
    return CONFIRM_PLANTING_MESSAGE;
  }

  if (stage === "planting") {
    if (isComplete) {
      return PLANTING_COMPLETE_MESSAGE;
    }

    return newlyChanged > 0
      ? `Plantio: ${Math.round(progress * 100)}%`
      : PLANTING_MESSAGE;
  }

  if (isComplete) {
    return READY_TO_PLANT_MESSAGE;
  }

  return newlyChanged > 0
    ? `Grama cortada: ${Math.round(progress * 100)}%`
    : INITIAL_MESSAGE;
}

function getPlowPosition(
  tractorX: number,
  tractorY: number,
  tractorAngle: number,
  plowAngle: number,
) {
  const offset = getPlowOffset(tractorAngle, plowAngle);

  return {
    x: tractorX + offset.x,
    y: tractorY + offset.y,
  };
}

function getPlowOffset(tractorAngle: number, plowAngle: number) {
  const tractorRear = projectLocalPoint(
    0,
    0,
    tractorAngle,
    0,
    TRACTOR_HEIGHT / 2 - 8,
  );
  const tongueEnd = projectLocalPoint(
    tractorRear.x,
    tractorRear.y,
    plowAngle,
    0,
    PLOW_TONGUE_LENGTH,
  );
  const plowFrontLocalY = getPlowFrontLocalY();
  const plowFrontOffset = projectLocalPoint(0, 0, plowAngle, 0, plowFrontLocalY);

  return {
    x: tongueEnd.x - plowFrontOffset.x,
    y: tongueEnd.y - plowFrontOffset.y,
  };
}

function getPlowCenterOffset() {
  return TRACTOR_HEIGHT / 2 - 8 + PLOW_TONGUE_LENGTH - getPlowFrontLocalY();
}

function getPlowFrontLocalY() {
  return -PLOW_HEIGHT / 2 + 8;
}

function constrainPlowAngle(plowAngle: number, tractorAngle: number) {
  const delta = clamp(
    normalizeAngle(plowAngle - tractorAngle),
    -PLOW_MAX_ARTICULATION,
    PLOW_MAX_ARTICULATION,
  );

  return tractorAngle + delta;
}

function approachAngle(current: number, target: number, amount: number) {
  const delta = normalizeAngle(target - current);
  const clampedDelta = clamp(delta, -amount, amount);

  return current + clampedDelta;
}

function projectLocalPoint(
  originX: number,
  originY: number,
  angle: number,
  localX: number,
  localY: number,
) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: originX + localX * cos - localY * sin,
    y: originY + localX * sin + localY * cos,
  };
}

function normalizeAngle(angle: number) {
  let normalized = angle;

  while (normalized > Math.PI) {
    normalized -= Math.PI * 2;
  }

  while (normalized < -Math.PI) {
    normalized += Math.PI * 2;
  }

  return normalized;
}

function isTractorAtStart(x: number, y: number) {
  return Math.hypot(x - TRACTOR_START_X, y - TRACTOR_START_Y) <= RESTART_DISTANCE;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
