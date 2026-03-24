const movementKeys = {
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  up: ['ArrowUp', 'w', 'W'],
  down: ['ArrowDown', 's', 'S'],
}

export class InputManager {
  private pressedKeys = new Set<string>()
  private listening = false

  private handleKeyDown = (event: KeyboardEvent) => {
    this.pressedKeys.add(event.key)
  }

  private handleKeyUp = (event: KeyboardEvent) => {
    this.pressedKeys.delete(event.key)
  }

  private handleBlur = () => {
    this.pressedKeys.clear()
  }

  attach() {
    if (this.listening) {
      return
    }

    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    window.addEventListener('blur', this.handleBlur)
    this.listening = true
  }

  detach() {
    if (!this.listening) {
      return
    }

    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    window.removeEventListener('blur', this.handleBlur)
    this.pressedKeys.clear()
    this.listening = false
  }

  getMovementVector() {
    const horizontal =
      Number(this.isAnyPressed(movementKeys.right)) -
      Number(this.isAnyPressed(movementKeys.left))
    const vertical =
      Number(this.isAnyPressed(movementKeys.down)) -
      Number(this.isAnyPressed(movementKeys.up))

    return { x: horizontal, y: vertical }
  }

  private isAnyPressed(keys: string[]) {
    return keys.some((key) => this.pressedKeys.has(key))
  }
}
