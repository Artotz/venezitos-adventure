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
  FRONT_LOAD_SPEED,
  PHASE1_FORWARD_GEAR_SPEEDS,
  PHASE1_HIGHSCORE_STORAGE_KEY,
  PHASE1_HOURMETER_HOURS_PER_SECOND,
  PHASE1_HOURMETER_TARGET_HOURS,
  PHASE1_REVERSE_GEAR_SPEEDS,
  PLAYER_HIT_LINE_X,
} from "./config";
import {
  getPhase1ContinueCodes,
  getPhase1EventActionCodes,
  getPhase1EventActivationMessage,
  getPhase1InitialMessage,
  getPhase1QuestionOptionLabel,
  getPhase1QuestionDirectionFromCode,
  type Phase1ControlScheme,
} from "./controls";
import {
  getEventDefinition,
  getRequiredDriveStateLabel,
  isManualEventDefinition,
  isQuestionEventDefinition,
  isTractionEventDefinition,
} from "./eventCatalog";
import {
  createInitialPhase1Events,
  describeMapEvent,
  getEventHitboxScreenX,
  syncInfiniteEventStream,
  updateEventType,
  updateEventStatus,
} from "./eventPositioner";
import { getQuestionFromCatalog } from "./questionCatalog";
import {
  createQuestionModalState,
  getCorrectQuestionAnswerLabel,
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
  Phase1FinalModalState,
  Phase1SpeechModalState,
  Phase1DriveMode,
  Phase1RequiredDriveState,
  QuestionModalState,
} from "./types";
import type { VenezitoMood } from "./venezito";

const INITIAL_PHASE1_EVENTS = createInitialPhase1Events();
const DRIVE_MODE_UP: Record<Phase1DriveMode, Phase1DriveMode> = {
  reverse: "neutral",
  neutral: "forward",
  forward: "forward",
};
const DRIVE_MODE_DOWN: Record<Phase1DriveMode, Phase1DriveMode> = {
  reverse: "reverse",
  neutral: "reverse",
  forward: "neutral",
};
const MAX_FORWARD_GEAR = PHASE1_FORWARD_GEAR_SPEEDS.length;
const MAX_REVERSE_GEAR = PHASE1_REVERSE_GEAR_SPEEDS.length;
const BRAKE_RESPONSE = 10;
const DRIVE_RESPONSE = 2.4;
const NEUTRAL_RESPONSE = 0.9;
const FINAL_STOP_SPEED_THRESHOLD = 2;
const EVENT_STOP_SPEED_THRESHOLD = 2;
const FINAL_MODAL_DELAY_SECONDS = 2;

function readPhase1HighScore() {
  if (typeof window === "undefined") {
    return 0;
  }

  let storedValue: string | null = null;

  try {
    storedValue = window.localStorage.getItem(PHASE1_HIGHSCORE_STORAGE_KEY);
  } catch {
    return 0;
  }

  const parsedValue = storedValue ? Number.parseInt(storedValue, 10) : 0;

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

function writePhase1HighScore(score: number) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PHASE1_HIGHSCORE_STORAGE_KEY, String(score));
  } catch {
    // O jogo continua mesmo se o navegador bloquear armazenamento local.
  }
}

function clampSelectedGear(gear: number) {
  return Math.max(1, Math.min(MAX_FORWARD_GEAR, gear));
}

function getDriveSpeed(mode: Phase1DriveMode, gear: number) {
  if (mode === "neutral") {
    return 0;
  }

  if (mode === "reverse") {
    const effectiveReverseGear = Math.min(
      clampSelectedGear(gear),
      MAX_REVERSE_GEAR,
    );

    return PHASE1_REVERSE_GEAR_SPEEDS[effectiveReverseGear - 1];
  }

  return PHASE1_FORWARD_GEAR_SPEEDS[clampSelectedGear(gear) - 1];
}

function isRequiredDriveStateActive(
  requiredDriveState: Phase1RequiredDriveState,
  currentMode: Phase1DriveMode,
  currentGear: number,
  currentSpeed: number,
) {
  if (requiredDriveState.mode === "neutral") {
    return (
      currentMode === "neutral" &&
      Math.abs(currentSpeed) <= EVENT_STOP_SPEED_THRESHOLD
    );
  }

  return (
    currentMode === requiredDriveState.mode &&
    clampSelectedGear(currentGear) === requiredDriveState.gear
  );
}

function getRequiredDriveStateAdjustmentMessage(
  title: string,
  requiredDriveState: Phase1RequiredDriveState,
) {
  const driveStateLabel = getRequiredDriveStateLabel(requiredDriveState);

  if (requiredDriveState.mode === "neutral") {
    return `${title}: ajuste para ${driveStateLabel} e pare a maquina.`;
  }

  return `${title}: ajuste para ${driveStateLabel}.`;
}

function capTargetSpeed(targetSpeed: number, maxAbsSpeed: number) {
  return Math.sign(targetSpeed) * Math.min(Math.abs(targetSpeed), maxAbsSpeed);
}

export function usePhase1Game(
  enabled = true,
  paused = false,
  controlScheme: Phase1ControlScheme,
) {
  const sprites = useRetroSprites();
  const [distance, setDistance] = useState(0);
  const [hourmeterHours, setHourmeterHours] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [fails, setFails] = useState(0);
  const [loadedDirt, setLoadedDirt] = useState(false);
  const [rearLoaded, setRearLoaded] = useState(false);
  const [message, setMessage] = useState(() =>
    getPhase1InitialMessage(controlScheme),
  );
  const [events, setEvents] = useState<MapEvent[]>(INITIAL_PHASE1_EVENTS);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [driveMode, setDriveMode] = useState<Phase1DriveMode>("neutral");
  const [selectedGear, setSelectedGear] = useState(1);
  const [questionModal, setQuestionModal] = useState<QuestionModalState | null>(
    null,
  );
  const [speechModal, setSpeechModal] = useState<Phase1SpeechModalState | null>(
    null,
  );
  const [finalModal, setFinalModal] = useState<Phase1FinalModalState | null>(
    null,
  );
  const [isEndingSequence, setIsEndingSequence] = useState(false);
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
  const hourmeterHoursRef = useRef(0);
  const scoreRef = useRef(0);
  const driveModeRef = useRef<Phase1DriveMode>("neutral");
  const selectedGearRef = useRef(1);
  const questionModalRef = useRef<QuestionModalState | null>(null);
  const pendingQuestionModalRef = useRef<QuestionModalState | null>(null);
  const speechModalRef = useRef<Phase1SpeechModalState | null>(null);
  const questionCursorRef = useRef(0);
  const brakePressedRef = useRef(false);
  const animationSoundPlayerRef = useRef<AnimationSoundPlayer | null>(null);
  const phase1SoundPlayerRef = useRef<Phase1SoundPlayer | null>(null);
  const startupLockedRef = useRef(true);
  const startupPlaybackStartedRef = useRef(false);
  const endingSequenceRef = useRef(false);
  const finalModalDelayRef = useRef(0);
  const finalModalRef = useRef<Phase1FinalModalState | null>(null);
  const wasEnabledRef = useRef(false);
  const controlSchemeRef = useRef(controlScheme);

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

  const clearBrakeInput = () => {
    brakePressedRef.current = false;
  };

  const resetPhaseState = () => {
    const initialEvents = createInitialPhase1Events();

    eventsRef.current = initialEvents;
    activeEventIdRef.current = null;
    loadedDirtRef.current = false;
    rearLoadedRef.current = false;
    frontAnimationRef.current = null;
    rearAnimationRef.current = null;
    greaseAnimationRef.current = null;
    currentSpeedRef.current = 0;
    distanceRef.current = 0;
    hourmeterHoursRef.current = 0;
    scoreRef.current = 0;
    driveModeRef.current = "neutral";
    selectedGearRef.current = 1;
    questionModalRef.current = null;
    pendingQuestionModalRef.current = null;
    speechModalRef.current = null;
    questionCursorRef.current = 0;
    endingSequenceRef.current = false;
    finalModalDelayRef.current = 0;
    finalModalRef.current = null;
    startupLockedRef.current = true;
    startupPlaybackStartedRef.current = false;
    clearBrakeInput();

    setDistance(0);
    setHourmeterHours(0);
    setSpeed(0);
    setScore(0);
    setHits(0);
    setFails(0);
    setLoadedDirt(false);
    setRearLoaded(false);
    setMessage(getPhase1InitialMessage(controlSchemeRef.current));
    setEvents(initialEvents);
    setActiveEventId(null);
    setDriveMode("neutral");
    setSelectedGear(1);
    setQuestionModal(null);
    setSpeechModal(null);
    setFinalModal(null);
    setIsEndingSequence(false);
    setVenezitoMood("neutral");
    setAnimationTick((current) => current + 1);
    setActiveAnimationLabel("Rodagem continua");
  };

  const beginEndingSequence = () => {
    if (endingSequenceRef.current) {
      return;
    }

    endingSequenceRef.current = true;
    setIsEndingSequence(true);
    finalModalDelayRef.current = 0;
    clearBrakeInput();
    clearActiveEvent();
    setSpeechModalState(null);
    setQuestionModalState(null);
    pendingQuestionModalRef.current = null;
    driveModeRef.current = "neutral";
    setDriveMode("neutral");
    setVenezitoMood("neutral");
    setMessage("Horimetro completo. Voltando para neutro e freando.");
  };

  const finishPhase = (finalHourmeterHours: number) => {
    const finalScore = scoreRef.current;
    const previousHighScore = readPhase1HighScore();
    const nextHighScore = Math.max(previousHighScore, finalScore);

    if (nextHighScore > previousHighScore) {
      writePhase1HighScore(nextHighScore);
    }

    const nextFinalModal = {
      score: finalScore,
      highScore: nextHighScore,
      isNewHighScore: finalScore > previousHighScore,
      hourmeterHours: Math.round(finalHourmeterHours),
    };

    finalModalRef.current = nextFinalModal;
    endingSequenceRef.current = false;
    setIsEndingSequence(false);
    setFinalModal(nextFinalModal);
    clearActiveEvent();
    clearBrakeInput();
    frontAnimationRef.current = null;
    rearAnimationRef.current = null;
    greaseAnimationRef.current = null;
    currentSpeedRef.current = 0;
    setSpeed(0);
    setVenezitoMood("happy");
    setMessage("Treinamento concluido. Confira seu highscore.");
    syncAnimationLabel();
  };

  const setQuestionModalState = (nextModal: QuestionModalState | null) => {
    if (nextModal) {
      clearBrakeInput();
    }

    questionModalRef.current = nextModal;
    setQuestionModal(nextModal);
  };

  const setSpeechModalState = (nextModal: Phase1SpeechModalState | null) => {
    if (nextModal) {
      clearBrakeInput();
    }

    speechModalRef.current = nextModal;
    setSpeechModal(nextModal);

    if (nextModal) {
      currentSpeedRef.current = 0;
      setSpeed(0);
    }
  };

  const shiftDriveMode = (direction: "up" | "down") => {
    const currentMode = driveModeRef.current;
    const nextMode =
      direction === "up"
        ? DRIVE_MODE_UP[currentMode]
        : DRIVE_MODE_DOWN[currentMode];

    driveModeRef.current = nextMode;
    setDriveMode(nextMode);
  };

  const shiftSelectedGear = (delta: 1 | -1) => {
    const nextGear = clampSelectedGear(selectedGearRef.current + delta);

    selectedGearRef.current = nextGear;
    setSelectedGear(nextGear);
  };

  const clearActiveEvent = () => {
    setActiveEventId(null);
    activeEventIdRef.current = null;
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

  const penalizeEventAttempt = (
    nextMessage: string,
    options?: {
      scorePenalty?: number;
      playSound?: boolean;
    },
  ) => {
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
    hourmeterHoursRef.current = hourmeterHours;
  }, [hourmeterHours]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    activeEventIdRef.current = activeEventId;
  }, [activeEventId]);

  useEffect(() => {
    controlSchemeRef.current = controlScheme;

    if (!activeEventIdRef.current && !questionModalRef.current) {
      setMessage(getPhase1InitialMessage(controlScheme));
    }
  }, [controlScheme]);

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
    if (enabled && !wasEnabledRef.current) {
      resetPhaseState();
    }

    wasEnabledRef.current = enabled;

    if (!enabled) {
      startupPlaybackStartedRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      startupPlaybackStartedRef.current = false;
      return;
    }

    if (paused || startupPlaybackStartedRef.current) {
      return;
    }

    startupPlaybackStartedRef.current = true;
    startupLockedRef.current = true;
    clearBrakeInput();
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
  }, [enabled, paused]);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!enabled || paused) {
      return;
    }

    const inputCode = event.code;
    const scheme = controlSchemeRef.current;
    const continueKeySet = new Set(getPhase1ContinueCodes(scheme));
    const driveControlCodes = new Set<string>([
      ...scheme.codes.fnrUp,
      ...scheme.codes.fnrDown,
      ...scheme.codes.gearUp,
      ...scheme.codes.gearDown,
    ]);
    const manualEventCodes = new Set<string>([
      ...scheme.codes.pickup,
      ...scheme.codes.dig,
      ...scheme.codes.grease,
    ]);
    const startupBlockedCodes = new Set<string>([
      ...PHASE1_CONTINUE_CODES,
      ...driveControlCodes,
      ...scheme.codes.brake,
      ...manualEventCodes,
    ]);
    const handleDriveOrBrakeInput = () => {
      if (scheme.codes.brake.includes(inputCode)) {
        event.preventDefault();
        if (frontAnimationRef.current?.presetId === "idle") {
          return true;
        }
        brakePressedRef.current = true;
        return true;
      }

      if (!driveControlCodes.has(inputCode)) {
        return false;
      }

      event.preventDefault();

      if (event.repeat) {
        return true;
      }

      if (scheme.codes.fnrUp.includes(inputCode)) {
        shiftDriveMode("up");
      } else if (scheme.codes.fnrDown.includes(inputCode)) {
        shiftDriveMode("down");
      } else if (scheme.codes.gearUp.includes(inputCode)) {
        shiftSelectedGear(1);
      } else if (scheme.codes.gearDown.includes(inputCode)) {
        shiftSelectedGear(-1);
      }

      return true;
    };

    if (startupLockedRef.current) {
      if (startupBlockedCodes.has(inputCode)) {
        event.preventDefault();
      }

      return;
    }

    if (endingSequenceRef.current) {
      event.preventDefault();
      return;
    }

    if (finalModalRef.current) {
      if (!continueKeySet.has(inputCode) || event.repeat) {
        return;
      }

      event.preventDefault();
      return;
    }

    if (speechModalRef.current) {
      if (!continueKeySet.has(inputCode) || event.repeat) {
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

      const selectedDirection = getPhase1QuestionDirectionFromCode(
        inputCode,
        scheme,
      );

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

      penalizeEventAttempt(
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

    const activeEvent = eventsRef.current.find(
      (item) => item.id === activeEventIdRef.current,
    );

    if (!activeEvent) {
      handleDriveOrBrakeInput();
      return;
    }

    if (!activeEvent.type) {
      handleDriveOrBrakeInput();
      return;
    }

    const eventDefinition = getEventDefinition(activeEvent.type);

    if (isQuestionEventDefinition(eventDefinition)) {
      const acceptedCodes = getPhase1EventActionCodes(
        eventDefinition.type,
        scheme,
      );

      if (!acceptedCodes.includes(inputCode)) {
        if (handleDriveOrBrakeInput()) {
          return;
        }

        if (
          !driveControlCodes.has(inputCode) &&
          !scheme.codes.brake.includes(inputCode)
        ) {
          event.preventDefault();
        }
        return;
      }

      event.preventDefault();

      const screenX = getEventHitboxScreenX(activeEvent, distanceRef.current);
      const isWithinHitbox =
        Math.abs(screenX - PLAYER_HIT_LINE_X) <=
        eventDefinition.hitboxHalfWidth;

      if (!isWithinHitbox) {
        setMessage("Fora da hitbox do evento.");
        return;
      }

      if (
        !isRequiredDriveStateActive(
          eventDefinition.requiredDriveState,
          driveModeRef.current,
          selectedGearRef.current,
          currentSpeedRef.current,
        )
      ) {
        setMessage(
          getRequiredDriveStateAdjustmentMessage(
            eventDefinition.title,
            eventDefinition.requiredDriveState,
          ),
        );
        return;
      }

      const question = getQuestionFromCatalog(questionCursorRef.current);
      questionCursorRef.current += 1;
      pendingQuestionModalRef.current = createQuestionModalState(
        activeEvent.id,
        eventDefinition,
        question,
        `Use ${getPhase1QuestionOptionLabel(scheme)} para responder`,
      );
      setSpeechModalState(createQuestionIntroModal());
      setMessage(
        getPhase1EventActivationMessage(
          eventDefinition,
          scheme,
          getRequiredDriveStateLabel(eventDefinition.requiredDriveState),
        ),
      );
      return;
    }

    if (!isManualEventDefinition(eventDefinition)) {
      handleDriveOrBrakeInput();
      return;
    }

    const acceptedCodes = getPhase1EventActionCodes(eventDefinition.type, scheme);

    if (!manualEventCodes.has(inputCode)) {
      if (
        !driveControlCodes.has(inputCode) &&
        !scheme.codes.brake.includes(inputCode)
      ) {
        return;
      }
    }

    if (!acceptedCodes.includes(inputCode)) {
      if (handleDriveOrBrakeInput()) {
        return;
      }

      event.preventDefault();

      const screenX = getEventHitboxScreenX(activeEvent, distanceRef.current);
      const isWithinHitbox =
        Math.abs(screenX - PLAYER_HIT_LINE_X) <= eventDefinition.hitboxHalfWidth;

      if (!isWithinHitbox) {
        return;
      }

      penalizeEventAttempt(
        `Comando incorreto para ${eventDefinition.title.toLowerCase()}.`,
      );
      return;
    }

    event.preventDefault();

    const screenX = getEventHitboxScreenX(activeEvent, distanceRef.current);
    const isWithinHitbox =
      Math.abs(screenX - PLAYER_HIT_LINE_X) <= eventDefinition.hitboxHalfWidth;

    if (!isWithinHitbox) {
      setFails((current) => current + 1);
      setScore((current) => Math.max(0, current - 50));
      setMessage("Fora da hitbox do evento.");
      setVenezitoMood("sad");
      return;
    }

    if (
      !isRequiredDriveStateActive(
        eventDefinition.requiredDriveState,
        driveModeRef.current,
        selectedGearRef.current,
        currentSpeedRef.current,
      )
    ) {
      setMessage(
        getRequiredDriveStateAdjustmentMessage(
          eventDefinition.title,
          eventDefinition.requiredDriveState,
        ),
      );
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

    if (activeEvent.type === "pickup-load") {
      clearBrakeInput();
    }

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
    if (!enabled || paused) {
      return;
    }

    if (endingSequenceRef.current) {
      event.preventDefault();
      return;
    }

    if (!controlSchemeRef.current.codes.brake.includes(event.code)) {
      return;
    }

    event.preventDefault();
    brakePressedRef.current = false;
  });

  const handleWindowBlur = useEffectEvent(() => {
    clearBrakeInput();
  });

  useEffect(() => {
    if (!sprites || !enabled || paused) {
      return;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
      brakePressedRef.current = false;
    };
  }, [enabled, paused, sprites]);

  const updateFrame = (dt: number) => {
    if (finalModalRef.current) {
      return;
    }

    const activeEvent = eventsRef.current.find(
      (item) => item.id === activeEventIdRef.current,
    );
    const activeEventDefinition = activeEvent?.type
      ? getEventDefinition(activeEvent.type)
      : null;
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

    if (!startupLockedRef.current && !endingSequenceRef.current) {
      const nextHourmeterHours = Math.min(
        PHASE1_HOURMETER_TARGET_HOURS,
        hourmeterHoursRef.current + dt * PHASE1_HOURMETER_HOURS_PER_SECOND,
      );

      hourmeterHoursRef.current = nextHourmeterHours;
      setHourmeterHours(nextHourmeterHours);

      if (nextHourmeterHours >= PHASE1_HOURMETER_TARGET_HOURS) {
        beginEndingSequence();
      }
    }

    let targetSpeed = getDriveSpeed(
      driveModeRef.current,
      selectedGearRef.current,
    );

    if (startupLockedRef.current) {
      targetSpeed = 0;
    }

    if (endingSequenceRef.current) {
      targetSpeed = 0;
    }

    if (
      activeEventDefinition &&
      isTractionEventDefinition(activeEventDefinition)
    ) {
      targetSpeed = capTargetSpeed(
        targetSpeed,
        activeEventDefinition.activeSpeed,
      );
    }

    const isPickupLoadAnimation = frontAnimationRef.current?.presetId === "idle";

    if (isPickupLoadAnimation) {
      targetSpeed = capTargetSpeed(targetSpeed, FRONT_LOAD_SPEED);
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

    if (
      (brakePressedRef.current && !isPickupLoadAnimation) ||
      endingSequenceRef.current
    ) {
      targetSpeed = 0;
    }

    const speedResponse =
      (brakePressedRef.current && !isPickupLoadAnimation) ||
      endingSequenceRef.current
        ? BRAKE_RESPONSE
        : driveModeRef.current === "neutral"
          ? NEUTRAL_RESPONSE
          : DRIVE_RESPONSE;
    let nextSpeed =
      currentSpeedRef.current +
      (targetSpeed - currentSpeedRef.current) * Math.min(1, dt * speedResponse);
    let nextDistance = distanceRef.current + nextSpeed * dt;

    if (nextDistance < 0) {
      nextDistance = 0;
      nextSpeed = 0;
    }

    currentSpeedRef.current = nextSpeed;
    setSpeed(nextSpeed);

    if (greaseAnimationRef.current) {
      if (!greaseAnimationRef.current.hasStarted) {
        if (Math.abs(nextSpeed) <= 2) {
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

    distanceRef.current = nextDistance;
    setDistance(nextDistance);

    if (!endingSequenceRef.current) {
      setScore(
        (current) => current + Math.round(Math.max(0, nextSpeed) * dt * 0.08),
      );
    }

    if (endingSequenceRef.current) {
      const isStopped = Math.abs(nextSpeed) <= FINAL_STOP_SPEED_THRESHOLD;
      const animationsDone =
        !frontAnimationRef.current &&
        !rearAnimationRef.current &&
        !greaseAnimationRef.current;

      if (isStopped && animationsDone) {
        finalModalDelayRef.current += dt;
      } else {
        finalModalDelayRef.current = 0;
      }

      if (finalModalDelayRef.current >= FINAL_MODAL_DELAY_SECONDS) {
        finishPhase(hourmeterHoursRef.current);
      }

      return;
    }

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
        setMessage(
          getPhase1EventActivationMessage(
            eventInfo,
            controlSchemeRef.current,
            getRequiredDriveStateLabel(eventInfo.requiredDriveState),
          ),
        );
        setVenezitoMood("neutral");

        if (isTractionEventDefinition(eventInfo)) {
          playPhase1Sound("mud");
        }
      }
    }

    const currentActiveEvent = eventsRef.current.find(
      (item) => item.id === activeEventIdRef.current,
    );

    if (!currentActiveEvent) {
      return;
    }

    if (!currentActiveEvent.type) {
      return;
    }
  };

  useGameLoop(
    (dt) => updateFrame(dt),
    Boolean(sprites) && enabled && !paused && !finalModal,
  );

  return {
    sprites,
    excavatorScene,
    distance,
    hourmeterHours,
    speed,
    score,
    hits,
    fails,
    driveMode,
    selectedGear,
    loadedDirt,
    rearLoaded,
    message,
    venezitoMood,
    events,
    activeEventId,
    questionModal,
    speechModal,
    finalModal,
    isEndingSequence,
    animationTick,
    activeAnimationLabel,
    frontAnimationRef,
    greaseAnimationElapsed: greaseAnimationRef.current?.hasStarted
      ? greaseAnimationRef.current.elapsed
      : null,
    rearAnimationRef,
  };
}
