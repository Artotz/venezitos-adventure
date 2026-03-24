export type Vector2 = {
  x: number
  y: number
}

export type Player = {
  position: Vector2
  size: number
  speed: number
}

export type GameSnapshot = {
  score: number
  paused: boolean
}
