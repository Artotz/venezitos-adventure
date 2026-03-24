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

type LoadedLayer = {
  name: LayerName;
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

const layerModules = import.meta.glob("../assets/retro/*", {
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
  layers: LoadedLayer[],
  angles: Record<LayerName, number>,
  rootMatrix: Matrix2D,
) {
  const layerMap = new Map(layers.map((layer) => [layer.name, layer]));
  const worldMatrices = new Map<LayerName, Matrix2D>();

  const resolveLayerMatrix = (layerName: LayerName): Matrix2D => {
    const cached = worldMatrices.get(layerName);

    if (cached) {
      return cached;
    }

    const layerConfig = LAYER_CONFIG[layerName];

    if (!layerMap.has(layerName)) {
      const identity = createIdentityMatrix();
      worldMatrices.set(layerName, identity);
      return identity;
    }

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
    resolveLayerMatrix(layer.name);
  }

  return worldMatrices;
}

function computeBounds(
  layers: LoadedLayer[],
  worldMatrices: Map<LayerName, Matrix2D>,
) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const layer of layers) {
    const matrix = worldMatrices.get(layer.name);

    if (!matrix) {
      continue;
    }

    const corners = [
      applyToPoint(matrix, { x: 0, y: 0 }),
      applyToPoint(matrix, { x: layer.image.width, y: 0 }),
      applyToPoint(matrix, { x: 0, y: layer.image.height }),
      applyToPoint(matrix, { x: layer.image.width, y: layer.image.height }),
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

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [layers, setLayers] = useState<LoadedLayer[]>([]);
  const [angles, setAngles] = useState(DEFAULT_ANGLES);

  useEffect(() => {
    const entries = Object.entries(layerModules)
      .map(([path, src]) => ({
        name: (path.split("/").pop() ?? path) as LayerName,
        src,
      }))
      .sort((a, b) => compareLayerNames(a.name, b.name));

    Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        image: await loadImage(entry.src),
      })),
    )
      .then(setLayers)
      .catch((error: unknown) => {
        console.error("Falha ao carregar as camadas retro.", error);
      });
  }, []);

  const scene = useMemo(() => {
    if (layers.length === 0) {
      return null;
    }

    const preliminaryMatrices = computeWorldMatrices(
      layers,
      angles,
      createIdentityMatrix(),
    );
    const bounds = computeBounds(layers, preliminaryMatrices);
    const rootMatrix = createTranslationMatrix(
      CANVAS_PADDING - bounds.minX,
      CANVAS_PADDING - bounds.minY,
    );
    const worldMatrices = computeWorldMatrices(layers, angles, rootMatrix);
    const finalBounds = computeBounds(layers, worldMatrices);

    return {
      width: Math.ceil(
        finalBounds.maxX - finalBounds.minX + CANVAS_PADDING * 2,
      ),
      height: Math.ceil(
        finalBounds.maxY - finalBounds.minY + CANVAS_PADDING * 2,
      ),
      worldMatrices,
    };
  }, [angles, layers]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !scene) {
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
      const layer = layers.find((entry) => entry.name === layerName);

      if (!layer) {
        continue;
      }

      const matrix = scene.worldMatrices.get(layer.name);

      if (!matrix) {
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
      context.drawImage(layer.image, 0, 0);
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
  }, [layers, scene]);

  const handleAngleChange = (layerName: LayerName, value: string) => {
    setAngles((current) => ({
      ...current,
      [layerName]: Number(value),
    }));
  };

  const resetAngles = () => {
    setAngles(DEFAULT_ANGLES);
  };

  if (layers.length === 0 || !scene) {
    return <p className="canvas-status">Carregando camadas retro...</p>;
  }

  return (
    <div className="assembly-layout">
      <div className="controls-panel">
        <div className="controls-header">
          <h2>Rotacoes</h2>
          <button type="button" className="reset-button" onClick={resetAngles}>
            Zerar
          </button>
        </div>

        {CONTROLLABLE_LAYERS.map((layerName) => {
          const config = LAYER_CONFIG[layerName];
          const value = angles[layerName];

          return (
            <label key={layerName} className="slider-control">
              <span className="slider-title">{config.label}</span>
              <span className="slider-value">{value}°</span>
              <input
                type="range"
                min={config.min}
                max={config.max}
                step="1"
                value={value}
                onChange={(event) =>
                  handleAngleChange(layerName, event.currentTarget.value)
                }
              />
              <span className="slider-layer">{layerName}</span>
            </label>
          );
        })}
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
