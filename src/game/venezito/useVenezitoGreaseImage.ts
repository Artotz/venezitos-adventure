import { useEffect, useState } from "react"

import greaseSrc from "../../assets/venezito/venezito-grease.png"
import { loadOptimizedImage, type LoadedImageSource } from "../imageSource"

export function useVenezitoGreaseImage() {
  const [image, setImage] = useState<LoadedImageSource | null>(null)

  useEffect(() => {
    let cancelled = false

    loadOptimizedImage(greaseSrc, {
      maxHeight: 512,
      maxWidth: 512,
    })
      .then((loadedImage) => {
        if (!cancelled) {
          setImage(loadedImage)
        }
      })
      .catch((error: unknown) => {
        console.error("Falha ao carregar a imagem de venezito-grease.", error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return image
}
