import {
  CANVAS_WIDTH,
  EVENT_DESPAWN_MARGIN,
  EVENT_SPAWN_MARGIN,
  PLAYER_HIT_LINE_X,
  PLAYER_SCREEN_X,
} from "./config";
import { getEventDefinition } from "./eventCatalog";
import type {
  EventStatus,
  MapEvent,
  MapEventType,
} from "./types";

type EventSpawnSlot = {
  type: MapEventType;
  hitboxX: number;
};

// Edite aqui apenas a ordem e o posicionamento do ciclo de spawns.
const EVENT_SPAWN_PLAN: EventSpawnSlot[] = [
  { type: "grease", hitboxX: 1500 },
  { type: "pickup-load", hitboxX: 1500 * 2 },
  // { type: "traction", hitboxX: 1500 * 3 },
  { type: "dig-load", hitboxX: 1500 * 4 },
  { type: "question", hitboxX: 1500 * 5 },
  { type: "grease", hitboxX: 1500 * 6 },
  { type: "dig-unload", hitboxX: 1500 * 7 },
  // { type: "traction", hitboxX: 1500 * 8 },
  { type: "pickup-unload", hitboxX: 1500 * 9 },
  { type: "question", hitboxX: 1500 * 10 },
];

const EVENT_SEQUENCE_LENGTH = EVENT_SPAWN_PLAN.length;
const MIN_UPCOMING_EVENT_BUFFER = EVENT_SEQUENCE_LENGTH;
const FIRST_EVENT_HITBOX_X = EVENT_SPAWN_PLAN[0]?.hitboxX ?? 0;
const FIRST_EVENT_GAP =
  (EVENT_SPAWN_PLAN[1]?.hitboxX ?? 0) - FIRST_EVENT_HITBOX_X ||
  FIRST_EVENT_HITBOX_X + CANVAS_WIDTH + EVENT_SPAWN_MARGIN;
const EVENT_SPAWN_CYCLE_LENGTH =
  (EVENT_SPAWN_PLAN.at(-1)?.hitboxX ?? 0) +
  FIRST_EVENT_GAP -
  FIRST_EVENT_HITBOX_X;

function createSpawnedEvent(id: number): MapEvent {
  const slot = EVENT_SPAWN_PLAN[id % EVENT_SPAWN_PLAN.length];
  const cycleIndex = Math.floor(id / EVENT_SPAWN_PLAN.length);

  return {
    id,
    group: getEventDefinition(slot.type).group,
    hitboxX: slot.hitboxX + cycleIndex * EVENT_SPAWN_CYCLE_LENGTH,
    status: "upcoming",
    type: slot.type,
  };
}

function ensureUpcomingEventBuffer(events: MapEvent[]) {
  let upcomingCount = events.reduce(
    (total, event) => total + (event.status === "upcoming" ? 1 : 0),
    0,
  );

  if (upcomingCount >= MIN_UPCOMING_EVENT_BUFFER) {
    return events;
  }

  const nextEvents = [...events];
  let nextEventId = nextEvents.at(-1)?.id ?? -1;

  while (upcomingCount < MIN_UPCOMING_EVENT_BUFFER) {
    nextEventId += 1;
    nextEvents.push(createSpawnedEvent(nextEventId));
    upcomingCount += 1;
  }

  return nextEvents;
}

export function getEventHitboxScreenX(event: MapEvent, distance: number) {
  return PLAYER_SCREEN_X - (event.hitboxX - distance);
}

export function isEventScreenXVisible(screenX: number) {
  return isEventScreenRangeVisible(screenX, 0);
}

export function isEventScreenRangeVisible(screenX: number, halfWidth: number) {
  return (
    screenX + halfWidth >= -EVENT_SPAWN_MARGIN &&
    screenX - halfWidth <= CANVAS_WIDTH + EVENT_DESPAWN_MARGIN
  );
}

export function updateEventStatus(
  events: MapEvent[],
  eventId: number,
  status: EventStatus,
) {
  return events.map((event) =>
    event.id === eventId ? { ...event, status } : event,
  );
}

export function updateEventType(
  events: MapEvent[],
  eventId: number,
  type: MapEventType,
) {
  return events.map((event) =>
    event.id === eventId ? { ...event, type } : event,
  );
}

export function cloneEvents(events: MapEvent[]) {
  return events.map((event) => ({ ...event }));
}

export function resolveSpawnedEventType(
  group: MapEvent["group"],
  _loadedDirt: boolean,
  _rearLoaded: boolean,
): MapEventType {
  if (group === "pickup") {
    return "pickup-load";
  }

  if (group === "dig") {
    return "dig-load";
  }

  if (group === "grease") {
    return "grease";
  }

  if (group === "traction") {
    return "traction";
  }

  return "question";
}

export function resolveMapEventType(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  return (
    event.type ?? resolveSpawnedEventType(event.group, loadedDirt, rearLoaded)
  );
}

export function getEventVisualX(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  const eventType = resolveMapEventType(event, loadedDirt, rearLoaded);
  const { visualOffset } = getEventDefinition(eventType);

  return event.hitboxX + visualOffset;
}

export function getEventVisualScreenX(
  event: MapEvent,
  distance: number,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  return (
    PLAYER_SCREEN_X -
    (getEventVisualX(event, loadedDirt, rearLoaded) - distance)
  );
}

export function assignSpawnedEventTypes(
  events: MapEvent[],
  distance: number,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  let hasChanges = false;

  const nextEvents = events.map((event) => {
    const eventType = resolveMapEventType(event, loadedDirt, rearLoaded);
    const visualX = getEventVisualScreenX(
      { ...event, type: eventType },
      distance,
      loadedDirt,
      rearLoaded,
    );
    const hitboxX = getEventHitboxScreenX(event, distance);

    if (
      event.type ||
      (!isEventScreenXVisible(visualX) &&
        !isEventScreenRangeVisible(
          hitboxX,
          getEventDefinition(eventType).hitboxHalfWidth,
        ))
    ) {
      return event;
    }

    hasChanges = true;

    return {
      ...event,
      type: eventType,
    };
  });

  return hasChanges ? nextEvents : events;
}

export function createInitialPhase1Events() {
  return assignSpawnedEventTypes(
    Array.from({ length: EVENT_SEQUENCE_LENGTH * 2 }, (_, id) =>
      createSpawnedEvent(id),
    ),
    0,
    false,
    false,
  );
}

export function syncInfiniteEventStream(
  events: MapEvent[],
  distance: number,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  const bufferedEvents = ensureUpcomingEventBuffer(events);

  return assignSpawnedEventTypes(
    bufferedEvents,
    distance,
    loadedDirt,
    rearLoaded,
  );
}

export function getEventHitboxHalfWidth(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  return getEventDefinition(resolveMapEventType(event, loadedDirt, rearLoaded))
    .hitboxHalfWidth;
}

export function isWithinEventHitZone(
  screenX: number,
  hitboxHalfWidth: number,
  extraMargin = 0,
) {
  return Math.abs(screenX - PLAYER_HIT_LINE_X) <= hitboxHalfWidth + extraMargin;
}

export function isWithinTractionScoreLeniencyZone(
  events: MapEvent[],
  distance: number,
  extraMargin: number,
) {
  return events.some((event) => {
    if (event.group !== "traction") {
      return false;
    }

    return isWithinEventHitZone(
      getEventHitboxScreenX(event, distance),
      getEventDefinition("traction").hitboxHalfWidth,
      extraMargin,
    );
  });
}

export function describeMapEvent(
  event: MapEvent,
  loadedDirt: boolean,
  rearLoaded: boolean,
) {
  return getEventDefinition(resolveMapEventType(event, loadedDirt, rearLoaded));
}
