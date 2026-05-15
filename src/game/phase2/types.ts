export type Phase2Cell = {
  id: number;
  column: number;
  row: number;
  cut: boolean;
  planted: boolean;
  cane: boolean;
};

export type Phase2Stage = "plowing" | "planting" | "cane";

export type Phase2Tractor = {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  moving: boolean;
};

export type Phase2Plow = {
  x: number;
  y: number;
  angle: number;
};

export type Phase2GameSnapshot = {
  stage: Phase2Stage;
  awaitingPlantConfirmation: boolean;
  awaitingCaneConfirmation: boolean;
  score: number;
  cutCells: number;
  plantedCells: number;
  caneCells: number;
  totalCells: number;
  progress: number;
  elapsedTime: number;
  totalElapsedTime: number;
  timerStarted: boolean;
  message: string;
  isComplete: boolean;
  finalModal: {
    score: number;
    highScore: number;
    isNewHighScore: boolean;
    hourmeterHours: number;
  } | null;
  tractor: Phase2Tractor;
  plow: Phase2Plow;
  cells: Phase2Cell[];
};
