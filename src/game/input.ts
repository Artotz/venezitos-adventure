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
  private pressedCodes = new Set<string>()
  private keyPressCounts = new Map<string, number>()
  private keyByCode = new Map<string, string>()
  private listening = false

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.pressedCodes.has(event.code)) {
      this.keyPressCounts.set(
        event.key,
        (this.keyPressCounts.get(event.key) ?? 0) + 1,
      )
      this.keyByCode.set(event.code, event.key)
    }

    this.pressedCodes.add(event.code)
  }

  private handleKeyUp = (event: KeyboardEvent) => {
    const key = this.keyByCode.get(event.code) ?? event.key
    const keyPressCount = this.keyPressCounts.get(key) ?? 0

    if (keyPressCount <= 1) {
      this.keyPressCounts.delete(key)
    } else {
      this.keyPressCounts.set(key, keyPressCount - 1)
    }

    this.keyByCode.delete(event.code)
    this.pressedCodes.delete(event.code)
  }

  private handleBlur = () => {
    this.pressedCodes.clear()
    this.keyPressCounts.clear()
    this.keyByCode.clear()
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
    this.pressedCodes.clear()
    this.keyPressCounts.clear()
    this.keyByCode.clear()
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
    return keys.some(
      (key) => this.keyPressCounts.has(key) || this.pressedCodes.has(key),
    )
  }
}
