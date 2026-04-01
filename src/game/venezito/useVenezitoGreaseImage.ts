import { useEffect, useState } from "react"

import greaseSrc from "../../assets/venezito/venezito-grease.png"
import { loadImage } from "../loadImage"

export function useVenezitoGreaseImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    let cancelled = false

    loadImage(greaseSrc)
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
