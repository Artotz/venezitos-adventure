import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'

import { getAnimationTotalDuration } from '../retro/animations'
import { measureBaseExcavator } from '../retro/render'
import { useRetroSprites } from '../retro/sprites'
import type { ActiveAnimation, AnimationPresetId } from '../retro/types'
import { useGameLoop } from '../useGameLoop'
import {
  BASE_SPEED,
  EVENT_BUTTON,
  EVENT_CONFIG,
  EVENT_HITBOX_HALF_WIDTH,
  FRONT_LOAD_SPEED,
  INITIAL_EVENTS,
  INITIAL_MESSAGE,
  LOW_TRACTION_SPEED,
  PLAYER_HIT_LINE_X,
} from './config'
import {
  assignSpawnedEventVariants,
  cloneEvents,
  describeMapEvent,
  getEventHitboxScreenX,
  resolveMapEventVariant,
  updateEventStatus,
} from './events'
import type { MapEvent } from './types'

const INITIAL_PHASE1_EVENTS = assignSpawnedEventVariants(
  cloneEvents(INITIAL_EVENTS),
  0,
  false,
  false,
)

export function usePhase1Game() {
  const sprites = useRetroSprites()
  const [distance, setDistance] = useState(0)
  const [speed, setSpeed] = useState(BASE_SPEED)
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [fails, setFails] = useState(0)
  const [loadedDirt, setLoadedDirt] = useState(false)
  const [rearLoaded, setRearLoaded] = useState(false)
  const [message, setMessage] = useState(INITIAL_MESSAGE)
  const [events, setEvents] = useState<MapEvent[]>(INITIAL_PHASE1_EVENTS)
  const [activeEventId, setActiveEventId] = useState<number | null>(null)
  const [animationTick, setAnimationTick] = useState(0)
  const [activeAnimationLabel, setActiveAnimationLabel] = useState(
    'Rodagem continua',
  )

  const eventsRef = useRef<MapEvent[]>(INITIAL_PHASE1_EVENTS)
  const activeEventIdRef = useRef<number | null>(null)
  const loadedDirtRef = useRef(false)
  const rearLoadedRef = useRef(false)
  const frontAnimationRef = useRef<ActiveAnimation | null>(null)
  const rearAnimationRef = useRef<ActiveAnimation | null>(null)
  const currentSpeedRef = useRef(BASE_SPEED)
  const distanceRef = useRef(0)

  const excavatorScene = useMemo(
    () => (sprites ? measureBaseExcavator(sprites) : null),
    [sprites],
  )

  const syncAnimationLabel = () => {
    const labels = [
      frontAnimationRef.current?.label,
      rearAnimationRef.current?.label,
    ].filter(Boolean)

    setActiveAnimationLabel(labels.join(' + ') || 'Rodagem continua')
  }

  const resolveEvent = (eventId: number, nextMessage: string) => {
    const nextEvents = updateEventStatus(eventsRef.current, eventId, 'resolved')

    eventsRef.current = nextEvents
    setEvents(nextEvents)
    setActiveEventId(null)
    activeEventIdRef.current = null
    setHits((current) => current + 1)
    setMessage(nextMessage)
  }

  const failEvent = (eventId: number, nextMessage: string) => {
    const nextEvents = updateEventStatus(eventsRef.current, eventId, 'missed')

    eventsRef.current = nextEvents
    setEvents(nextEvents)
    setActiveEventId(null)
    activeEventIdRef.current = null
    setFails((current) => current + 1)
    setScore((current) => Math.max(0, current - 90))
    setMessage(nextMessage)
  }

  const startAnimation = (
    target: MutableRefObject<ActiveAnimation | null>,
    presetId: AnimationPresetId,
    label: string,
    lockMovement: boolean,
    onComplete?: () => void,
  ) => {
    target.current = {
      presetId,
      label,
      elapsed: 0,
      lockMovement,
      onComplete,
    }
    syncAnimationLabel()
  }

  useEffect(() => {
    loadedDirtRef.current = loadedDirt
  }, [loadedDirt])

  useEffect(() => {
    rearLoadedRef.current = rearLoaded
  }, [rearLoaded])

  useEffect(() => {
    currentSpeedRef.current = speed
  }, [speed])

  useEffect(() => {
    distanceRef.current = distance
  }, [distance])

  useEffect(() => {
    activeEventIdRef.current = activeEventId
  }, [activeEventId])

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const activeEvent = eventsRef.current.find(
      (item) => item.id === activeEventIdRef.current,
    )

    if (!activeEvent) {
      return
    }

    const pressedKey =
      event.key.length === 1 ? event.key.toUpperCase() : event.key
    const config = EVENT_CONFIG[activeEvent.type]

    if (pressedKey !== config.key) {
      return
    }

    const screenX = getEventHitboxScreenX(activeEvent, distanceRef.current)

    if (Math.abs(screenX - PLAYER_HIT_LINE_X) > EVENT_HITBOX_HALF_WIDTH) {
      setFails((current) => current + 1)
      setScore((current) => Math.max(0, current - 50))
      setMessage('Fora da hitbox do evento.')
      return
    }

    const variant = resolveMapEventVariant(
      activeEvent,
      loadedDirtRef.current,
      rearLoadedRef.current,
    )

    if (variant === 'pickup-load' || variant === 'pickup-unload') {
      resolveEvent(
        activeEvent.id,
        variant === 'pickup-unload'
          ? 'Terra descarregada no caminhao.'
          : 'Terra apanhada. A cacamba esta carregada.',
      )
      setScore((current) => current + 180)

      if (variant === 'pickup-unload') {
        startAnimation(
          frontAnimationRef,
          'idle2',
          'Ciclo de cacamba 2',
          true,
          () => {
            setLoadedDirt(false)
            loadedDirtRef.current = false
          },
        )
      } else {
        startAnimation(
          frontAnimationRef,
          'idle',
          'Ciclo de cacamba 1',
          false,
          () => {
            setLoadedDirt(true)
            loadedDirtRef.current = true
          },
        )
      }

      return
    }

    if (variant === 'dig-load' || variant === 'dig-unload') {
      resolveEvent(
        activeEvent.id,
        variant === 'dig-unload'
          ? 'Retroescavadeira descarregada na vala.'
          : 'Retroescavadeira carregada atras.',
      )
      setScore((current) => current + 180)

      if (variant === 'dig-unload') {
        startAnimation(
          rearAnimationRef,
          'arm-unload',
          'Descarregando traseira',
          true,
          () => {
            setRearLoaded(false)
            rearLoadedRef.current = false
          },
        )
      } else {
        startAnimation(
          rearAnimationRef,
          'arm-extended',
          'Braco estendido',
          true,
          () => {
            setRearLoaded(true)
            rearLoadedRef.current = true
          },
        )
      }

      return
    }

    resolveEvent(activeEvent.id, '4x4 ligado. A tracao voltou ao normal.')
    setScore((current) => current + 180)
  })

  useEffect(() => {
    if (!sprites) {
      return
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [sprites])

  const updateFrame = (dt: number) => {
    const activeEvent = eventsRef.current.find(
      (item) => item.id === activeEventIdRef.current,
    )

    const updateAnimation = (
      animation: ActiveAnimation | null,
      clear: () => void,
    ) => {
      if (!animation) {
        return
      }

      animation.elapsed += dt * 1000

      if (animation.elapsed >= getAnimationTotalDuration(animation.presetId)) {
        const onComplete = animation.onComplete
        clear()
        onComplete?.()
        syncAnimationLabel()
      }
    }

    updateAnimation(frontAnimationRef.current, () => {
      frontAnimationRef.current = null
    })
    updateAnimation(rearAnimationRef.current, () => {
      rearAnimationRef.current = null
    })

    if (frontAnimationRef.current || rearAnimationRef.current) {
      setAnimationTick((current) => current + 1)
    }

    let targetSpeed = BASE_SPEED

    if (activeEvent?.type === 'traction') {
      targetSpeed = LOW_TRACTION_SPEED
    }

    if (frontAnimationRef.current?.presetId === 'idle') {
      targetSpeed = Math.min(targetSpeed, FRONT_LOAD_SPEED)
    }

    if (
      frontAnimationRef.current?.lockMovement ||
      rearAnimationRef.current?.lockMovement
    ) {
      targetSpeed = 0
    }

    const nextSpeed =
      currentSpeedRef.current +
      (targetSpeed - currentSpeedRef.current) * Math.min(1, dt * 4)

    currentSpeedRef.current = nextSpeed
    setSpeed(nextSpeed)

    const nextDistance = distanceRef.current + nextSpeed * dt
    distanceRef.current = nextDistance
    setDistance(nextDistance)
    setScore((current) => current + Math.round(nextSpeed * dt * 0.08))

    const spawnedEvents = assignSpawnedEventVariants(
      eventsRef.current,
      nextDistance,
      loadedDirtRef.current,
      rearLoadedRef.current,
    )

    if (spawnedEvents !== eventsRef.current) {
      eventsRef.current = spawnedEvents
      setEvents(spawnedEvents)
    }

    const nextUpcoming = eventsRef.current.find(
      (item) => item.status === 'upcoming',
    )

    if (nextUpcoming) {
      const screenX = getEventHitboxScreenX(nextUpcoming, nextDistance)

      if (Math.abs(screenX - PLAYER_HIT_LINE_X) <= EVENT_HITBOX_HALF_WIDTH) {
        const nextEvents = updateEventStatus(
          eventsRef.current,
          nextUpcoming.id,
          'active',
        )

        eventsRef.current = nextEvents
        setEvents(nextEvents)
        setActiveEventId(nextUpcoming.id)
        activeEventIdRef.current = nextUpcoming.id
        const eventInfo = describeMapEvent(
          nextUpcoming,
          loadedDirtRef.current,
          rearLoadedRef.current,
        )
        setMessage(`${eventInfo.title}: pressione ${EVENT_BUTTON}.`)
      }
    }

    const currentActiveEvent = eventsRef.current.find(
      (item) => item.id === activeEventIdRef.current,
    )

    if (!currentActiveEvent) {
      return
    }

    const screenX = getEventHitboxScreenX(currentActiveEvent, nextDistance)

    if (screenX > PLAYER_HIT_LINE_X + EVENT_HITBOX_HALF_WIDTH) {
      failEvent(currentActiveEvent.id, 'O evento passou da hitbox sem resposta.')
    }
  }

  useGameLoop((dt) => updateFrame(dt), Boolean(sprites))

  return {
    sprites,
    excavatorScene,
    distance,
    speed,
    score,
    hits,
    fails,
    loadedDirt,
    rearLoaded,
    message,
    events,
    activeEventId,
    animationTick,
    activeAnimationLabel,
    frontAnimationRef,
    rearAnimationRef,
  }
}
