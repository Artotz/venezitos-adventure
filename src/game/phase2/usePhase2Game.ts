import { useEffect, useRef, useState } from "react";
import { TEXT } from "../i18n";
import { InputManager } from "../input";
import { useGameLoop } from "../useGameLoop";
import {
  CANE_COMPLETE_MESSAGE,
  CANE_MESSAGE,
  CELL_SCORE_VALUE,
  CELL_SIZE,
  FIELD_COLUMNS,
  FIELD_HEIGHT,
  FIELD_LEFT,
  FIELD_ROWS,
  FIELD_TOP,
  FIELD_WIDTH,
  INITIAL_MESSAGE,
  PLANTING_COMPLETE_MESSAGE,
  PLANTING_MESSAGE,
  PLANTER_HITBOX_HEIGHT,
  PLANTER_HITBOX_WIDTH,
  PLOW_HITBOX_HEIGHT,
  PLOW_HITBOX_WIDTH,
  PLOW_HEIGHT,
  PLOW_FOLLOW_RESPONSE,
  PLOW_MAX_ARTICULATION,
  PLOW_TONGUE_LENGTH,
  PLOW_TURN_SWING,
  SPRAYER_HITBOX_HEIGHT,
  SPRAYER_HITBOX_WIDTH,
  STAGE_DURATION_SECONDS,
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
    cane: false,
  }));
}

function createInitialSnapshot(): Phase2GameSnapshot {
  const cells = createInitialCells();
  const vehicle = getStageStartVehicle();

  return {
    stage: "plowing",
    awaitingPlantConfirmation: false,
    awaitingCaneConfirmation: false,
    score: 0,
    cutCells: 0,
    plantedCells: 0,
    caneCells: 0,
    totalCells: cells.length,
    progress: 0,
    elapsedTime: 0,
    totalElapsedTime: 0,
    timerStarted: false,
    message: INITIAL_MESSAGE,
    isComplete: false,
    tractor: vehicle.tractor,
    plow: vehicle.plow,
    cells,
  };
}

function getStageStartVehicle() {
  return {
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

    return () => {
      window.removeEventListener("keydown", preventPageScroll);
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

      const wasdMovement = inputRef.current?.getWasdVector() ?? { x: 0, y: 0 };
      const arrowControls = inputRef.current?.getArrowTractorControls() ?? {
        steering: 0,
        throttle: 0,
      };

      setSnapshot((current) => {
        if (current.stage === "cane" && current.isComplete) {
          return current;
        }

        if (current.awaitingPlantConfirmation || current.awaitingCaneConfirmation) {
          return current;
        }

        const hasWasdDirection = wasdMovement.x !== 0 || wasdMovement.y !== 0;
        const steering = arrowControls.steering;
        const throttle = arrowControls.throttle;
        const isMoving = throttle !== 0;
        const turnDirection = isMoving && !hasWasdDirection
          ? steering * Math.sign(throttle)
          : 0;
        const targetAngle = isMoving && hasWasdDirection
          ? Math.atan2(wasdMovement.x, -wasdMovement.y)
          : current.tractor.angle + turnDirection * TRACTOR_TURN_RESPONSE * dt;
        const nextAngle = isMoving && hasWasdDirection
          ? approachAngle(
            current.tractor.angle,
            targetAngle,
            TRACTOR_TURN_RESPONSE * dt,
          )
          : targetAngle;
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

        let newlyChanged = 0;
        const nextCells = current.cells.map((cell) => {
          const cellAlreadyDone =
            current.stage === "plowing"
              ? cell.cut
              : current.stage === "planting"
                ? cell.planted
                : cell.cane;

          if (
            cellAlreadyDone ||
            !canCellChangeInStage(cell, current.stage) ||
            !doesImplementCoverCell(
              nextPlow.x,
              nextPlow.y,
              constrainedPlowAngle,
              getImplementHitboxWidth(current.stage),
              getImplementHitboxHeight(current.stage),
              cell,
            )
          ) {
            return cell;
          }

          newlyChanged += 1;
          if (current.stage === "plowing") {
            return { ...cell, cut: true };
          }

          if (current.stage === "planting") {
            return { ...cell, planted: true };
          }

          return { ...cell, cane: true };
        });

        const nextCutCells =
          current.stage === "plowing"
            ? current.cutCells + newlyChanged
            : current.cutCells;
        const nextPlantedCells =
          current.stage === "planting"
            ? current.plantedCells + newlyChanged
            : current.plantedCells;
        const nextCaneCells =
          current.stage === "cane"
            ? current.caneCells + newlyChanged
            : current.caneCells;
        const nextTimerStarted = current.timerStarted || newlyChanged > 0;
        const nextElapsedTime = nextTimerStarted
          ? Math.min(STAGE_DURATION_SECONDS, current.elapsedTime + dt)
          : current.elapsedTime;
        const stageTimedOut = nextElapsedTime >= STAGE_DURATION_SECONDS;
        const nextTotalElapsedTime = current.totalElapsedTime + nextElapsedTime;
        const stageFullyCompleted = isStageFullyCompleted({
          stage: current.stage,
          totalCells: current.totalCells,
          cutCells: nextCutCells,
          plantedCells: nextPlantedCells,
          caneCells: nextCaneCells,
        });
        const shouldAdvanceStage = stageTimedOut || stageFullyCompleted;
        const nextProgress = nextElapsedTime / STAGE_DURATION_SECONDS;
        const nextVehicle = getStageStartVehicle();

        if (shouldAdvanceStage && current.stage === "plowing") {
          return {
            ...current,
            stage: "planting",
            awaitingPlantConfirmation: false,
            awaitingCaneConfirmation: false,
            score: calculateScore(nextCutCells, 0, 0),
            cutCells: nextCutCells,
            plantedCells: 0,
            caneCells: 0,
            progress: 0,
            elapsedTime: 0,
            totalElapsedTime: nextTotalElapsedTime,
            timerStarted: false,
            message: PLANTING_MESSAGE,
            isComplete: false,
            tractor: nextVehicle.tractor,
            plow: nextVehicle.plow,
            cells: nextCells.map((cell) => ({
              ...cell,
              planted: false,
              cane: false,
            })),
          };
        }

        if (shouldAdvanceStage && current.stage === "planting") {
          return {
            ...current,
            stage: "cane",
            awaitingPlantConfirmation: false,
            awaitingCaneConfirmation: false,
            score: calculateScore(
              nextCutCells,
              nextPlantedCells,
              0,
            ),
            cutCells: nextCutCells,
            plantedCells: nextPlantedCells,
            caneCells: 0,
            progress: 0,
            elapsedTime: 0,
            totalElapsedTime: nextTotalElapsedTime,
            timerStarted: false,
            message: CANE_MESSAGE,
            isComplete: false,
            tractor: nextVehicle.tractor,
            plow: nextVehicle.plow,
            cells: nextCells.map((cell) => ({
              ...cell,
              cane: false,
            })),
          };
        }

        const shouldFinishCane = shouldAdvanceStage && current.stage === "cane";

        return {
          ...current,
          awaitingPlantConfirmation: false,
          awaitingCaneConfirmation: false,
          score: calculateScore(
            nextCutCells,
            nextPlantedCells,
            nextCaneCells,
          ),
          cutCells: nextCutCells,
          plantedCells: nextPlantedCells,
          caneCells: nextCaneCells,
          progress: nextProgress,
          elapsedTime: nextElapsedTime,
          totalElapsedTime: shouldFinishCane
            ? nextTotalElapsedTime
            : current.totalElapsedTime,
          timerStarted: nextTimerStarted,
          message: getNextMessage(
            current.stage,
            shouldFinishCane,
            newlyChanged,
            nextProgress,
          ),
          isComplete: shouldFinishCane,
          tractor: {
            ...current.tractor,
            x: shouldFinishCane ? nextVehicle.tractor.x : nextX,
            y: shouldFinishCane ? nextVehicle.tractor.y : nextY,
            angle: shouldFinishCane ? 0 : nextAngle,
            moving: shouldFinishCane ? false : isMoving,
          },
          plow: {
            x: shouldFinishCane ? nextVehicle.plow.x : nextPlow.x,
            y: shouldFinishCane ? nextVehicle.plow.y : nextPlow.y,
            angle: shouldFinishCane ? 0 : constrainedPlowAngle,
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

function doesImplementCoverCell(
  implementX: number,
  implementY: number,
  implementAngle: number,
  hitboxWidth: number,
  hitboxHeight: number,
  cell: Phase2Cell,
) {
  const cellLeft = FIELD_LEFT + cell.column * CELL_SIZE;
  const cellTop = FIELD_TOP + cell.row * CELL_SIZE;
  const cellRight = cellLeft + CELL_SIZE;
  const cellBottom = cellTop + CELL_SIZE;
  const cos = Math.cos(implementAngle);
  const sin = Math.sin(implementAngle);
  const implementLeft = -hitboxWidth / 2;
  const implementRight = hitboxWidth / 2;
  const implementTop = -hitboxHeight / 2;
  const implementBottom = hitboxHeight / 2;
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
    const dx = corner.x - implementX;
    const dy = corner.y - implementY;
    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;

    minLocalX = Math.min(minLocalX, localX);
    maxLocalX = Math.max(maxLocalX, localX);
    minLocalY = Math.min(minLocalY, localY);
    maxLocalY = Math.max(maxLocalY, localY);
  }

  return (
    minLocalX < implementRight &&
    maxLocalX > implementLeft &&
    minLocalY < implementBottom &&
    maxLocalY > implementTop
  );
}

function getNextMessage(
  stage: Phase2Stage,
  isComplete: boolean,
  newlyChanged: number,
  progress: number,
) {
  if (stage === "cane") {
    if (isComplete) {
      return CANE_COMPLETE_MESSAGE;
    }

    return CANE_MESSAGE;
  }

  if (stage === "planting") {
    if (isComplete) {
      return PLANTING_COMPLETE_MESSAGE;
    }

    return newlyChanged > 0
      ? TEXT.phase2.plantingProgress(Math.round(progress * 100))
      : PLANTING_MESSAGE;
  }

  return newlyChanged > 0
    ? TEXT.phase2.grassCutProgress(Math.round(progress * 100))
    : INITIAL_MESSAGE;
}

function canCellChangeInStage(cell: Phase2Cell, stage: Phase2Stage) {
  if (stage === "planting") {
    return cell.cut;
  }

  if (stage === "cane") {
    return cell.planted;
  }

  return true;
}

function getImplementHitboxWidth(stage: Phase2Stage) {
  if (stage === "plowing") {
    return PLOW_HITBOX_WIDTH;
  }

  if (stage === "cane") {
    return SPRAYER_HITBOX_WIDTH;
  }

  return PLANTER_HITBOX_WIDTH;
}

function getImplementHitboxHeight(stage: Phase2Stage) {
  if (stage === "plowing") {
    return PLOW_HITBOX_HEIGHT;
  }

  if (stage === "cane") {
    return SPRAYER_HITBOX_HEIGHT;
  }

  return PLANTER_HITBOX_HEIGHT;
}

function isStageFullyCompleted({
  stage,
  totalCells,
  cutCells,
  plantedCells,
  caneCells,
}: {
  stage: Phase2Stage;
  totalCells: number;
  cutCells: number;
  plantedCells: number;
  caneCells: number;
}) {
  if (stage === "plowing") {
    return cutCells >= totalCells;
  }

  if (stage === "planting") {
    return cutCells > 0 && plantedCells >= cutCells;
  }

  return plantedCells > 0 && caneCells >= plantedCells;
}

function calculateScore(
  cutCells: number,
  plantedCells: number,
  caneCells: number,
) {
  return (cutCells + plantedCells + caneCells) * CELL_SCORE_VALUE;
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
