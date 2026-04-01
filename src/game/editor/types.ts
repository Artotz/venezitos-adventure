import type { Point } from '../retro/types'

export type EditorTab =
  | 'poses'
  | 'animations'
  | 'grease'
  | 'sounds'
  | 'points'

export type EditorPoint = Point & {
  id: string
}
