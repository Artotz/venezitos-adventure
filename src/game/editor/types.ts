import type { Point } from '../retro/types'

export type EditorTab = 'poses' | 'animations' | 'sounds' | 'points'

export type EditorPoint = Point & {
  id: string
}
