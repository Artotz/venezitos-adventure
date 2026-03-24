import { useEffect, useRef } from 'react'
import { MAX_DELTA_TIME } from './constants'

type FrameCallback = (dt: number) => void

export function useGameLoop(callback: FrameCallback, running: boolean) {
  const frameIdRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!running) {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
      }
      frameIdRef.current = null
      lastTimeRef.current = null
      return
    }

    const loop = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time
      }

      const dt = Math.min((time - lastTimeRef.current) / 1000, MAX_DELTA_TIME)
      lastTimeRef.current = time

      callbackRef.current(dt)
      frameIdRef.current = requestAnimationFrame(loop)
    }

    frameIdRef.current = requestAnimationFrame(loop)

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
      }
      frameIdRef.current = null
      lastTimeRef.current = null
    }
  }, [running])
}
