export type Point = {
  x: number;
  y: number;
};

export type LayerName =
  | "Camada 1.png"
  | "Camada 2.png"
  | "Camada 3.png"
  | "Camada 4.png"
  | "Camada 5.png"
  | "Camada 6.png"
  | "Camada 7.png"
  | "Camada 8.png";

export type SpriteName =
  | LayerName
  | "Camada 2_alt.png"
  | "Camada 8_alt.png"
  | "Camada 3_alt.png";

export type Matrix2D = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};

export type LayerConfig = {
  parent: LayerName | null;
  parentPoint: Point | null;
  childPoint: Point | null;
  label: string;
  min: number;
  max: number;
};

export type SparseAngles = Partial<Record<LayerName, number>>;
export type SparseSprites = Partial<Record<LayerName, SpriteName>>;

export type AnimationPresetId =
  | "idle"
  | "idle2"
  | "arm-extended"
  | "arm-unload";

export type AnimationKeyframe = {
  at: number;
  changes: SparseAngles;
  sprites?: SparseSprites;
};

export type AnimationPreset = {
  id: AnimationPresetId;
  name: string;
  keyframes: AnimationKeyframe[];
};

export type AnimationSoundId = "dirt" | "dirt-2" | "unload";

export type AnimationSoundCue = {
  at: number;
  soundId: AnimationSoundId;
  volume: number;
};

export type AnimationSoundPreset = {
  id: AnimationPresetId;
  animationSound: AnimationSoundCue[];
};

export type ResolvedKeyframe = {
  at: number;
  angles: Record<LayerName, number>;
  sprites: Record<LayerName, SpriteName>;
};

export type LoadedSpriteMap = Record<SpriteName, HTMLImageElement>;

export type ExcavatorPose = {
  angles: Record<LayerName, number>;
  sprites: Record<LayerName, SpriteName>;
};

export type ActiveAnimation = {
  presetId: AnimationPresetId;
  label: string;
  elapsed: number;
  lockMovement: boolean;
  onUpdate?: (previousElapsed: number, nextElapsed: number) => void;
  onComplete?: () => void;
};
