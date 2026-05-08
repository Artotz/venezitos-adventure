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
  TRACTOR_HEIGHT,
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
      angle: -Math.PI / 2,
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

      const movement = inputRef.current?.getMovementVector() ?? { x: 0, y: 0 };

      setSnapshot((current) => {
        const magnitude = Math.hypot(movement.x, movement.y);
        const inputX = magnitude > 0 ? movement.x / magnitude : 0;
        const inputY = magnitude > 0 ? movement.y / magnitude : 0;
        const halfWidth = current.tractor.width / 2;
        const halfHeight = current.tractor.height / 2;

        const nextX = clamp(
          current.tractor.x + inputX * TRACTOR_SPEED * dt,
          FIELD_LEFT + halfWidth,
          FIELD_LEFT + FIELD_WIDTH - halfWidth,
        );
        const nextY = clamp(
          current.tractor.y + inputY * TRACTOR_SPEED * dt,
          FIELD_TOP + halfHeight,
          FIELD_TOP + FIELD_HEIGHT - halfHeight,
        );
        const targetAngle =
          magnitude > 0 ? Math.atan2(inputY, inputX) + Math.PI / 2 : current.tractor.angle;
        const nextAngle =
          magnitude > 0
            ? rotateToward(current.tractor.angle, targetAngle, TRACTOR_TURN_RESPONSE * dt)
            : current.tractor.angle;

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

        return {
          ...current,
          score: current.score + newlyCut * 10,
          cutCells: nextCutCells,
          progress,
          elapsedTime: isComplete ? current.elapsedTime : current.elapsedTime + dt,
          message: isComplete
            ? COMPLETE_MESSAGE
            : newlyCut > 0
              ? `Grama cortada: ${Math.round(progress * 100)}%`
              : current.message,
          isComplete,
          tractor: {
            ...current.tractor,
            x: nextX,
            y: nextY,
            angle: nextAngle,
            moving: magnitude > 0,
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

function rotateToward(current: number, target: number, amount: number) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));

  if (Math.abs(delta) <= amount) {
    return target;
  }

  return current + Math.sign(delta) * amount;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
