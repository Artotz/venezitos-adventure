import { useEffect, useState } from 'react'

import instructorSrc from '../../assets/venezito.png'

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Falha ao carregar ${src}`))
    image.src = src
  })
}

export function usePhase1InstructorImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    let cancelled = false

    loadImage(instructorSrc)
      .then((loadedImage) => {
        if (!cancelled) {
          setImage(loadedImage)
        }
      })
      .catch((error: unknown) => {
        console.error('Falha ao carregar o instrutor da fase 1.', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return image
}
