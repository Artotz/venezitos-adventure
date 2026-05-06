export type Phase2Obstacle = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
};

export type Phase2Tractor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Phase2GameSnapshot = {
  distance: number;
  score: number;
  speed: number;
  message: string;
  collisionFlash: number;
  roadOffset: number;
  tractor: Phase2Tractor;
  obstacles: Phase2Obstacle[];
};
