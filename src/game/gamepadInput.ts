import { useEffect, useRef } from "react";

export const GAMEPAD_BUTTON_CODES = {
  faceBottom: "GamepadButton0",
  faceRight: "GamepadButton1",
  faceLeft: "GamepadButton2",
  faceTop: "GamepadButton3",
  select: "GamepadButton8",
  start: "GamepadButton9",
  dpadUp: "GamepadButton12",
  dpadDown: "GamepadButton13",
  dpadLeft: "GamepadButton14",
  dpadRight: "GamepadButton15",
} as const;

export const GAMEPAD_AXIS_CODES = {
  leftStickLeft: "GamepadAxisLeftStickLeft",
  leftStickRight: "GamepadAxisLeftStickRight",
  leftStickUp: "GamepadAxisLeftStickUp",
  leftStickDown: "GamepadAxisLeftStickDown",
  rightStickLeft: "GamepadAxisRightStickLeft",
  rightStickRight: "GamepadAxisRightStickRight",
  rightStickUp: "GamepadAxisRightStickUp",
  rightStickDown: "GamepadAxisRightStickDown",
} as const;

const GAMEPAD_AXIS_PRESS_THRESHOLD = 0.45;

const KEY_BY_GAMEPAD_CODE: Record<string, string> = {
  [GAMEPAD_BUTTON_CODES.dpadUp]: "ArrowUp",
  [GAMEPAD_BUTTON_CODES.dpadDown]: "ArrowDown",
  [GAMEPAD_BUTTON_CODES.dpadLeft]: "ArrowLeft",
  [GAMEPAD_BUTTON_CODES.dpadRight]: "ArrowRight",
  [GAMEPAD_AXIS_CODES.leftStickUp]: "ArrowUp",
  [GAMEPAD_AXIS_CODES.leftStickDown]: "ArrowDown",
  [GAMEPAD_AXIS_CODES.leftStickLeft]: "ArrowLeft",
  [GAMEPAD_AXIS_CODES.leftStickRight]: "ArrowRight",
  [GAMEPAD_AXIS_CODES.rightStickUp]: "ArrowUp",
  [GAMEPAD_AXIS_CODES.rightStickDown]: "ArrowDown",
  [GAMEPAD_AXIS_CODES.rightStickLeft]: "ArrowLeft",
  [GAMEPAD_AXIS_CODES.rightStickRight]: "ArrowRight",
  [GAMEPAD_BUTTON_CODES.faceBottom]: "Enter",
  [GAMEPAD_BUTTON_CODES.faceRight]: "Enter",
  [GAMEPAD_BUTTON_CODES.faceLeft]: "Enter",
  [GAMEPAD_BUTTON_CODES.faceTop]: "Enter",
  [GAMEPAD_BUTTON_CODES.start]: "Escape",
};

export const GAMEPAD_CONFIRM_CODES = [
  GAMEPAD_BUTTON_CODES.faceBottom,
  GAMEPAD_BUTTON_CODES.faceRight,
  GAMEPAD_BUTTON_CODES.faceLeft,
  GAMEPAD_BUTTON_CODES.faceTop,
] as const;

export const GAMEPAD_PAUSE_CODES = [
  GAMEPAD_BUTTON_CODES.start,
  GAMEPAD_BUTTON_CODES.select,
] as const;

export const GAMEPAD_UP_CODES = [
  GAMEPAD_BUTTON_CODES.dpadUp,
  GAMEPAD_AXIS_CODES.leftStickUp,
  GAMEPAD_AXIS_CODES.rightStickUp,
] as const;

export const GAMEPAD_DOWN_CODES = [
  GAMEPAD_BUTTON_CODES.dpadDown,
  GAMEPAD_AXIS_CODES.leftStickDown,
  GAMEPAD_AXIS_CODES.rightStickDown,
] as const;

export const GAMEPAD_LEFT_CODES = [
  GAMEPAD_BUTTON_CODES.dpadLeft,
  GAMEPAD_AXIS_CODES.leftStickLeft,
  GAMEPAD_AXIS_CODES.rightStickLeft,
] as const;

export const GAMEPAD_RIGHT_CODES = [
  GAMEPAD_BUTTON_CODES.dpadRight,
  GAMEPAD_AXIS_CODES.leftStickRight,
  GAMEPAD_AXIS_CODES.rightStickRight,
] as const;

export function isGamepadConfirmCode(code: string) {
  return (GAMEPAD_CONFIRM_CODES as readonly string[]).includes(code);
}

export function isGamepadPauseCode(code: string) {
  return (GAMEPAD_PAUSE_CODES as readonly string[]).includes(code);
}

export function isMenuUpCode(code: string) {
  return code === "ArrowUp" || (GAMEPAD_UP_CODES as readonly string[]).includes(code);
}

export function isMenuDownCode(code: string) {
  return code === "ArrowDown" || (GAMEPAD_DOWN_CODES as readonly string[]).includes(code);
}

export function isMenuLeftCode(code: string) {
  return code === "ArrowLeft" || (GAMEPAD_LEFT_CODES as readonly string[]).includes(code);
}

export function isMenuRightCode(code: string) {
  return code === "ArrowRight" || (GAMEPAD_RIGHT_CODES as readonly string[]).includes(code);
}

export function isMenuConfirmCode(code: string) {
  return code === "Enter" || code === "NumpadEnter" || isGamepadConfirmCode(code);
}

export function getPressedGamepadCodes() {
  if (typeof navigator === "undefined" || !navigator.getGamepads) {
    return [];
  }

  const pressedCodes = new Set<string>();

  for (const gamepad of navigator.getGamepads()) {
    if (!gamepad) {
      continue;
    }

    gamepad.buttons.forEach((button, index) => {
      if (button.pressed) {
        pressedCodes.add(`GamepadButton${index}`);
      }
    });

    addAxisCodes(pressedCodes, gamepad.axes[0] ?? 0, gamepad.axes[1] ?? 0, {
      left: GAMEPAD_AXIS_CODES.leftStickLeft,
      right: GAMEPAD_AXIS_CODES.leftStickRight,
      up: GAMEPAD_AXIS_CODES.leftStickUp,
      down: GAMEPAD_AXIS_CODES.leftStickDown,
    });
    addAxisCodes(pressedCodes, gamepad.axes[2] ?? 0, gamepad.axes[3] ?? 0, {
      left: GAMEPAD_AXIS_CODES.rightStickLeft,
      right: GAMEPAD_AXIS_CODES.rightStickRight,
      up: GAMEPAD_AXIS_CODES.rightStickUp,
      down: GAMEPAD_AXIS_CODES.rightStickDown,
    });
  }

  return [...pressedCodes];
}

export function useGamepadKeyboardBridge(enabled = true) {
  const previousCodesRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      previousCodesRef.current = new Set();
      return;
    }

    const tick = () => {
      const currentCodes = new Set(getPressedGamepadCodes());
      const previousCodes = previousCodesRef.current;

      for (const code of currentCodes) {
        if (!previousCodes.has(code)) {
          dispatchGamepadKeyboardEvent("keydown", code);
        }
      }

      for (const code of previousCodes) {
        if (!currentCodes.has(code)) {
          dispatchGamepadKeyboardEvent("keyup", code);
        }
      }

      previousCodesRef.current = currentCodes;
      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      for (const code of previousCodesRef.current) {
        dispatchGamepadKeyboardEvent("keyup", code);
      }

      previousCodesRef.current = new Set();
      animationFrameRef.current = null;
    };
  }, [enabled]);
}

function dispatchGamepadKeyboardEvent(type: "keydown" | "keyup", code: string) {
  window.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: KEY_BY_GAMEPAD_CODE[code] ?? code,
    }),
  );
}

function addAxisCodes(
  pressedCodes: Set<string>,
  horizontalAxis: number,
  verticalAxis: number,
  codes: {
    left: string;
    right: string;
    up: string;
    down: string;
  },
) {
  if (horizontalAxis <= -GAMEPAD_AXIS_PRESS_THRESHOLD) {
    pressedCodes.add(codes.left);
  }

  if (horizontalAxis >= GAMEPAD_AXIS_PRESS_THRESHOLD) {
    pressedCodes.add(codes.right);
  }

  if (verticalAxis <= -GAMEPAD_AXIS_PRESS_THRESHOLD) {
    pressedCodes.add(codes.up);
  }

  if (verticalAxis >= GAMEPAD_AXIS_PRESS_THRESHOLD) {
    pressedCodes.add(codes.down);
  }
}
