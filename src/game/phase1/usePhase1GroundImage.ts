import { useEffect, useState } from 'react'

import groundSrc from '../../assets/ground.png'
import { loadImage } from '../loadImage'

export function usePhase1GroundImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    let cancelled = false

    loadImage(groundSrc)
      .then((loadedImage) => {
        if (!cancelled) {
          setImage(loadedImage)
        }
      })
      .catch((error: unknown) => {
        console.error('Falha ao carregar o chao da fase 1.', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return image
}
