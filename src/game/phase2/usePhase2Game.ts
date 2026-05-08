import { useEffect, useRef, useState } from "react";
import { InputManager } from "../input";
import { useGameLoop } from "../useGameLoop";
import {
  CANVAS_HEIGHT,
  FORWARD_SCROLL_SPEED,
  MAX_SCROLL_SPEED,
  MIN_SCROLL_SPEED,
  OBSTACLE_DESPAWN_Y,
  OBSTACLE_MAX_SIZE,
  OBSTACLE_MIN_SIZE,
  OBSTACLE_SPAWN_INTERVAL,
  OBSTACLE_SPAWN_VARIANCE,
  ROAD_LEFT,
  ROAD_RIGHT,
  TRACTOR_HEIGHT,
  TRACTOR_SPEED,
  TRACTOR_START_X,
  TRACTOR_START_Y,
  TRACTOR_WIDTH,
} from "./config";
import type { Phase2GameSnapshot, Phase2Obstacle } from "./types";

const INITIAL_SNAPSHOT: Phase2GameSnapshot = {
  distance: 0,
  score: 0,
  speed: FORWARD_SCROLL_SPEED,
  message: "Desvie das pedras e siga subindo.",
  collisionFlash: 0,
  roadOffset: 0,
  tractor: {
    x: TRACTOR_START_X,
    y: TRACTOR_START_Y,
    width: TRACTOR_WIDTH,
    height: TRACTOR_HEIGHT,
  },
  obstacles: [],
};

export function usePhase2Game(enabled = true, paused = false) {
  const inputRef = useRef<InputManager | null>(null);
  const nextObstacleIdRef = useRef(1);
  const obstacleTimerRef = useRef(0);
  const messageTimerRef = useRef(0);
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);

  useEffect(() => {
    if (!enabled) {
      setSnapshot(INITIAL_SNAPSHOT);
      return;
    }

    if (paused) {
      return;
    }

    const input = new InputManager();
    input.attach();
    inputRef.current = input;

    return () => {
      input.detach();
      if (inputRef.current === input) {
        inputRef.current = null;
      }
    };
  }, [enabled, paused]);

  useEffect(() => {
    if (!enabled) {
      nextObstacleIdRef.current = 1;
      obstacleTimerRef.current = 0;
      messageTimerRef.current = 0;
    }
  }, [enabled]);

  useGameLoop(
    (dt) => {
      if (!enabled || paused) {
        return;
      }

      const movement = inputRef.current?.getMovementVector() ?? { x: 0, y: 0 };

      setSnapshot((current) => {
        const forwardControl = Math.max(-1, Math.min(1, -movement.y));
        const nextSpeed = clamp(
          FORWARD_SCROLL_SPEED + forwardControl * 90,
          MIN_SCROLL_SPEED,
          MAX_SCROLL_SPEED,
        );
        const nextDistance = current.distance + nextSpeed * dt * 0.1;
        const nextRoadOffset = (current.roadOffset + nextSpeed * dt) % 1200;
        const halfWidth = current.tractor.width / 2;
        const halfHeight = current.tractor.height / 2;
        const sidePadding = 28;

        let nextTractorX =
          current.tractor.x + movement.x * TRACTOR_SPEED * dt;
        let nextTractorY =
          current.tractor.y + movement.y * TRACTOR_SPEED * dt * 0.35;

        nextTractorX = clamp(
          nextTractorX,
          ROAD_LEFT + sidePadding + halfWidth,
          ROAD_RIGHT - sidePadding - halfWidth,
        );
        nextTractorY = clamp(
          nextTractorY,
          CANVAS_HEIGHT * 0.48,
          CANVAS_HEIGHT - halfHeight - 34,
        );

        obstacleTimerRef.current -= dt;
        let shouldSpawnObstacle = false;

        if (obstacleTimerRef.current <= 0) {
          obstacleTimerRef.current =
            OBSTACLE_SPAWN_INTERVAL + Math.random() * OBSTACLE_SPAWN_VARIANCE;
          shouldSpawnObstacle = true;
        }

        const nextObstacles = current.obstacles
          .map((obstacle) => ({
            ...obstacle,
            y: obstacle.y + nextSpeed * dt,
          }))
          .filter((obstacle) => obstacle.y < OBSTACLE_DESPAWN_Y);

        if (shouldSpawnObstacle) {
          nextObstacles.push(createObstacle(nextObstacleIdRef.current++));
        }

        let collisionFlash = Math.max(0, current.collisionFlash - dt * 2.8);
        let nextScore = current.score + dt * 14;
        let message = current.message;

        if (messageTimerRef.current > 0) {
          messageTimerRef.current = Math.max(0, messageTimerRef.current - dt);
          if (messageTimerRef.current === 0 && collisionFlash === 0) {
            message = "Desvie das pedras e siga subindo.";
          }
        }

        const tractorBounds = {
          left: nextTractorX - halfWidth + 10,
          right: nextTractorX + halfWidth - 10,
          top: nextTractorY - halfHeight + 12,
          bottom: nextTractorY + halfHeight - 12,
        };

        let collided = false;

        nextObstacles.forEach((obstacle) => {
          const obstacleHalf = obstacle.size * 0.42;
          const hit =
            tractorBounds.left < obstacle.x + obstacleHalf &&
            tractorBounds.right > obstacle.x - obstacleHalf &&
            tractorBounds.top < obstacle.y + obstacleHalf &&
            tractorBounds.bottom > obstacle.y - obstacleHalf;

          if (!hit || collided) {
            return;
          }

          collided = true;
          collisionFlash = 1;
          nextScore = Math.max(0, nextScore - 35);
          message = "Pedra na pista! Puxa para o lado.";
          messageTimerRef.current = 1.5;

          if (nextTractorX <= obstacle.x) {
            nextTractorX = Math.max(
              ROAD_LEFT + sidePadding + halfWidth,
              nextTractorX - 34,
            );
          } else {
            nextTractorX = Math.min(
              ROAD_RIGHT - sidePadding - halfWidth,
              nextTractorX + 34,
            );
          }
        });

        return {
          distance: nextDistance,
          score: nextScore,
          speed: nextSpeed,
          message,
          collisionFlash,
          roadOffset: nextRoadOffset,
          tractor: {
            ...current.tractor,
            x: nextTractorX,
            y: nextTractorY,
          },
          obstacles: nextObstacles,
        };
      });
    },
    enabled && !paused,
  );

  return snapshot;
}

function createObstacle(id: number): Phase2Obstacle {
  const size =
    OBSTACLE_MIN_SIZE +
    Math.random() * (OBSTACLE_MAX_SIZE - OBSTACLE_MIN_SIZE);
  const horizontalPadding = size * 0.8 + 40;
  const x =
    ROAD_LEFT +
    horizontalPadding +
    Math.random() *
      (ROAD_RIGHT - ROAD_LEFT - horizontalPadding * 2);

  return {
    id,
    x,
    y: -size - Math.random() * 220,
    size,
    rotation: (Math.random() - 0.5) * 0.9,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
