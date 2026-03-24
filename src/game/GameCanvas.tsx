import { useEffect, useMemo, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type LayerName =
  | "Camada 1.png"
  | "Camada 2.png"
  | "Camada 3.png"
  | "Camada 4.png"
  | "Camada 5.png"
  | "Camada 6.png"
  | "Camada 7.png"
  | "Camada 8.png";

type SpriteName = LayerName | "Camada 2_alt.png" | "Camada 8_alt.png";

type LoadedSprite = {
  name: SpriteName;
  src: string;
  image: HTMLImageElement;
};

type Matrix2D = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};

type LayerConfig = {
  parent: LayerName | null;
  parentPoint: Point | null;
  childPoint: Point | null;
  label: string;
  min: number;
  max: number;
};

type SparseAngles = Partial<Record<LayerName, number>>;
type SparseSprites = Partial<Record<LayerName, SpriteName>>;

type AnimationKeyframe = {
  at: number;
  changes: SparseAngles;
  sprites?: SparseSprites;
};

type AnimationPreset = {
  id: string;
  name: string;
  keyframes: AnimationKeyframe[];
};

type ResolvedKeyframe = {
  at: number;
  angles: Record<LayerName, number>;
  sprites: Record<LayerName, SpriteName>;
};

const spriteModules = import.meta.glob("../assets/retro/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const ROOT_LAYER: LayerName = "Camada 3.png";
const CANVAS_PADDING = 140;
const DRAW_ORDER: LayerName[] = [
  "Camada 3.png",
  "Camada 1.png",
  "Camada 2.png",
  "Camada 6.png",
  "Camada 7.png",
  "Camada 8.png",
  "Camada 4.png",
  "Camada 5.png",
];

const LAYER_CONFIG: Record<LayerName, LayerConfig> = {
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
    parentPoint: { x: 50, y: 185 },
    childPoint: { x: 42, y: 45 },
    label: "Pneu 4",
    min: -360,
    max: 360,
  },
  "Camada 5.png": {
    parent: "Camada 3.png",
    parentPoint: { x: 230, y: 180 },
    childPoint: { x: 60, y: 63 },
    label: "Pneu 5",
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

const DEFAULT_ANGLES: Record<LayerName, number> = {
  "Camada 1.png": 20,
  "Camada 2.png": -20,
  "Camada 3.png": 0,
  "Camada 4.png": 0,
  "Camada 5.png": 0,
  "Camada 6.png": 5,
  "Camada 7.png": 10,
  "Camada 8.png": -15,
};

const DEFAULT_SPRITES: Record<LayerName, SpriteName> = {
  "Camada 1.png": "Camada 1.png",
  "Camada 2.png": "Camada 2.png",
  "Camada 3.png": "Camada 3.png",
  "Camada 4.png": "Camada 4.png",
  "Camada 5.png": "Camada 5.png",
  "Camada 6.png": "Camada 6.png",
  "Camada 7.png": "Camada 7.png",
  "Camada 8.png": "Camada 8.png",
};

const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: "idle",
    name: "Ciclo da Cacamba",
    keyframes: [
      { at: 0, changes: {} },
      {
        at: 600,
        changes: {
          "Camada 1.png": 14,
          "Camada 2.png": -21,
          "Camada 6.png": 5,
        },
        sprites: {
          "Camada 2.png": "Camada 2_alt.png",
        },
      },
      {
        at: 2400,
        changes: {
          "Camada 1.png": 21,
          "Camada 2.png": 30,
        },
      },
    ],
  },
  {
    id: "idle2",
    name: "Ciclo da Cacamba 2",
    keyframes: [
      { at: 0, changes: {} },
      {
        at: 1200,
        changes: {
          "Camada 1.png": 75,
          "Camada 2.png": -24,
        },
      },
      {
        at: 2400,
        changes: {
          "Camada 2.png": -92,
        },
      },
    ],
  },
  {
    id: "arm-extended",
    name: "Braco Estendido",
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
        sprites: {
          "Camada 8.png": "Camada 8_alt.png",
        },
      },
      {
        at: 3600,
        changes: {
          "Camada 6.png": 25,
          "Camada 7.png": 7,
          "Camada 8.png": -38,
        },
      },
      {
        at: 4200,
        changes: {
          "Camada 6.png": 25,
          "Camada 7.png": 7,
          "Camada 8.png": -38,
        },
      },
    ],
  },
];

const CONTROLLABLE_LAYERS = (Object.keys(LAYER_CONFIG) as LayerName[]).filter(
  (layerName) => layerName !== ROOT_LAYER,
);

function compareLayerNames(a: string, b: string) {
  return a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    image.src = src;
  });
}

function createIdentityMatrix(): Matrix2D {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
}

function multiplyMatrices(left: Matrix2D, right: Matrix2D): Matrix2D {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    e: left.a * right.e + left.c * right.f + left.e,
    f: left.b * right.e + left.d * right.f + left.f,
  };
}

function createTranslationMatrix(x: number, y: number): Matrix2D {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y };
}

function createRotationMatrix(angleInRadians: number): Matrix2D {
  const cosine = Math.cos(angleInRadians);
  const sine = Math.sin(angleInRadians);

  return {
    a: cosine,
    b: sine,
    c: -sine,
    d: cosine,
    e: 0,
    f: 0,
  };
}

function applyToPoint(matrix: Matrix2D, point: Point): Point {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  };
}

function computeWorldMatrices(
  layers: LayerName[],
  angles: Record<LayerName, number>,
  rootMatrix: Matrix2D,
) {
  const worldMatrices = new Map<LayerName, Matrix2D>();

  const resolveLayerMatrix = (layerName: LayerName): Matrix2D => {
    const cached = worldMatrices.get(layerName);

    if (cached) {
      return cached;
    }

    const layerConfig = LAYER_CONFIG[layerName];

    if (layerConfig.parent === null) {
      worldMatrices.set(layerName, rootMatrix);
      return rootMatrix;
    }

    const parentMatrix = resolveLayerMatrix(layerConfig.parent);
    const parentAnchor = layerConfig.parentPoint ?? { x: 0, y: 0 };
    const childAnchor = layerConfig.childPoint ?? { x: 0, y: 0 };
    const angleInRadians = (angles[layerName] * Math.PI) / 180;

    const localMatrix = multiplyMatrices(
      multiplyMatrices(
        createTranslationMatrix(parentAnchor.x, parentAnchor.y),
        createRotationMatrix(angleInRadians),
      ),
      createTranslationMatrix(-childAnchor.x, -childAnchor.y),
    );

    const worldMatrix = multiplyMatrices(parentMatrix, localMatrix);
    worldMatrices.set(layerName, worldMatrix);
    return worldMatrix;
  };

  for (const layer of layers) {
    resolveLayerMatrix(layer);
  }

  return worldMatrices;
}

function computeBounds(
  images: Record<LayerName, HTMLImageElement>,
  worldMatrices: Map<LayerName, Matrix2D>,
) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const layerName of DRAW_ORDER) {
    const matrix = worldMatrices.get(layerName);
    const image = images[layerName];

    if (!matrix || !image) {
      continue;
    }

    const corners = [
      applyToPoint(matrix, { x: 0, y: 0 }),
      applyToPoint(matrix, { x: image.width, y: 0 }),
      applyToPoint(matrix, { x: 0, y: image.height }),
      applyToPoint(matrix, { x: image.width, y: image.height }),
    ];

    for (const corner of corners) {
      minX = Math.min(minX, corner.x);
      minY = Math.min(minY, corner.y);
      maxX = Math.max(maxX, corner.x);
      maxY = Math.max(maxY, corner.y);
    }
  }

  return {
    minX: Number.isFinite(minX) ? minX : 0,
    minY: Number.isFinite(minY) ? minY : 0,
    maxX: Number.isFinite(maxX) ? maxX : 0,
    maxY: Number.isFinite(maxY) ? maxY : 0,
  };
}

function resolveKeyframes(
  baseAngles: Record<LayerName, number>,
  baseSprites: Record<LayerName, SpriteName>,
  keyframes: AnimationKeyframe[],
): ResolvedKeyframe[] {
  let currentAngles = { ...baseAngles };
  let currentSprites = { ...baseSprites };

  return keyframes.map((keyframe) => {
    currentAngles = {
      ...currentAngles,
      ...keyframe.changes,
    };
    currentSprites = {
      ...currentSprites,
      ...(keyframe.sprites ?? {}),
    };

    return {
      at: keyframe.at,
      angles: currentAngles,
      sprites: currentSprites,
    };
  });
}

function interpolateAngles(
  resolvedKeyframes: ResolvedKeyframe[],
  currentTime: number,
  fallback: Record<LayerName, number>,
) {
  if (resolvedKeyframes.length === 0) {
    return fallback;
  }

  if (currentTime <= resolvedKeyframes[0].at) {
    return resolvedKeyframes[0].angles;
  }

  const lastKeyframe = resolvedKeyframes[resolvedKeyframes.length - 1];

  if (currentTime >= lastKeyframe.at) {
    return lastKeyframe.angles;
  }

  for (let index = 0; index < resolvedKeyframes.length - 1; index += 1) {
    const from = resolvedKeyframes[index];
    const to = resolvedKeyframes[index + 1];

    if (currentTime < from.at || currentTime > to.at) {
      continue;
    }

    const duration = to.at - from.at || 1;
    const progress = (currentTime - from.at) / duration;
    const interpolatedAngles = {} as Record<LayerName, number>;

    for (const layerName of Object.keys(fallback) as LayerName[]) {
      const fromAngle = from.angles[layerName];
      const toAngle = to.angles[layerName];
      interpolatedAngles[layerName] =
        fromAngle + (toAngle - fromAngle) * progress;
    }

    return interpolatedAngles;
  }

  return lastKeyframe.angles;
}

function resolveSpritesAtTime(
  resolvedKeyframes: ResolvedKeyframe[],
  currentTime: number,
  fallback: Record<LayerName, SpriteName>,
) {
  if (resolvedKeyframes.length === 0) {
    return fallback;
  }

  let currentSprites = fallback;

  for (const keyframe of resolvedKeyframes) {
    if (keyframe.at > currentTime) {
      break;
    }

    currentSprites = keyframe.sprites;
  }

  return currentSprites;
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const [sprites, setSprites] = useState<Record<
    SpriteName,
    LoadedSprite
  > | null>(null);
  const [angles, setAngles] = useState(DEFAULT_ANGLES);
  const [baseSprites, setBaseSprites] = useState(DEFAULT_SPRITES);
  const [activeTab, setActiveTab] = useState<"poses" | "animations">("poses");
  const [selectedAnimationId, setSelectedAnimationId] = useState(
    ANIMATION_PRESETS[0]?.id ?? "",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const entries = Object.entries(spriteModules)
      .map(([path, src]) => ({
        name: (path.split("/").pop() ?? path) as SpriteName,
        src,
      }))
      .sort((a, b) => compareLayerNames(a.name, b.name));

    Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        image: await loadImage(entry.src),
      })),
    )
      .then((loadedSprites) => {
        const spriteMap = loadedSprites.reduce<
          Record<SpriteName, LoadedSprite>
        >(
          (accumulator, sprite) => {
            accumulator[sprite.name] = sprite;
            return accumulator;
          },
          {} as Record<SpriteName, LoadedSprite>,
        );

        setSprites(spriteMap);
      })
      .catch((error: unknown) => {
        console.error("Falha ao carregar as camadas retro.", error);
      });
  }, []);

  const selectedAnimation = useMemo(
    () =>
      ANIMATION_PRESETS.find((preset) => preset.id === selectedAnimationId) ??
      null,
    [selectedAnimationId],
  );

  const resolvedKeyframes = useMemo(
    () =>
      selectedAnimation
        ? resolveKeyframes(angles, baseSprites, selectedAnimation.keyframes)
        : [],
    [angles, baseSprites, selectedAnimation],
  );

  const totalDuration =
    resolvedKeyframes[resolvedKeyframes.length - 1]?.at ?? 0;

  const displayAngles = useMemo(() => {
    if (!selectedAnimation) {
      return angles;
    }

    if (!isPlaying && currentTime === 0) {
      return angles;
    }

    return interpolateAngles(resolvedKeyframes, currentTime, angles);
  }, [angles, currentTime, isPlaying, resolvedKeyframes, selectedAnimation]);

  const displaySpriteSelection = useMemo(() => {
    if (!selectedAnimation) {
      return baseSprites;
    }

    if (!isPlaying && currentTime === 0) {
      return baseSprites;
    }

    return resolveSpritesAtTime(resolvedKeyframes, currentTime, baseSprites);
  }, [
    baseSprites,
    currentTime,
    isPlaying,
    resolvedKeyframes,
    selectedAnimation,
  ]);

  const displayImages = useMemo(() => {
    if (!sprites) {
      return null;
    }

    const images = {} as Record<LayerName, HTMLImageElement>;

    for (const layerName of DRAW_ORDER) {
      const spriteName = displaySpriteSelection[layerName];
      const sprite = sprites[spriteName];

      if (!sprite) {
        continue;
      }

      images[layerName] = sprite.image;
    }

    return images;
  }, [displaySpriteSelection, sprites]);

  useEffect(() => {
    if (!isPlaying || !selectedAnimation || totalDuration <= 0) {
      lastTickRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      const lastTick = lastTickRef.current ?? timestamp;
      const delta = timestamp - lastTick;
      lastTickRef.current = timestamp;

      setCurrentTime((previous) => {
        const next = previous + delta;
        return next > totalDuration ? 0 : next;
      });

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      lastTickRef.current = null;
    };
  }, [isPlaying, selectedAnimation, totalDuration]);

  const scene = useMemo(() => {
    if (!displayImages) {
      return null;
    }

    const preliminaryMatrices = computeWorldMatrices(
      DRAW_ORDER,
      displayAngles,
      createIdentityMatrix(),
    );
    const bounds = computeBounds(displayImages, preliminaryMatrices);
    const rootMatrix = createTranslationMatrix(
      CANVAS_PADDING - bounds.minX,
      CANVAS_PADDING - bounds.minY,
    );
    const worldMatrices = computeWorldMatrices(
      DRAW_ORDER,
      displayAngles,
      rootMatrix,
    );
    const finalBounds = computeBounds(displayImages, worldMatrices);

    return {
      width: Math.ceil(
        finalBounds.maxX - finalBounds.minX + CANVAS_PADDING * 2,
      ),
      height: Math.ceil(
        finalBounds.maxY - finalBounds.minY + CANVAS_PADDING * 2,
      ),
      worldMatrices,
    };
  }, [displayAngles, displayImages]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !scene || !displayImages) {
      return;
    }

    canvas.width = scene.width;
    canvas.height = scene.height;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#11161f";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;

    for (const layerName of DRAW_ORDER) {
      const matrix = scene.worldMatrices.get(layerName);
      const image = displayImages[layerName];

      if (!matrix || !image) {
        continue;
      }

      context.setTransform(
        matrix.a,
        matrix.b,
        matrix.c,
        matrix.d,
        matrix.e,
        matrix.f,
      );
      context.drawImage(image, 0, 0);
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
  }, [displayImages, scene]);

  const handleAngleChange = (layerName: LayerName, value: string) => {
    setIsPlaying(false);
    lastTickRef.current = null;
    setCurrentTime(0);
    setAngles(() => {
      const nextAngles = {} as Record<LayerName, number>;

      for (const name of Object.keys(DEFAULT_ANGLES) as LayerName[]) {
        nextAngles[name] = Math.round(displayAngles[name]);
      }

      nextAngles[layerName] = Number(value);
      return nextAngles;
    });
    setBaseSprites(displaySpriteSelection);
  };

  const handleAnimationChange = (value: string) => {
    setSelectedAnimationId(value);
    setCurrentTime(0);
    setIsPlaying(false);
    lastTickRef.current = null;
  };

  const handleTimelineChange = (value: string) => {
    setCurrentTime(Number(value));
    setIsPlaying(false);
    lastTickRef.current = null;
  };

  const togglePlayback = () => {
    if (!selectedAnimation) {
      return;
    }

    setIsPlaying((current) => !current);
  };

  const resetPose = () => {
    setAngles(DEFAULT_ANGLES);
    setBaseSprites(DEFAULT_SPRITES);
    setCurrentTime(0);
    setIsPlaying(false);
    lastTickRef.current = null;
  };

  if (!scene) {
    return <p className="canvas-status">Carregando camadas retro...</p>;
  }

  return (
    <div className="assembly-layout">
      <div className="controls-panel">
        <div className="tab-bar" role="tablist" aria-label="Controles da retro">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "poses"}
            className={`tab-button${activeTab === "poses" ? " is-active" : ""}`}
            onClick={() => setActiveTab("poses")}
          >
            Poses
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "animations"}
            className={`tab-button${activeTab === "animations" ? " is-active" : ""}`}
            onClick={() => setActiveTab("animations")}
          >
            Animacoes
          </button>
        </div>

        {activeTab === "poses" && (
          <div className="controls-group">
            <div className="controls-header">
              <h2>Poses</h2>
              <button
                type="button"
                className="reset-button"
                onClick={resetPose}
              >
                Resetar
              </button>
            </div>

            {CONTROLLABLE_LAYERS.map((layerName) => {
              const config = LAYER_CONFIG[layerName];
              const displayValue = displayAngles[layerName];
              const sliderValue = Math.round(displayValue);

              return (
                <label key={layerName} className="slider-control">
                  <span className="slider-title">{config.label}</span>
                  <span className="slider-value">{sliderValue} deg</span>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step="1"
                    value={sliderValue}
                    onChange={(event) =>
                      handleAngleChange(layerName, event.currentTarget.value)
                    }
                  />
                  <span className="slider-layer">{layerName}</span>
                  <span className="slider-layer">
                    sprite: {displaySpriteSelection[layerName]}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {activeTab === "animations" && (
          <div className="controls-group">
            <div className="controls-header">
              <h2>Animacoes</h2>
              <button
                type="button"
                className="reset-button"
                onClick={togglePlayback}
                disabled={!selectedAnimation}
              >
                {isPlaying ? "Pausar" : "Tocar"}
              </button>
            </div>

            <label className="slider-control">
              <span className="slider-title">Preset</span>
              <select
                className="animation-select"
                value={selectedAnimationId}
                onChange={(event) =>
                  handleAnimationChange(event.currentTarget.value)
                }
              >
                {ANIMATION_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="slider-control">
              <span className="slider-title">Timeline</span>
              <span className="slider-value">
                {Math.round(currentTime)} ms / {totalDuration} ms
              </span>
              <input
                type="range"
                min="0"
                max={String(totalDuration)}
                step="1"
                value={currentTime}
                onChange={(event) =>
                  handleTimelineChange(event.currentTarget.value)
                }
              />
            </label>

            {selectedAnimation && (
              <div className="keyframe-list">
                {selectedAnimation.keyframes.map((keyframe, index) => (
                  <div key={keyframe.at} className="keyframe-card">
                    <strong>Keyframe {index}</strong>
                    <span>{keyframe.at} ms</span>
                    <code>{JSON.stringify(keyframe)}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="canvas-scroll">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          aria-label="Canvas com a retro montada e articulada"
        />
      </div>
    </div>
  );
}
