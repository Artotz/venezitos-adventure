const movementKeys = {
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  up: ['ArrowUp', 'w', 'W'],
  down: ['ArrowDown', 's', 'S'],
}

const wasdKeys = {
  left: ['a', 'A'],
  right: ['d', 'D'],
  up: ['w', 'W'],
  down: ['s', 'S'],
}

const arrowKeys = {
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  up: ['ArrowUp'],
  down: ['ArrowDown'],
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

  getWasdVector() {
    const horizontal =
      Number(this.isAnyPressed(wasdKeys.right)) -
      Number(this.isAnyPressed(wasdKeys.left))
    const vertical =
      Number(this.isAnyPressed(wasdKeys.down)) -
      Number(this.isAnyPressed(wasdKeys.up))

    return { x: horizontal, y: vertical }
  }

  getArrowTractorControls() {
    const steering =
      Number(this.isAnyPressed(arrowKeys.right)) -
      Number(this.isAnyPressed(arrowKeys.left))
    const throttle =
      Number(this.isAnyPressed(arrowKeys.up)) -
      Number(this.isAnyPressed(arrowKeys.down))

    return { steering, throttle }
  }

  private isAnyPressed(keys: string[]) {
    return keys.some((key) => this.pressedKeys.has(key))
  }
}
