export type Phase2Cell = {
  id: number;
  column: number;
  row: number;
  cut: boolean;
};

export type Phase2Tractor = {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  moving: boolean;
};

export type Phase2GameSnapshot = {
  score: number;
  cutCells: number;
  totalCells: number;
  progress: number;
  elapsedTime: number;
  message: string;
  isComplete: boolean;
  tractor: Phase2Tractor;
  cells: Phase2Cell[];
};
