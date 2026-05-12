import { useEffect, useRef, useState } from "react";
import { InputManager } from "../input";
import { useGameLoop } from "../useGameLoop";
import {
  CELL_SIZE,
  COMPLETE_MESSAGE,
  FIELD_COLUMNS,
  FIELD_HEIGHT,
  FIELD_LEFT,
  FIELD_ROWS,
  FIELD_TOP,
  FIELD_WIDTH,
  INITIAL_MESSAGE,
  READY_TO_RESTART_MESSAGE,
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
import type { Phase2Cell, Phase2GameSnapshot } from "./types";

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
  }));
}

function createInitialSnapshot(): Phase2GameSnapshot {
  const cells = createInitialCells();

  return {
    score: 0,
    cutCells: 0,
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

    const handleRestart = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) {
        return;
      }

      setSnapshot((current) => {
        if (!current.isComplete || !isTractorAtStart(current.tractor.x, current.tractor.y)) {
          return current;
        }

        event.preventDefault();
        return createInitialSnapshot();
      });
    };

    window.addEventListener("keydown", handleRestart);

    return () => {
      window.removeEventListener("keydown", preventPageScroll);
      window.removeEventListener("keydown", handleRestart);
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

        const nextX = clamp(
          current.tractor.x + forwardX * throttle * TRACTOR_SPEED * dt,
          FIELD_LEFT + halfWidth,
          FIELD_LEFT + FIELD_WIDTH - halfWidth,
        );
        const nextY = clamp(
          current.tractor.y + forwardY * throttle * TRACTOR_SPEED * dt,
          FIELD_TOP + halfHeight,
          FIELD_TOP + FIELD_HEIGHT - halfHeight,
        );

        let newlyCut = 0;
        const nextCells = current.cells.map((cell) => {
          if (cell.cut || !doesTractorCoverCell(nextX, nextY, halfWidth, halfHeight, cell)) {
            return cell;
          }

          newlyCut += 1;
          return { ...cell, cut: true };
        });

        const nextCutCells = current.cutCells + newlyCut;
        const progress = nextCutCells / current.totalCells;
        const isComplete = nextCutCells === current.totalCells;
        const readyToRestart = isComplete && isTractorAtStart(nextX, nextY);
        const shouldCountTime = !isComplete || !readyToRestart;

        return {
          ...current,
          score: current.score + newlyCut * 10,
          cutCells: nextCutCells,
          progress,
          elapsedTime: shouldCountTime ? current.elapsedTime + dt : current.elapsedTime,
          message: isComplete
            ? readyToRestart
              ? READY_TO_RESTART_MESSAGE
              : COMPLETE_MESSAGE
            : newlyCut > 0
              ? `Grama cortada: ${Math.round(progress * 100)}%`
              : current.message,
          isComplete,
          tractor: {
            ...current.tractor,
            x: nextX,
            y: nextY,
            angle: nextAngle,
            moving: isMoving,
          },
          cells: nextCells,
        };
      });
    },
    enabled && !paused,
  );

  return snapshot;
}

function doesTractorCoverCell(
  tractorX: number,
  tractorY: number,
  halfWidth: number,
  halfHeight: number,
  cell: Phase2Cell,
) {
  const cellLeft = FIELD_LEFT + cell.column * CELL_SIZE;
  const cellTop = FIELD_TOP + cell.row * CELL_SIZE;
  const cellRight = cellLeft + CELL_SIZE;
  const cellBottom = cellTop + CELL_SIZE;

  return (
    tractorX - halfWidth < cellRight &&
    tractorX + halfWidth > cellLeft &&
    tractorY - halfHeight < cellBottom &&
    tractorY + halfHeight > cellTop
  );
}

function isTractorAtStart(x: number, y: number) {
  return Math.hypot(x - TRACTOR_START_X, y - TRACTOR_START_Y) <= RESTART_DISTANCE;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
