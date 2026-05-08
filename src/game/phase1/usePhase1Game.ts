import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";

import { getAnimationTotalDuration } from "../retro/animations";
import { measureBaseExcavator } from "../retro/render";
import {
  createAnimationSoundPlayer,
  getAnimationSoundCuesAtTime,
  getAnimationSoundCuesInRange,
  type AnimationSoundPlayer,
} from "../retro/sounds";
import { useRetroSprites } from "../retro/sprites";
import type { ActiveAnimation, AnimationPresetId } from "../retro/types";
import { useGameLoop } from "../useGameLoop";
import { createPhase1SoundPlayer, type Phase1SoundPlayer } from "./sounds";
import {
  BASE_SPEED,
  FRONT_LOAD_SPEED,
  INITIAL_MESSAGE,
  PLAYER_HIT_LINE_X,
  QUESTION_MODAL_OPEN_SPEED_THRESHOLD,
  TRACTION_SCORE_LENIENCY_MARGIN,
} from "./config";
import {
  getEventActivationMessage,
  getEventDefinition,
  getTractionEventDefinition,
  isManualEventDefinition,
  isQuestionEventDefinition,
  isTractionEventDefinition,
} from "./eventCatalog";
import {
  createInitialPhase1Events,
  describeMapEvent,
  getEventHitboxScreenX,
  isWithinTractionScoreLeniencyZone,
  syncInfiniteEventStream,
  updateEventType,
  updateEventStatus,
} from "./eventPositioner";
import { getQuestionFromCatalog } from "./questionCatalog";
import {
  createQuestionModalState,
  getCorrectQuestionAnswerLabel,
  getQuestionDirectionFromKey,
  isCorrectQuestionAnswer,
} from "./questionModal";
import {
  createQuestionFeedbackModal,
  createQuestionIntroModal,
} from "./dialogue";
import { PHASE1_CONTINUE_CODES } from "./config";
import {
  getGreaseAnimationPose,
  getGreaseAnimationTotalDuration,
} from "./greaseAnimation";
import type {
  GreaseAnimationState,
  MapEvent,
  Phase1SpeechModalState,
  QuestionModalState,
} from "./types";
import type { VenezitoMood } from "./venezito";

const INITIAL_PHASE1_EVENTS = createInitialPhase1Events();
const PHASE1_CONTINUE_KEY_SET = new Set<string>(PHASE1_CONTINUE_CODES);
const PHASE1_MOVEMENT_KEY_CODES = new Set<KeyboardEvent["code"]>([
  "KeyA",
  "KeyD",
]);
const PHASE1_REVERSE_KEY_CODE: KeyboardEvent["code"] = "KeyA";
const PHASE1_FORWARD_KEY_CODE: KeyboardEvent["code"] = "KeyD";
const MANUAL_EVENT_KEY_CODES = new Set<string>([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
]);

function getDriveInput(pressedKeys: ReadonlySet<KeyboardEvent["code"]>) {
  return (
    Number(pressedKeys.has(PHASE1_FORWARD_KEY_CODE)) -
    Number(pressedKeys.has(PHASE1_REVERSE_KEY_CODE))
  );
}

function capTargetSpeed(targetSpeed: number, maxAbsSpeed: number) {
  return Math.sign(targetSpeed) * Math.min(Math.abs(targetSpeed), maxAbsSpeed);
}

export function usePhase1Game(enabled = true) {
  const sprites = useRetroSprites();
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [fails, setFails] = useState(0);
  const [loadedDirt, setLoadedDirt] = useState(false);
  const [rearLoaded, setRearLoaded] = useState(false);
  const [message, setMessage] = useState(INITIAL_MESSAGE);
  const [events, setEvents] = useState<MapEvent[]>(INITIAL_PHASE1_EVENTS);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [differentialLockEnabled, setDifferentialLockEnabled] = useState(false);
  const [questionModal, setQuestionModal] = useState<QuestionModalState | null>(
    null,
  );
  const [speechModal, setSpeechModal] = useState<Phase1SpeechModalState | null>(
    null,
  );
  const [venezitoMood, setVenezitoMood] = useState<VenezitoMood>("neutral");
  const [animationTick, setAnimationTick] = useState(0);
  const [activeAnimationLabel, setActiveAnimationLabel] =
    useState("Rodagem continua");

  const eventsRef = useRef<MapEvent[]>(INITIAL_PHASE1_EVENTS);
  const activeEventIdRef = useRef<number | null>(null);
  const loadedDirtRef = useRef(false);
  const rearLoadedRef = useRef(false);
  const frontAnimationRef = useRef<ActiveAnimation | null>(null);
  const rearAnimationRef = useRef<ActiveAnimation | null>(null);
  const greaseAnimationRef = useRef<GreaseAnimationState | null>(null);
  const currentSpeedRef = useRef(0);
  const distanceRef = useRef(0);
  const differentialLockEnabledRef = useRef(false);
  const questionModalRef = useRef<QuestionModalState | null>(null);
  const pendingQuestionModalRef = useRef<QuestionModalState | null>(null);
  const speechModalRef = useRef<Phase1SpeechModalState | null>(null);
  const questionCursorRef = useRef(0);
  const tractionBoostFrameCountRef = useRef(0);
  const movementKeyCodesRef = useRef<Set<KeyboardEvent["code"]>>(new Set());
  const animationSoundPlayerRef = useRef<AnimationSoundPlayer | null>(null);
  const phase1SoundPlayerRef = useRef<Phase1SoundPlayer | null>(null);
  const startupLockedRef = useRef(true);

  const excavatorScene = useMemo(
    () => (sprites ? measureBaseExcavator(sprites) : null),
    [sprites],
  );

  const syncAnimationLabel = () => {
    const labels = [
      frontAnimationRef.current?.label,
      rearAnimationRef.current?.label,
      greaseAnimationRef.current?.hasStarted ? "Aplicando graxa" : null,
    ].filter(Boolean);

    setActiveAnimationLabel(labels.join(" + ") || "Rodagem continua");
  };

  const clearMovementInput = () => {
    movementKeyCodesRef.current.clear();
  };

  const setQuestionModalState = (nextModal: QuestionModalState | null) => {
    if (nextModal) {
      clearMovementInput();
    }

    questionModalRef.current = nextModal;
    setQuestionModal(nextModal);
  };

  const setSpeechModalState = (nextModal: Phase1SpeechModalState | null) => {
    if (nextModal) {
      clearMovementInput();
    }

    speechModalRef.current = nextModal;
    setSpeechModal(nextModal);

    if (nextModal) {
      currentSpeedRef.current = 0;
      setSpeed(0);
    }
  };

  const setDifferentialLockState = (enabled: boolean) => {
    differentialLockEnabledRef.current = enabled;
    setDifferentialLockEnabled(enabled);
  };

  const clearActiveEvent = () => {
    setActiveEventId(null);
    activeEventIdRef.current = null;
    tractionBoostFrameCountRef.current = 0;
    setQuestionModalState(null);
    pendingQuestionModalRef.current = null;
  };

  const playAnimationSoundCues = (
    soundCues: ReturnType<typeof getAnimationSoundCuesInRange>,
  ) => {
    if (soundCues.length === 0) {
      return;
    }

    for (const soundCue of soundCues) {
      animationSoundPlayerRef.current?.playSound(
        soundCue.soundId,
        soundCue.volume,
      );
    }
  };

  const playPhase1Sound = (
    soundId: "engine-start" | "mud" | "success" | "failure",
  ) => phase1SoundPlayerRef.current?.playSound(soundId, 0.3) ?? null;

  const resolveEvent = (
    eventId: number,
    nextMessage: string,
    options?: {
      scoreDelta?: number;
      playSound?: boolean;
    },
  ) => {
    const nextEvents = updateEventStatus(
      eventsRef.current,
      eventId,
      "resolved",
    );

    eventsRef.current = nextEvents;
    setEvents(nextEvents);
    clearActiveEvent();
    setHits((current) => current + 1);
    const scoreDelta = options?.scoreDelta ?? 0;
    if (scoreDelta !== 0) {
      setScore((current) => current + scoreDelta);
    }
    if (options?.playSound !== false) {
      playPhase1Sound("success");
    }
    setMessage(nextMessage);
    setVenezitoMood("happy");
  };

  const failEvent = (
    eventId: number,
    nextMessage: string,
    options?: {
      scorePenalty?: number;
      playSound?: boolean;
    },
  ) => {
    const nextEvents = updateEventStatus(eventsRef.current, eventId, "missed");

    eventsRef.current = nextEvents;
    setEvents(nextEvents);
    clearActiveEvent();
    setFails((current) => current + 1);
    const scorePenalty = options?.scorePenalty ?? 90;
    if (scorePenalty > 0) {
      setScore((current) => Math.max(0, current - scorePenalty));
    }
    if (options?.playSound !== false) {
      playPhase1Sound("failure");
    }
    setMessage(nextMessage);
    setVenezitoMood("sad");
  };

  const startAnimation = (
    target: MutableRefObject<ActiveAnimation | null>,
    presetId: AnimationPresetId,
    label: string,
    lockMovement: boolean,
    onUpdate?: (previousElapsed: number, nextElapsed: number) => void,
    onComplete?: () => void,
  ) => {
    target.current = {
      presetId,
      label,
      elapsed: 0,
      lockMovement,
      onUpdate,
      onComplete,
    };
    playAnimationSoundCues(getAnimationSoundCuesAtTime(presetId, 0));
    syncAnimationLabel();
  };

  const applyLoadStatePatch = (patch?: {
    loadedDirt?: boolean;
    rearLoaded?: boolean;
  }) => {
    if (!patch) {
      return;
    }

    if (typeof patch.loadedDirt === "boolean") {
      setLoadedDirt(patch.loadedDirt);
      loadedDirtRef.current = patch.loadedDirt;
    }

    if (typeof patch.rearLoaded === "boolean") {
      setRearLoaded(patch.rearLoaded);
      rearLoadedRef.current = patch.rearLoaded;
    }
  };

  const updateResolvedDigVisual = (
    eventId: number,
    eventType: "dig-load" | "dig-unload",
  ) => {
    const nextType = eventType === "dig-load" ? "dig-unload" : "dig-load";
    const nextEvents = updateEventType(eventsRef.current, eventId, nextType);

    eventsRef.current = nextEvents;
    setEvents(nextEvents);
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
    const soundPlayer = createAnimationSoundPlayer();

    animationSoundPlayerRef.current = soundPlayer;

    return () => {
      soundPlayer.dispose();

      if (animationSoundPlayerRef.current === soundPlayer) {
        animationSoundPlayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const soundPlayer = createPhase1SoundPlayer();

    phase1SoundPlayerRef.current = soundPlayer;

    return () => {
      soundPlayer.dispose();

      if (phase1SoundPlayerRef.current === soundPlayer) {
        phase1SoundPlayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    startupLockedRef.current = true;
    movementKeyCodesRef.current.clear();
    currentSpeedRef.current = 0;
    setSpeed(0);

    let cancelled = false;
    const playback = playPhase1Sound("engine-start");

    if (!playback) {
      startupLockedRef.current = false;
      return;
    }

    void playback.done.finally(() => {
      if (!cancelled) {
        startupLockedRef.current = false;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!enabled) {
      return;
    }

    if (speechModalRef.current) {
      if (!PHASE1_CONTINUE_KEY_SET.has(event.code) || event.repeat) {
        return;
      }

      event.preventDefault();
      if (pendingQuestionModalRef.current) {
        const nextQuestionModal = pendingQuestionModalRef.current;
        pendingQuestionModalRef.current = null;
        setSpeechModalState(null);
        setQuestionModalState(nextQuestionModal);
        setMessage("Responda a pergunta do instrutor.");
        return;
      }
      setSpeechModalState(null);
      return;
    }

    const openQuestionModal = questionModalRef.current;

    if (openQuestionModal) {
      if (event.repeat) {
        return;
      }

      const selectedDirection = getQuestionDirectionFromKey(event);

      if (!selectedDirection) {
        return;
      }

      event.preventDefault();

      if (
        isCorrectQuestionAnswer(openQuestionModal.question, selectedDirection)
      ) {
        resolveEvent(
          openQuestionModal.eventId,
          openQuestionModal.question.successMessage,
          {
            scoreDelta: openQuestionModal.question.reward,
          },
        );
        setSpeechModalState(
          createQuestionFeedbackModal(openQuestionModal.question, "success"),
        );
        return;
      }

      const correctAnswer = getCorrectQuestionAnswerLabel(
        openQuestionModal.question,
      );

      failEvent(
        openQuestionModal.eventId,
        `Resposta errada. A resposta certa é ${correctAnswer}.`,
        {
          scorePenalty: openQuestionModal.question.penalty,
        },
      );
      setSpeechModalState(
        createQuestionFeedbackModal(openQuestionModal.question, "failure"),
      );
      return;
    }

    if (PHASE1_MOVEMENT_KEY_CODES.has(event.code)) {
      event.preventDefault();
      movementKeyCodesRef.current.add(event.code);
      return;
    }

    const tractionDefinition = getTractionEventDefinition();

    if (tractionDefinition.toggleCodes.includes(event.code) && !event.repeat) {
      event.preventDefault();
      const nextEnabled = !differentialLockEnabledRef.current;
      setDifferentialLockState(nextEnabled);
      setMessage(nextEnabled ? "4x4 ativado." : "4x4 desativado.");
      setVenezitoMood("neutral");
      return;
    }

    const activeEvent = eventsRef.current.find(
      (item) => item.id === activeEventIdRef.current,
    );

    if (!activeEvent) {
      return;
    }

    if (!activeEvent.type) {
      return;
    }

    const eventDefinition = getEventDefinition(activeEvent.type);

    if (!isManualEventDefinition(eventDefinition)) {
      return;
    }

    if (!MANUAL_EVENT_KEY_CODES.has(event.code)) {
      return;
    }

    event.preventDefault();

    const screenX = getEventHitboxScreenX(activeEvent, distanceRef.current);
    const isWithinHitbox =
      Math.abs(screenX - PLAYER_HIT_LINE_X) <= eventDefinition.hitboxHalfWidth;

    if (!eventDefinition.acceptedCodes.includes(event.code)) {
      if (!isWithinHitbox) {
        return;
      }

      failEvent(
        activeEvent.id,
        `Comando incorreto para ${eventDefinition.title.toLowerCase()}.`,
      );
      return;
    }

    if (!isWithinHitbox) {
      setFails((current) => current + 1);
      setScore((current) => Math.max(0, current - 50));
      setMessage("Fora da hitbox do evento.");
      setVenezitoMood("sad");
      return;
    }

    resolveEvent(activeEvent.id, eventDefinition.successMessage, {
      scoreDelta: eventDefinition.reward,
    });

    if (!eventDefinition.animation) {
      return;
    }

    if (eventDefinition.animation.kind === "grease") {
      greaseAnimationRef.current = {
        hasStarted: false,
        elapsed: 0,
        durationMs:
          eventDefinition.animation.durationMs ||
          getGreaseAnimationTotalDuration(),
        lastSoundPointIndex: -1,
      };
      syncAnimationLabel();
      return;
    }

    const retroAnimation = eventDefinition.animation;

    const animationTarget =
      retroAnimation.target === "front" ? frontAnimationRef : rearAnimationRef;

    let hasSwappedDigSprite = false;

    startAnimation(
      animationTarget,
      retroAnimation.presetId,
      retroAnimation.label,
      retroAnimation.lockMovement,
      (previousElapsed, nextElapsed) => {
        if (
          hasSwappedDigSprite ||
          retroAnimation.target !== "rear" ||
          typeof retroAnimation.spriteSwapAtMs !== "number" ||
          (activeEvent.type !== "dig-load" && activeEvent.type !== "dig-unload")
        ) {
          return;
        }

        if (
          previousElapsed < retroAnimation.spriteSwapAtMs &&
          nextElapsed >= retroAnimation.spriteSwapAtMs
        ) {
          hasSwappedDigSprite = true;
          updateResolvedDigVisual(activeEvent.id, activeEvent.type);
        }
      },
      () => {
        applyLoadStatePatch(retroAnimation.loadStateOnComplete);

        if (
          !hasSwappedDigSprite &&
          (activeEvent.type === "dig-load" || activeEvent.type === "dig-unload")
        ) {
          updateResolvedDigVisual(activeEvent.id, activeEvent.type);
        }
      },
    );
  });

  const handleKeyUp = useEffectEvent((event: KeyboardEvent) => {
    if (!enabled) {
      return;
    }

    if (!PHASE1_MOVEMENT_KEY_CODES.has(event.code)) {
      return;
    }

    event.preventDefault();
    movementKeyCodesRef.current.delete(event.code);
  });

  const handleWindowBlur = useEffectEvent(() => {
    clearMovementInput();
  });

  useEffect(() => {
    if (!sprites || !enabled) {
      return;
    }

    const movementKeyCodes = movementKeyCodesRef.current;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
      movementKeyCodes.clear();
    };
  }, [enabled, sprites]);

  const updateFrame = (dt: number) => {
    const activeEvent = eventsRef.current.find(
      (item) => item.id === activeEventIdRef.current,
    );
    const activeEventDefinition = activeEvent?.type
      ? getEventDefinition(activeEvent.type)
      : null;
    const nextUpcomingEvent = eventsRef.current.find(
      (item) => item.status === "upcoming",
    );
    const nextUpcomingEventDefinition = nextUpcomingEvent
      ? describeMapEvent(
          nextUpcomingEvent,
          loadedDirtRef.current,
          rearLoadedRef.current,
        )
      : null;
    const nextUpcomingScreenX = nextUpcomingEvent
      ? getEventHitboxScreenX(nextUpcomingEvent, distanceRef.current)
      : null;
    const withinTractionScoreLeniencyZone = isWithinTractionScoreLeniencyZone(
      eventsRef.current,
      distanceRef.current,
      TRACTION_SCORE_LENIENCY_MARGIN,
    );

    const updateAnimation = (
      animation: ActiveAnimation | null,
      clear: () => void,
    ) => {
      if (!animation) {
        return;
      }

      const previousElapsed = animation.elapsed;

      animation.elapsed += dt * 1000;
      animation.onUpdate?.(previousElapsed, animation.elapsed);
      playAnimationSoundCues(
        getAnimationSoundCuesInRange(
          animation.presetId,
          previousElapsed,
          animation.elapsed,
        ),
      );

      if (animation.elapsed >= getAnimationTotalDuration(animation.presetId)) {
        const onComplete = animation.onComplete;
        clear();
        onComplete?.();
        syncAnimationLabel();
      }
    };

    updateAnimation(frontAnimationRef.current, () => {
      frontAnimationRef.current = null;
    });
    updateAnimation(rearAnimationRef.current, () => {
      rearAnimationRef.current = null;
    });

    if (
      frontAnimationRef.current ||
      rearAnimationRef.current ||
      greaseAnimationRef.current
    ) {
      setAnimationTick((current) => current + 1);
    }

    let targetSpeed = getDriveInput(movementKeyCodesRef.current) * BASE_SPEED;

    if (startupLockedRef.current) {
      targetSpeed = 0;
    }

    if (
      activeEventDefinition &&
      isTractionEventDefinition(activeEventDefinition) &&
      !differentialLockEnabledRef.current
    ) {
      targetSpeed = capTargetSpeed(
        targetSpeed,
        activeEventDefinition.activeSpeed,
      );
    }

    if (frontAnimationRef.current?.presetId === "idle") {
      targetSpeed = capTargetSpeed(targetSpeed, FRONT_LOAD_SPEED);
    }

    if (
      !activeEventDefinition &&
      nextUpcomingEventDefinition &&
      isQuestionEventDefinition(nextUpcomingEventDefinition) &&
      typeof nextUpcomingScreenX === "number"
    ) {
      const distanceToQuestionHitbox =
        PLAYER_HIT_LINE_X -
        (nextUpcomingScreenX + nextUpcomingEventDefinition.hitboxHalfWidth);

      if (
        distanceToQuestionHitbox > 0 &&
        distanceToQuestionHitbox <=
          nextUpcomingEventDefinition.approachSlowdownDistance
      ) {
        const slowdownProgress =
          1 -
          distanceToQuestionHitbox /
            nextUpcomingEventDefinition.approachSlowdownDistance;
        const approachSpeed =
          BASE_SPEED +
          (nextUpcomingEventDefinition.approachTargetSpeed - BASE_SPEED) *
            slowdownProgress;

        if (targetSpeed > 0) {
          targetSpeed = Math.min(targetSpeed, approachSpeed);
        }
      }
    }

    if (
      activeEventDefinition &&
      isQuestionEventDefinition(activeEventDefinition) &&
      !questionModalRef.current
    ) {
      targetSpeed = 0;
    }

    if (
      frontAnimationRef.current?.lockMovement ||
      rearAnimationRef.current?.lockMovement ||
      greaseAnimationRef.current
    ) {
      targetSpeed = 0;
    }

    if (questionModalRef.current) {
      targetSpeed = 0;
    }

    if (speechModalRef.current) {
      targetSpeed = 0;
    }

    let nextSpeed =
      currentSpeedRef.current +
      (targetSpeed - currentSpeedRef.current) * Math.min(1, dt * 4);
    let nextDistance = distanceRef.current + nextSpeed * dt;

    if (nextDistance < 0) {
      nextDistance = 0;
      nextSpeed = 0;
    }

    currentSpeedRef.current = nextSpeed;
    setSpeed(nextSpeed);

    if (greaseAnimationRef.current) {
      if (!greaseAnimationRef.current.hasStarted) {
        if (nextSpeed <= 2) {
          greaseAnimationRef.current.hasStarted = true;
          greaseAnimationRef.current.elapsed = 0;
          greaseAnimationRef.current.lastSoundPointIndex = -1;
          syncAnimationLabel();
        }
      } else {
        greaseAnimationRef.current.elapsed += dt * 1000;

        const greasePose = getGreaseAnimationPose(
          greaseAnimationRef.current.elapsed,
        );

        if (
          greasePose &&
          greasePose.pointIndex !==
            greaseAnimationRef.current.lastSoundPointIndex
        ) {
          greaseAnimationRef.current.lastSoundPointIndex =
            greasePose.pointIndex;
          playPhase1Sound("mud");
        }

        if (
          greaseAnimationRef.current.elapsed >=
          greaseAnimationRef.current.durationMs
        ) {
          greaseAnimationRef.current = null;
          syncAnimationLabel();
        }
      }
    }

    if (differentialLockEnabledRef.current) {
      if (
        activeEventDefinition &&
        isTractionEventDefinition(activeEventDefinition)
      ) {
        tractionBoostFrameCountRef.current += 1;
        setScore((current) => current + activeEventDefinition.rewardPerFrame);
      } else if (!withinTractionScoreLeniencyZone) {
        const tractionDefinition = getTractionEventDefinition();
        setScore((current) =>
          Math.max(0, current - tractionDefinition.drainPerFrame),
        );
      }
    } else {
      if (
        activeEventDefinition &&
        isTractionEventDefinition(activeEventDefinition)
      ) {
        const tractionDefinition = getTractionEventDefinition();
        setScore((current) =>
          Math.max(0, current - tractionDefinition.drainPerFrame),
        );
      }
    }

    distanceRef.current = nextDistance;
    setDistance(nextDistance);
    setScore(
      (current) => current + Math.round(Math.max(0, nextSpeed) * dt * 0.08),
    );

    const spawnedEvents = syncInfiniteEventStream(
      eventsRef.current,
      nextDistance,
      loadedDirtRef.current,
      rearLoadedRef.current,
    );

    if (spawnedEvents !== eventsRef.current) {
      eventsRef.current = spawnedEvents;
      setEvents(spawnedEvents);
    }

    const nextUpcoming = eventsRef.current.find(
      (item) => item.status === "upcoming",
    );

    if (nextUpcoming) {
      const screenX = getEventHitboxScreenX(nextUpcoming, nextDistance);
      const eventInfo = describeMapEvent(
        nextUpcoming,
        loadedDirtRef.current,
        rearLoadedRef.current,
      );

      if (Math.abs(screenX - PLAYER_HIT_LINE_X) <= eventInfo.hitboxHalfWidth) {
        const nextEvents = updateEventStatus(
          eventsRef.current,
          nextUpcoming.id,
          "active",
        );

        eventsRef.current = nextEvents;
        setEvents(nextEvents);
        setActiveEventId(nextUpcoming.id);
        activeEventIdRef.current = nextUpcoming.id;
        setMessage(getEventActivationMessage(eventInfo));
        setVenezitoMood("neutral");

        if (isTractionEventDefinition(eventInfo)) {
          playPhase1Sound("mud");
        }

        if (isQuestionEventDefinition(eventInfo)) {
          setMessage("Parando para a pergunta do instrutor...");
          setVenezitoMood("neutral");
        }
      }
    }

    if (
      activeEventDefinition &&
      isQuestionEventDefinition(activeEventDefinition) &&
      !questionModalRef.current &&
      nextSpeed <= QUESTION_MODAL_OPEN_SPEED_THRESHOLD
    ) {
      const question = getQuestionFromCatalog(questionCursorRef.current);
      questionCursorRef.current += 1;
      currentSpeedRef.current = 0;
      setSpeed(0);
      setQuestionModalState(null);
      pendingQuestionModalRef.current = createQuestionModalState(
        activeEvent!.id,
        activeEventDefinition,
        question,
      );
      setSpeechModalState(createQuestionIntroModal());
      setMessage(getEventActivationMessage(activeEventDefinition));
      return;
    }

    const currentActiveEvent = eventsRef.current.find(
      (item) => item.id === activeEventIdRef.current,
    );

    if (!currentActiveEvent) {
      return;
    }

    const screenX = getEventHitboxScreenX(currentActiveEvent, nextDistance);

    if (!currentActiveEvent.type) {
      return;
    }

    const currentEventDefinition = getEventDefinition(currentActiveEvent.type);

    if (screenX > PLAYER_HIT_LINE_X + currentEventDefinition.hitboxHalfWidth) {
      if (currentActiveEvent.type) {
        if (isTractionEventDefinition(currentEventDefinition)) {
          if (tractionBoostFrameCountRef.current > 0) {
            resolveEvent(
              currentActiveEvent.id,
              currentEventDefinition.successMessage,
            );
          } else {
            failEvent(
              currentActiveEvent.id,
              currentEventDefinition.failureMessage,
              {
                scorePenalty: 0,
              },
            );
          }
          return;
        }

        if (isQuestionEventDefinition(currentEventDefinition)) {
          return;
        }
      }

      failEvent(
        currentActiveEvent.id,
        "O evento passou da hitbox sem resposta.",
      );
    }
  };

  useGameLoop((dt) => updateFrame(dt), Boolean(sprites) && enabled);

  return {
    sprites,
    excavatorScene,
    distance,
    speed,
    score,
    hits,
    fails,
    differentialLockEnabled,
    loadedDirt,
    rearLoaded,
    message,
    venezitoMood,
    events,
    activeEventId,
    questionModal,
    speechModal,
    animationTick,
    activeAnimationLabel,
    frontAnimationRef,
    greaseAnimationElapsed: greaseAnimationRef.current?.hasStarted
      ? greaseAnimationRef.current.elapsed
      : null,
    rearAnimationRef,
  };
}
