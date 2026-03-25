import { useEffect, useState } from 'react'

import type { LoadedSpriteMap, SpriteName } from './types'

const spriteModules = import.meta.glob('../../assets/retro/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function compareLayerNames(a: string, b: string) {
  return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Falha ao carregar ${src}`))
    image.src = src
  })
}

export function useRetroSprites() {
  const [sprites, setSprites] = useState<LoadedSpriteMap | null>(null)

  useEffect(() => {
    const entries = Object.entries(spriteModules)
      .map(([path, src]) => ({
        name: (path.split('/').pop() ?? path) as SpriteName,
        src,
      }))
      .sort((a, b) => compareLayerNames(a.name, b.name))

    Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        image: await loadImage(entry.src),
      })),
    )
      .then((loadedSprites) => {
        const spriteMap = loadedSprites.reduce<LoadedSpriteMap>(
          (accumulator, sprite) => {
            accumulator[sprite.name] = sprite.image
            return accumulator
          },
          {} as LoadedSpriteMap,
        )

        setSprites(spriteMap)
      })
      .catch((error: unknown) => {
        console.error('Falha ao carregar as camadas retro.', error)
      })
  }, [])

  return sprites
}
