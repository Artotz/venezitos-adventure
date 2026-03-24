import { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };
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
};
type SparseAngles = Partial<Record<LayerName, number>>;
type SparseSprites = Partial<Record<LayerName, SpriteName>>;
type AnimationKeyframe = {
  at: number;
  changes: SparseAngles;
  sprites?: SparseSprites;
};
type AnimationPreset = {
  id: "idle" | "idle2" | "arm-extended";
  keyframes: AnimationKeyframe[];
};
type ResolvedKeyframe = {
  at: number;
  angles: Record<LayerName, number>;
  sprites: Record<LayerName, SpriteName>;
};
type MapEventType = "pickup" | "dump" | "dig" | "traction";
type EventStatus = "hidden" | "upcoming" | "active" | "resolved" | "missed";
type MapEvent = {
  id: number;
  type: MapEventType;
  visualX: number;
  hitboxX: number;
  status: EventStatus;
};
type ActiveAnimation = {
  presetId: AnimationPreset["id"];
  elapsed: number;
  lockMovement: boolean;
  onComplete?: () => void;
};
type LoadedSpriteMap = Record<SpriteName, HTMLImageElement>;

const spriteModules = import.meta.glob("../assets/retro/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const CANVAS_WIDTH = 1560;
const CANVAS_HEIGHT = 620;
const GROUND_Y = 485;
const PLAYER_SCREEN_X = 980;
const PLAYER_HIT_LINE_X = PLAYER_SCREEN_X - 96;
const BASE_SPEED = 220;
const LOW_TRACTION_SPEED = 72;
const EVENT_HITBOX_HALF_WIDTH = 70;
const EVENT_BUTTON = "E";

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
  },
  "Camada 2.png": {
    parent: "Camada 1.png",
    parentPoint: { x: 9, y: 137 },
    childPoint: { x: 78, y: 32 },
  },
  "Camada 3.png": { parent: null, parentPoint: null, childPoint: null },
  "Camada 4.png": {
    parent: "Camada 3.png",
    parentPoint: { x: 50, y: 200 },
    childPoint: { x: 42, y: 45 },
  },
  "Camada 5.png": {
    parent: "Camada 3.png",
    parentPoint: { x: 230, y: 180 },
    childPoint: { x: 60, y: 63 },
  },
  "Camada 6.png": {
    parent: "Camada 3.png",
    parentPoint: { x: 330, y: 180 },
    childPoint: { x: 46, y: 230 },
  },
  "Camada 7.png": {
    parent: "Camada 6.png",
    parentPoint: { x: 90, y: 16 },
    childPoint: { x: 16, y: 18 },
  },
  "Camada 8.png": {
    parent: "Camada 7.png",
    parentPoint: { x: 103, y: 180 },
    childPoint: { x: 66, y: 49 },
  },
};

const BASE_ANGLES: Record<LayerName, number> = {
  "Camada 1.png": 18,
  "Camada 2.png": -24,
  "Camada 3.png": 0,
  "Camada 4.png": 0,
  "Camada 5.png": 0,
  "Camada 6.png": 12,
  "Camada 7.png": 11,
  "Camada 8.png": -18,
};

const BASE_SPRITES: Record<LayerName, SpriteName> = {
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
    keyframes: [
      { at: 0, changes: {} },
      { at: 1200, changes: { "Camada 1.png": 75, "Camada 2.png": -24 } },
      { at: 2400, changes: { "Camada 2.png": -92 } },
    ],
  },
  {
    id: "arm-extended",
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
];

const EVENT_CONFIG: Record<
  MapEventType,
  { key: string; title: string; description: string; hint: string }
> = {
  pickup: {
    key: EVENT_BUTTON,
    title: "Apanhar terra",
    description: "Punhado de terra no caminho",
    hint: "Roda o ciclo de cacamba 1 sem parar a maquina.",
  },
  dump: {
    key: EVENT_BUTTON,
    title: "Descarregar terra",
    description: "Caminhao no background",
    hint: "Para a maquina e roda o ciclo de cacamba 2. Exige terra carregada.",
  },
  dig: {
    key: EVENT_BUTTON,
    title: "Cavar vala",
    description: "Sinalizacao no background",
    hint: "Para a maquina e roda o braco estendido.",
  },
  traction: {
    key: EVENT_BUTTON,
    title: "Ligar 4x4",
    description: "Lamacal no caminho",
    hint: "A maquina desacelera ate voce apertar o botao.",
  },
};

const INITIAL_EVENTS: MapEvent[] = [
  { id: 0, type: "pickup", visualX: 760, hitboxX: 700, status: "upcoming" },
  { id: 1, type: "traction", visualX: 1730, hitboxX: 1650, status: "upcoming" },
  { id: 2, type: "dig", visualX: 2800, hitboxX: 2720, status: "upcoming" },
  { id: 3, type: "pickup", visualX: 3880, hitboxX: 3820, status: "upcoming" },
  { id: 4, type: "dump", visualX: 5060, hitboxX: 4980, status: "hidden" },
  { id: 5, type: "traction", visualX: 6230, hitboxX: 6150, status: "upcoming" },
  { id: 6, type: "pickup", visualX: 7410, hitboxX: 7350, status: "upcoming" },
  { id: 7, type: "dig", visualX: 8600, hitboxX: 8520, status: "upcoming" },
  { id: 8, type: "dump", visualX: 9830, hitboxX: 9750, status: "hidden" },
];

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
function createTranslationMatrix(x: number, y: number): Matrix2D {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y };
}
function createRotationMatrix(angleInRadians: number): Matrix2D {
  const cosine = Math.cos(angleInRadians);
  const sine = Math.sin(angleInRadians);
  return { a: cosine, b: sine, c: -sine, d: cosine, e: 0, f: 0 };
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
function applyToPoint(matrix: Matrix2D, point: Point): Point {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  };
}

function computeWorldMatrices(
  angles: Record<LayerName, number>,
  rootMatrix: Matrix2D,
) {
  const worldMatrices = new Map<LayerName, Matrix2D>();
  const resolveLayerMatrix = (layerName: LayerName): Matrix2D => {
    const cached = worldMatrices.get(layerName);
    if (cached) return cached;
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
  for (const layer of DRAW_ORDER) resolveLayerMatrix(layer);
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
    if (!matrix || !image) continue;
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
    currentAngles = { ...currentAngles, ...keyframe.changes };
    currentSprites = { ...currentSprites, ...(keyframe.sprites ?? {}) };
    return { at: keyframe.at, angles: currentAngles, sprites: currentSprites };
  });
}

function interpolateAngles(
  resolvedKeyframes: ResolvedKeyframe[],
  currentTime: number,
  fallback: Record<LayerName, number>,
) {
  if (resolvedKeyframes.length === 0) return fallback;
  if (currentTime <= resolvedKeyframes[0].at)
    return resolvedKeyframes[0].angles;
  const lastKeyframe = resolvedKeyframes[resolvedKeyframes.length - 1];
  if (currentTime >= lastKeyframe.at) return lastKeyframe.angles;
  for (let index = 0; index < resolvedKeyframes.length - 1; index += 1) {
    const from = resolvedKeyframes[index];
    const to = resolvedKeyframes[index + 1];
    if (currentTime < from.at || currentTime > to.at) continue;
    const duration = to.at - from.at || 1;
    const progress = (currentTime - from.at) / duration;
    const interpolatedAngles = {} as Record<LayerName, number>;
    for (const layerName of Object.keys(fallback) as LayerName[]) {
      interpolatedAngles[layerName] =
        from.angles[layerName] +
        (to.angles[layerName] - from.angles[layerName]) * progress;
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
  if (resolvedKeyframes.length === 0) return fallback;
  let currentSprites = fallback;
  for (const keyframe of resolvedKeyframes) {
    if (keyframe.at > currentTime) break;
    currentSprites = keyframe.sprites;
  }
  return currentSprites;
}

function getTotalDuration(presetId: AnimationPreset["id"]) {
  const preset = ANIMATION_PRESETS.find((item) => item.id === presetId);
  return preset?.keyframes[preset.keyframes.length - 1]?.at ?? 0;
}

function getEventVisualScreenX(event: MapEvent, distance: number) {
  return PLAYER_SCREEN_X - (event.visualX - distance);
}

function getEventHitboxScreenX(event: MapEvent, distance: number) {
  return PLAYER_SCREEN_X - (event.hitboxX - distance);
}

function updateEventStatus(
  events: MapEvent[],
  eventId: number,
  status: EventStatus,
) {
  return events.map((event) =>
    event.id === eventId ? { ...event, status } : event,
  );
}

function revealNextDumpEvent(events: MapEvent[]) {
  const nextDump = events.find(
    (event) => event.type === "dump" && event.status === "hidden",
  );
  if (!nextDump) return events;
  return updateEventStatus(events, nextDump.id, "upcoming");
}

function cloneEvents(events: MapEvent[]) {
  return events.map((event) => ({ ...event }));
}

export function Phase1Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const [sprites, setSprites] = useState<LoadedSpriteMap | null>(null);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(BASE_SPEED);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [fails, setFails] = useState(0);
  const [loadedDirt, setLoadedDirt] = useState(false);
  const [rearLoaded, setRearLoaded] = useState(false);
  const [message, setMessage] = useState(
    "A retro anda para a esquerda. Responda aos eventos quando eles chegarem.",
  );
  const [events, setEvents] = useState<MapEvent[]>(() =>
    cloneEvents(INITIAL_EVENTS),
  );
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [activeAnimationLabel, setActiveAnimationLabel] =
    useState("Rodagem continua");

  const eventsRef = useRef<MapEvent[]>(cloneEvents(INITIAL_EVENTS));
  const activeEventIdRef = useRef<number | null>(null);
  const loadedDirtRef = useRef(false);
  const rearLoadedRef = useRef(false);
  const activeAnimationRef = useRef<ActiveAnimation | null>(null);
  const currentSpeedRef = useRef(BASE_SPEED);
  const distanceRef = useRef(0);

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
        const spriteMap = loadedSprites.reduce<LoadedSpriteMap>(
          (accumulator, sprite) => {
            accumulator[sprite.name] = sprite.image;
            return accumulator;
          },
          {} as LoadedSpriteMap,
        );
        setSprites(spriteMap);
      })
      .catch((error: unknown) => {
        console.error("Falha ao carregar as camadas retro.", error);
      });
  }, []);

  const excavatorScene = useMemo(() => {
    if (!sprites) return null;
    const images = {} as Record<LayerName, HTMLImageElement>;
    for (const layerName of DRAW_ORDER)
      images[layerName] = sprites[BASE_SPRITES[layerName]];
    const preliminaryMatrices = computeWorldMatrices(
      BASE_ANGLES,
      createIdentityMatrix(),
    );
    const bounds = computeBounds(images, preliminaryMatrices);
    const worldMatrices = computeWorldMatrices(
      BASE_ANGLES,
      createTranslationMatrix(-bounds.minX, -bounds.minY),
    );
    const finalBounds = computeBounds(images, worldMatrices);
    return {
      width: finalBounds.maxX - finalBounds.minX,
      height: finalBounds.maxY - finalBounds.minY,
    };
  }, [sprites]);

  const resolveEvent = (eventId: number, nextMessage: string) => {
    const nextEvents = updateEventStatus(
      eventsRef.current,
      eventId,
      "resolved",
    );
    eventsRef.current = nextEvents;
    setEvents(nextEvents);
    setActiveEventId(null);
    activeEventIdRef.current = null;
    setHits((current) => current + 1);
    setMessage(nextMessage);
  };

  const onPickupAnimationComplete = () => {
    setLoadedDirt(true);
    loadedDirtRef.current = true;
    const nextEvents = revealNextDumpEvent(eventsRef.current);
    eventsRef.current = nextEvents;
    setEvents(nextEvents);
  };

  const onDumpAnimationComplete = () => {
    setLoadedDirt(false);
    loadedDirtRef.current = false;
  };

  const onRearAnimationComplete = () => {
    setRearLoaded(true);
    rearLoadedRef.current = true;
  };

  const failEvent = (eventId: number, nextMessage: string) => {
    const nextEvents = updateEventStatus(eventsRef.current, eventId, "missed");
    eventsRef.current = nextEvents;
    setEvents(nextEvents);
    setActiveEventId(null);
    activeEventIdRef.current = null;
    setFails((current) => current + 1);
    setScore((current) => Math.max(0, current - 90));
    setMessage(nextMessage);
  };

  const startAnimation = (
    presetId: AnimationPreset["id"],
    label: string,
    lockMovement: boolean,
    onComplete?: () => void,
  ) => {
    activeAnimationRef.current = {
      presetId,
      elapsed: 0,
      lockMovement,
      onComplete,
    };
    setActiveAnimationLabel(label);
  };

  useEffect(() => {
    loadedDirtRef.current = loadedDirt;
  }, [loadedDirt]);

  useEffect(() => {
    rearLoadedRef.current = rearLoaded;
  }, [rearLoaded]);

  useEffect(() => {
    currentSpeedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  useEffect(() => {
    activeEventIdRef.current = activeEventId;
  }, [activeEventId]);

  useEffect(() => {
    if (!sprites) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeEvent = eventsRef.current.find(
        (item) => item.id === activeEventIdRef.current,
      );
      if (!activeEvent) return;
      const pressedKey =
        event.key.length === 1 ? event.key.toUpperCase() : event.key;
      const config = EVENT_CONFIG[activeEvent.type];
      if (pressedKey !== config.key) return;
      const screenX = getEventHitboxScreenX(activeEvent, distanceRef.current);
      if (Math.abs(screenX - PLAYER_HIT_LINE_X) > EVENT_HITBOX_HALF_WIDTH) {
        setFails((current) => current + 1);
        setScore((current) => Math.max(0, current - 50));
        setMessage("Fora da hitbox do evento.");
        return;
      }

      if (activeEvent.type === "pickup") {
        resolveEvent(
          activeEvent.id,
          "Terra apanhada. A cacamba esta carregada.",
        );
        setScore((current) => current + 180);
        startAnimation(
          "idle",
          "Ciclo de cacamba 1",
          false,
          onPickupAnimationComplete,
        );
        return;
      }

      if (activeEvent.type === "dump") {
        if (!loadedDirtRef.current) {
          setMessage(
            "Nao ha terra na cacamba. Apanhe terra antes de descarregar.",
          );
          setScore((current) => Math.max(0, current - 35));
          return;
        }
        resolveEvent(
          activeEvent.id,
          "Terra descarregada no caminhao.",
        );
        setScore((current) => current + 180);
        startAnimation(
          "idle2",
          "Ciclo de cacamba 2",
          true,
          onDumpAnimationComplete,
        );
        return;
      }

      if (activeEvent.type === "dig") {
        resolveEvent(
          activeEvent.id,
          "Vala cavada. O braco completou a abertura.",
        );
        setScore((current) => current + 180);
        startAnimation(
          "arm-extended",
          "Braco estendido",
          true,
          onRearAnimationComplete,
        );
        return;
      }

      resolveEvent(
        activeEvent.id,
        "4x4 ligado. A tracao voltou ao normal.",
      );
      setScore((current) => current + 180);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sprites]);

  useEffect(() => {
    if (!sprites) return;

    const update = (dt: number) => {
      const activeAnimation = activeAnimationRef.current;
      const activeEvent = eventsRef.current.find(
        (item) => item.id === activeEventIdRef.current,
      );

      if (activeAnimation) {
        activeAnimation.elapsed += dt * 1000;
        const totalDuration = getTotalDuration(activeAnimation.presetId);
        if (activeAnimation.elapsed >= totalDuration) {
          const onComplete = activeAnimation.onComplete;
          activeAnimationRef.current = null;
          setActiveAnimationLabel("Rodagem continua");
          onComplete?.();
        }
      }

      let targetSpeed = BASE_SPEED;
      if (activeEvent?.type === "traction") targetSpeed = LOW_TRACTION_SPEED;
      if (activeAnimationRef.current?.lockMovement) targetSpeed = 0;

      const nextSpeed =
        currentSpeedRef.current +
        (targetSpeed - currentSpeedRef.current) * Math.min(1, dt * 4);
      currentSpeedRef.current = nextSpeed;
      setSpeed(nextSpeed);

      const nextDistance = distanceRef.current + nextSpeed * dt;
      distanceRef.current = nextDistance;
      setDistance(nextDistance);
      setScore((current) => current + Math.round(nextSpeed * dt * 0.08));

      const nextUpcoming = eventsRef.current.find(
        (item) => item.status === "upcoming",
      );
      if (nextUpcoming) {
        const screenX = getEventHitboxScreenX(nextUpcoming, nextDistance);
        if (Math.abs(screenX - PLAYER_HIT_LINE_X) <= EVENT_HITBOX_HALF_WIDTH) {
          const nextEvents = updateEventStatus(
            eventsRef.current,
            nextUpcoming.id,
            "active",
          );
          eventsRef.current = nextEvents;
          setEvents(nextEvents);
          setActiveEventId(nextUpcoming.id);
          activeEventIdRef.current = nextUpcoming.id;
          setMessage(
            `${EVENT_CONFIG[nextUpcoming.type].title}: pressione ${EVENT_CONFIG[nextUpcoming.type].key}.`,
          );
        }
      }

      const currentActiveEvent = eventsRef.current.find(
        (item) => item.id === activeEventIdRef.current,
      );
      if (!currentActiveEvent) return;

      const screenX = getEventHitboxScreenX(currentActiveEvent, nextDistance);
      if (screenX > PLAYER_HIT_LINE_X + EVENT_HITBOX_HALF_WIDTH) {
        failEvent(currentActiveEvent.id, "O evento passou da hitbox sem resposta.");
        return;
      }
      if (screenX > PLAYER_HIT_LINE_X + EVENT_HITBOX_HALF_WIDTH) {
        failEvent(currentActiveEvent.id, "O evento passou do centro sem resposta.");
        return;
      }
      if (
        currentActiveEvent.type === "pickup" &&
        screenX > PLAYER_HIT_LINE_X + EVENT_HITBOX_HALF_WIDTH
      ) {
        failEvent(
          currentActiveEvent.id,
          "O punhado de terra passou sem ser apanhado.",
        );
      }

      if (
        currentActiveEvent.type === "traction" &&
        screenX > PLAYER_HIT_LINE_X + EVENT_HITBOX_HALF_WIDTH &&
        currentSpeedRef.current <= LOW_TRACTION_SPEED + 8
      ) {
        failEvent(
          currentActiveEvent.id,
          "O lamaçal travou a passagem antes de ligar o 4x4.",
        );
      }
    };

    const frame = (timestamp: number) => {
      const lastTick = lastTickRef.current ?? timestamp;
      const dt = Math.min((timestamp - lastTick) / 1000, 0.08);
      lastTickRef.current = timestamp;
      update(dt);
      animationFrameRef.current = window.requestAnimationFrame(frame);
    };

    animationFrameRef.current = window.requestAnimationFrame(frame);
    return () => {
      if (animationFrameRef.current !== null)
        window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      lastTickRef.current = null;
    };
  }, [sprites]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !excavatorScene || !sprites) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const context = canvas.getContext("2d");
    if (!context) return;

    const activeAnimation = activeAnimationRef.current;
    const wheelSpin = (-distance * 0.92) % 360;

    let displayAngles: Record<LayerName, number> = {
      ...BASE_ANGLES,
      "Camada 1.png": BASE_ANGLES["Camada 1.png"],
      "Camada 2.png": BASE_ANGLES["Camada 2.png"],
      "Camada 4.png": wheelSpin,
      "Camada 5.png": wheelSpin,
      "Camada 6.png": BASE_ANGLES["Camada 6.png"],
      "Camada 7.png": BASE_ANGLES["Camada 7.png"],
      "Camada 8.png": BASE_ANGLES["Camada 8.png"],
      "Camada 3.png": 0,
    };

    let displaySprites = BASE_SPRITES;

    if (loadedDirt && !activeAnimation) {
      const pickupPreset =
        ANIMATION_PRESETS.find((item) => item.id === "idle") ?? null;
      if (pickupPreset) {
        const resolvedKeyframes = resolveKeyframes(
          displayAngles,
          displaySprites,
          pickupPreset.keyframes,
        );
        const totalDuration = getTotalDuration("idle");
        displayAngles = interpolateAngles(
          resolvedKeyframes,
          totalDuration,
          displayAngles,
        );
        displaySprites = resolveSpritesAtTime(
          resolvedKeyframes,
          totalDuration,
          displaySprites,
        );
      }
    }

    if (rearLoaded && !activeAnimation) {
      const rearPreset =
        ANIMATION_PRESETS.find((item) => item.id === "arm-extended") ?? null;
      if (rearPreset) {
        const resolvedKeyframes = resolveKeyframes(
          displayAngles,
          displaySprites,
          rearPreset.keyframes,
        );
        const totalDuration = getTotalDuration("arm-extended");
        displayAngles = interpolateAngles(
          resolvedKeyframes,
          totalDuration,
          displayAngles,
        );
        displaySprites = resolveSpritesAtTime(
          resolvedKeyframes,
          totalDuration,
          displaySprites,
        );
      }
    }

    if (activeAnimation) {
      const preset =
        ANIMATION_PRESETS.find(
          (item) => item.id === activeAnimation.presetId,
        ) ?? null;
      if (preset) {
        const resolvedKeyframes = resolveKeyframes(
          displayAngles,
          displaySprites,
          preset.keyframes,
        );
        displayAngles = interpolateAngles(
          resolvedKeyframes,
          activeAnimation.elapsed,
          displayAngles,
        );
        displaySprites = resolveSpritesAtTime(
          resolvedKeyframes,
          activeAnimation.elapsed,
          displaySprites,
        );
      }
    }

    const images = {} as Record<LayerName, HTMLImageElement>;
    for (const layerName of DRAW_ORDER)
      images[layerName] = sprites[displaySprites[layerName]];

    const machineY = GROUND_Y - excavatorScene.height + 60;
    const worldMatrices = computeWorldMatrices(
      displayAngles,
      createTranslationMatrix(
        PLAYER_SCREEN_X - excavatorScene.width / 2,
        machineY,
      ),
    );

    context.clearRect(0, 0, canvas.width, canvas.height);
    const skyGradient = context.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, "#3d78b2");
    skyGradient.addColorStop(0.5, "#87b6df");
    skyGradient.addColorStop(1, "#d9c58d");
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawBackground(context, distance, events, activeEventId);
    drawGround(context, distance, events, activeEventId);
    context.imageSmoothingEnabled = false;

    for (const layerName of DRAW_ORDER) {
      const matrix = worldMatrices.get(layerName);
      const image = images[layerName];
      if (!matrix || !image) continue;
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
    drawForeground(context, distance);
    drawCenterGuide(
      context,
      PLAYER_HIT_LINE_X,
      machineY + 70,
      machineY + excavatorScene.height - 20,
      activeEventId !== null,
    );
  }, [activeEventId, distance, events, excavatorScene, sprites]);

  if (!excavatorScene) {
    return <p className="canvas-status">Carregando fase 1...</p>;
  }

  const activeEvent =
    activeEventId !== null
      ? (events.find((event) => event.id === activeEventId) ?? null)
      : null;
  const nextEvent = events.find((event) => event.status === "upcoming") ?? null;

  return (
    <div className="phase-layout">
      <div className="phase-sidebar">
        <div className="phase-card">
          <p className="phase-label">Fase 1</p>
          <h2>Estrada para a esquerda</h2>
          <p className="phase-copy">
            A retroescavadeira avanca para a esquerda e os eventos aparecem no
            proprio mapa.
          </p>
        </div>

        <div className="phase-card phase-stats">
          <div>
            <span className="stat-label">Pontuacao</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span className="stat-label">Distancia</span>
            <strong>{Math.floor(distance / 10)} m</strong>
          </div>
          <div>
            <span className="stat-label">Velocidade</span>
            <strong>{Math.round(speed)}</strong>
          </div>
          <div>
            <span className="stat-label">Terra</span>
            <strong>{loadedDirt ? "Cheia" : "Vazia"}</strong>
          </div>
        </div>

        <div className="phase-card phase-stats">
          <div>
            <span className="stat-label">Acertos</span>
            <strong>{hits}</strong>
          </div>
          <div>
            <span className="stat-label">Falhas</span>
            <strong>{fails}</strong>
          </div>
          <div>
            <span className="stat-label">Animacao</span>
            <strong>{activeAnimationLabel}</strong>
          </div>
          <div>
            <span className="stat-label">Controles</span>
            <strong>{EVENT_BUTTON}</strong>
          </div>
        </div>

        <div className="phase-card">
          <p className="phase-label">Status</p>
          <p className="phase-hint">{message}</p>
        </div>

        <div className="phase-card event-card">
          <p className="phase-label">Evento Atual</p>
          {activeEvent ? (
            <>
              <h3>{EVENT_CONFIG[activeEvent.type].title}</h3>
              <p>{EVENT_CONFIG[activeEvent.type].description}</p>
              <p>
                Pressione <strong>{EVENT_CONFIG[activeEvent.type].key}</strong>{" "}
                para responder.
              </p>
              <p className="phase-copy">
                {EVENT_CONFIG[activeEvent.type].hint}
              </p>
            </>
          ) : (
            <p className="phase-copy">
              Nenhum evento em contato com a maquina.
            </p>
          )}
        </div>

        <div className="phase-card">
          <p className="phase-label">Proximo do mapa</p>
          {nextEvent ? (
              <p className="phase-copy">
              {EVENT_CONFIG[nextEvent.type].title} em aproximadamente{" "}
              {Math.max(0, Math.round((nextEvent.hitboxX - distance) / 10))} m.
            </p>
          ) : (
            <p className="phase-copy">
              Todos os eventos dessa sequencia foram consumidos.
            </p>
          )}
        </div>
      </div>

      <div className="phase-canvas-frame">
        <canvas
          ref={canvasRef}
          className="phase-canvas"
          aria-label="Fase 1 com a retroescavadeira andando infinitamente para a esquerda"
        />
      </div>
    </div>
  );
}

function drawBackground(
  context: CanvasRenderingContext2D,
  distance: number,
  events: MapEvent[],
  activeEventId: number | null,
) {
  const farOffset = (distance * 0.08) % 320;
  const midOffset = (distance * 0.18) % 280;

  context.fillStyle = "rgba(255, 244, 214, 0.25)";
  context.beginPath();
  context.arc(910, 110, 58, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#6d8b57";
  for (let x = farOffset - 320; x < CANVAS_WIDTH + 320; x += 320) {
    context.beginPath();
    context.moveTo(x, 480);
    context.lineTo(x + 140, 350);
    context.lineTo(x + 300, 480);
    context.closePath();
    context.fill();
  }

  context.fillStyle = "#8f6c46";
  for (let x = midOffset - 280; x < CANVAS_WIDTH + 280; x += 280) {
    context.fillRect(x + 40, 370, 30, 120);
    context.beginPath();
    context.arc(x + 55, 355, 44, 0, Math.PI * 2);
    context.fill();
  }

  for (const event of events) {
    if (event.status === "hidden") {
      continue;
    }

    const visualX = getEventVisualScreenX(event, distance);
    const hitboxX = getEventHitboxScreenX(event, distance);

    if (
      visualX < -220 ||
      visualX > CANVAS_WIDTH + 220 ||
      hitboxX < -220 ||
      hitboxX > CANVAS_WIDTH + 220
    ) {
      continue;
    }

    if (event.type === "dump") {
      drawTruck(context, visualX, hitboxX, event.id === activeEventId);
    }

    if (event.type === "dig") {
      drawSignage(context, visualX, hitboxX, event.id === activeEventId);
    }
  }
}

function drawGround(
  context: CanvasRenderingContext2D,
  distance: number,
  events: MapEvent[],
  activeEventId: number | null,
) {
  context.fillStyle = "#a77943";
  context.fillRect(0, GROUND_Y - 8, CANVAS_WIDTH, 90);

  context.fillStyle = "#6e4b2a";
  context.fillRect(0, GROUND_Y + 46, CANVAS_WIDTH, 90);

  context.fillStyle = "#d8b16c";
  const laneOffset = distance % 120;
  for (let x = laneOffset - 120; x < CANVAS_WIDTH + 120; x += 120) {
    context.fillRect(x, GROUND_Y + 12, 70, 8);
  }

  context.fillStyle = "rgba(40, 23, 10, 0.28)";
  const dirtOffset = (distance * 1.4) % 90;
  for (let x = dirtOffset - 90; x < CANVAS_WIDTH + 90; x += 90) {
    context.beginPath();
    context.ellipse(x + 20, GROUND_Y + 58, 24, 8, 0, 0, Math.PI * 2);
    context.fill();
  }

  for (const event of events) {
    if (event.status === "hidden") {
      continue;
    }

    const visualX = getEventVisualScreenX(event, distance);
    const hitboxX = getEventHitboxScreenX(event, distance);

    if (
      visualX < -220 ||
      visualX > CANVAS_WIDTH + 220 ||
      hitboxX < -220 ||
      hitboxX > CANVAS_WIDTH + 220
    ) {
      continue;
    }

    const isActive = event.id === activeEventId;

    if (event.type === "pickup") {
      drawPickupDirt(context, visualX, hitboxX, isActive);
    }

    if (event.type === "traction") {
      drawMudPatch(context, visualX, hitboxX, isActive);
    }
  }
}

function drawForeground(context: CanvasRenderingContext2D, distance: number) {
  const markerOffset = (distance * 1.2) % 260;

  for (let x = markerOffset - 260; x < CANVAS_WIDTH + 260; x += 260) {
    context.fillStyle = "#f5f0d0";
    context.fillRect(x, 444, 14, 86);
    context.fillStyle = "#d64a2f";
    context.fillRect(x - 12, 440, 38, 18);
  }
}

function drawCenterGuide(
  context: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  bottomY: number,
  hasActiveEvent: boolean,
) {
  context.save();
  context.strokeStyle = hasActiveEvent
    ? "rgba(255, 230, 140, 0.95)"
    : "rgba(255,255,255,0.42)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(centerX, topY);
  context.lineTo(centerX, bottomY);
  context.stroke();
  context.restore();
}

function drawPickupDirt(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save();
  context.fillStyle = isActive ? "#6f4e2e" : "#8c673e";
  context.beginPath();
  context.moveTo(visualX - 36, GROUND_Y + 18);
  context.lineTo(visualX - 10, GROUND_Y - 8);
  context.lineTo(visualX + 18, GROUND_Y + 12);
  context.lineTo(visualX + 34, GROUND_Y + 18);
  context.closePath();
  context.fill();
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 18,
    EVENT_HITBOX_HALF_WIDTH * 2,
    48,
  );
  context.restore();
}

function drawMudPatch(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save();
  context.fillStyle = isActive ? "#453217" : "#5b4322";
  context.beginPath();
  context.ellipse(visualX, GROUND_Y + 26, 48, 18, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(143, 112, 62, 0.75)";
  context.beginPath();
  context.ellipse(visualX - 14, GROUND_Y + 22, 14, 6, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y + 2,
    EVENT_HITBOX_HALF_WIDTH * 2,
    50,
  );
  context.restore();
}

function drawTruck(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save();
  context.fillStyle = "#35506d";
  context.fillRect(visualX - 76, GROUND_Y - 118, 110, 58);
  context.fillStyle = "#d7e1eb";
  context.fillRect(visualX + 34, GROUND_Y - 104, 44, 44);
  context.fillStyle = "#bb6d37";
  context.fillRect(visualX - 118, GROUND_Y - 92, 44, 32);
  context.fillStyle = "#1c2430";
  context.beginPath();
  context.arc(visualX - 58, GROUND_Y - 52, 18, 0, Math.PI * 2);
  context.arc(visualX + 38, GROUND_Y - 52, 18, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 126,
    EVENT_HITBOX_HALF_WIDTH * 2,
    104,
  );
  context.restore();
}

function drawSignage(
  context: CanvasRenderingContext2D,
  visualX: number,
  hitboxX: number,
  isActive: boolean,
) {
  context.save();
  context.fillStyle = "#e7e3cc";
  context.fillRect(visualX - 8, GROUND_Y - 120, 16, 122);
  context.fillStyle = "#d2492f";
  context.fillRect(visualX - 54, GROUND_Y - 170, 108, 54);
  context.fillStyle = "#f5f0d0";
  context.fillRect(visualX - 44, GROUND_Y - 160, 88, 34);
  context.fillStyle = "#d64a2f";
  context.fillRect(visualX - 100, GROUND_Y - 16, 28, 36);
  context.fillRect(visualX + 72, GROUND_Y - 16, 28, 36);
  context.strokeStyle = isActive ? "#fff2a8" : "rgba(255,255,255,0.35)";
  context.lineWidth = 2;
  context.strokeRect(
    hitboxX - EVENT_HITBOX_HALF_WIDTH,
    GROUND_Y - 174,
    EVENT_HITBOX_HALF_WIDTH * 2,
    204,
  );
  context.restore();
}
