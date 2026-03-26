import type {
  Phase1Question,
  QuestionChoiceDirection,
  QuestionEventDefinition,
  QuestionModalState,
} from './types'

const QUESTION_DIRECTION_BY_CODE: Partial<
  Record<KeyboardEvent['code'], QuestionChoiceDirection>
> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  KeyS: 'down',
  ArrowDown: 'down',
}

export function createQuestionModalState(
  eventId: number,
  definition: QuestionEventDefinition,
  question: Phase1Question,
): QuestionModalState {
  return {
    eventId,
    title: definition.modalTitle,
    selectionHint: definition.selectionHint,
    question,
  }
}

export function getQuestionDirectionFromKey(event: KeyboardEvent) {
  return QUESTION_DIRECTION_BY_CODE[event.code] ?? null
}

export function isCorrectQuestionAnswer(
  question: Phase1Question,
  direction: QuestionChoiceDirection,
) {
  return question.correctDirection === direction
}
