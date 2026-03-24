import {
  BACKGROUND_COLOR,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GRID_COLOR,
  PLAYER_COLOR,
  PLAYER_SHADOW_COLOR,
  PLAYER_SIZE,
  PLAYER_SPEED,
  SCORE_PER_SECOND,
} from './constants'
import { InputManager } from './input'
import type { Player } from './types'

export class GameEngine {
  width: number
  height: number
  player: Player
  input: InputManager
  score: number

  constructor(input: InputManager, width = CANVAS_WIDTH, height = CANVAS_HEIGHT) {
    this.width = width
    this.height = height
    this.input = input
    this.score = 0
    this.player = this.createPlayer()
  }

  update(dt: number) {
    const movement = this.input.getMovementVector()
    const length = Math.hypot(movement.x, movement.y) || 1
    const velocityX = (movement.x / length) * this.player.speed
    const velocityY = (movement.y / length) * this.player.speed

    this.player.position.x += velocityX * dt
    this.player.position.y += velocityY * dt

    this.player.position.x = this.clamp(
      this.player.position.x,
      0,
      this.width - this.player.size,
    )
    this.player.position.y = this.clamp(
      this.player.position.y,
      0,
      this.height - this.player.size,
    )

    this.score += SCORE_PER_SECOND * dt
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(0, 0, this.width, this.height)

    this.drawGrid(ctx)
    this.drawPlayer(ctx)
  }

  reset() {
    this.score = 0
    this.player = this.createPlayer()
  }

  getScore() {
    return Math.floor(this.score)
  }

  private createPlayer(): Player {
    return {
      position: {
        x: this.width / 2 - PLAYER_SIZE / 2,
        y: this.height / 2 - PLAYER_SIZE / 2,
      },
      size: PLAYER_SIZE,
      speed: PLAYER_SPEED,
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    const gridSize = 40

    ctx.save()
    ctx.strokeStyle = GRID_COLOR
    ctx.lineWidth = 1

    for (let x = 0; x <= this.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.height)
      ctx.stroke()
    }

    for (let y = 0; y <= this.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.width, y)
      ctx.stroke()
    }

    ctx.restore()
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.player.position

    ctx.save()
    ctx.shadowColor = PLAYER_SHADOW_COLOR
    ctx.shadowBlur = 18
    ctx.fillStyle = PLAYER_COLOR
    ctx.fillRect(x, y, this.player.size, this.player.size)
    ctx.restore()
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }
}
