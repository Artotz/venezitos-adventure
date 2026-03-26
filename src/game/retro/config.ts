import type {
  AnimationPreset,
  LayerConfig,
  LayerName,
  SpriteName,
} from "./types";

export const ROOT_LAYER: LayerName = "Camada 3.png";

export const DRAW_ORDER: LayerName[] = [
  "Camada 6.png",
  "Camada 3.png",
  "Camada 1.png",
  "Camada 2.png",
  "Camada 7.png",
  "Camada 8.png",
  "Camada 4.png",
  "Camada 5.png",
];

export const LAYER_CONFIG: Record<LayerName, LayerConfig> = {
  "Camada 1.png": {
    parent: "Camada 3.png",
    parentPoint: { x: 114, y: 106 },
    childPoint: { x: 178, y: 20 },
    label: "Camada 1 em relacao ao corpo",
    min: -110,
    max: 110,
  },
  "Camada 2.png": {
    parent: "Camada 1.png",
    parentPoint: { x: 9, y: 137 },
    childPoint: { x: 78, y: 32 },
    label: "Camada 2 em relacao a camada 1",
    min: -160,
    max: 160,
  },
  "Camada 3.png": {
    parent: null,
    parentPoint: null,
    childPoint: null,
    label: "Corpo fixo",
    min: 0,
    max: 0,
  },
  "Camada 4.png": {
    parent: "Camada 3.png",
    parentPoint: { x: 50, y: 200 },
    childPoint: { x: 42, y: 45 },
    label: "Pneu dianteiro",
    min: -360,
    max: 360,
  },
  "Camada 5.png": {
    parent: "Camada 3.png",
    parentPoint: { x: 230, y: 180 },
    childPoint: { x: 60, y: 63 },
    label: "Pneu traseiro",
    min: -360,
    max: 360,
  },
  "Camada 6.png": {
    parent: "Camada 3.png",
    parentPoint: { x: 330, y: 180 },
    childPoint: { x: 46, y: 230 },
    label: "Camada 6 em relacao ao corpo",
    min: -110,
    max: 110,
  },
  "Camada 7.png": {
    parent: "Camada 6.png",
    parentPoint: { x: 90, y: 16 },
    childPoint: { x: 16, y: 18 },
    label: "Camada 7 em relacao a camada 6",
    min: -180,
    max: 180,
  },
  "Camada 8.png": {
    parent: "Camada 7.png",
    parentPoint: { x: 103, y: 180 },
    childPoint: { x: 66, y: 49 },
    label: "Camada 8 em relacao a camada 7",
    min: -180,
    max: 180,
  },
};

export const BASE_ANGLES: Record<LayerName, number> = {
  "Camada 1.png": 18,
  "Camada 2.png": -24,
  "Camada 3.png": 0,
  "Camada 4.png": 0,
  "Camada 5.png": 0,
  "Camada 6.png": 12,
  "Camada 7.png": 11,
  "Camada 8.png": -18,
};

export const BASE_SPRITES: Record<LayerName, SpriteName> = {
  "Camada 1.png": "Camada 1.png",
  "Camada 2.png": "Camada 2.png",
  "Camada 3.png": "Camada 3.png",
  "Camada 4.png": "Camada 4.png",
  "Camada 5.png": "Camada 5.png",
  "Camada 6.png": "Camada 6.png",
  "Camada 7.png": "Camada 7.png",
  "Camada 8.png": "Camada 8.png",
};

export const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: "idle",
    name: "Ciclo de cacamba 1",
    keyframes: [
      { at: 0, changes: {} },
      { at: 600, changes: { "Camada 1.png": 8, "Camada 2.png": -16 } },
      {
        at: 1200,
        changes: {},
        sprites: { "Camada 2.png": "Camada 2_alt.png" },
      },
      { at: 2400, changes: {} },
      { at: 3200, changes: { "Camada 1.png": 21, "Camada 2.png": 30 } },
    ],
  },
  {
    id: "idle2",
    name: "Ciclo de cacamba 2",
    keyframes: [
      { at: 0, changes: {} },
      { at: 1200, changes: { "Camada 1.png": 75, "Camada 2.png": -24 } },
      {
        at: 2400,
        changes: { "Camada 2.png": -92 },
        sprites: { "Camada 2.png": "Camada 2.png" },
      },
      {
        at: 3600,
        changes: {
          "Camada 1.png": BASE_ANGLES["Camada 1.png"],
          "Camada 2.png": BASE_ANGLES["Camada 2.png"],
        },
      },
    ],
  },
  {
    id: "arm-extended",
    name: "Braco estendido",
    keyframes: [
      { at: 0, changes: {} },
      {
        at: 1200,
        changes: {
          "Camada 6.png": 47,
          "Camada 7.png": -78,
          "Camada 8.png": -131,
        },
      },
      {
        at: 2000,
        changes: {
          "Camada 6.png": 38,
          "Camada 7.png": -45,
          "Camada 8.png": -95,
        },
        sprites: { "Camada 8.png": "Camada 8_alt.png" },
      },
      {
        at: 3600,
        changes: { "Camada 6.png": 25, "Camada 7.png": 7, "Camada 8.png": -38 },
      },
      {
        at: 4200,
        changes: { "Camada 6.png": 15, "Camada 7.png": 7, "Camada 8.png": -38 },
      },
    ],
  },
  {
    id: "arm-unload",
    name: "Descarregando traseira",
    keyframes: [
      { at: 0, changes: {} },
      {
        at: 1200,
        changes: {
          "Camada 6.png": 5,
          "Camada 7.png": -5,
          "Camada 8.png": -45,
        },
      },
      {
        at: 2400,
        changes: { "Camada 8.png": -160 },
        sprites: { "Camada 8.png": "Camada 8.png" },
      },
      {
        at: 3600,
        changes: {
          "Camada 6.png": BASE_ANGLES["Camada 6.png"],
          "Camada 7.png": BASE_ANGLES["Camada 7.png"],
          "Camada 8.png": BASE_ANGLES["Camada 8.png"],
        },
      },
    ],
  },
];

export const CONTROLLABLE_LAYERS = (
  Object.keys(LAYER_CONFIG) as LayerName[]
).filter((layerName) => layerName !== ROOT_LAYER);
