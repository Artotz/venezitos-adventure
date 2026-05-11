import type {
  Phase1Question,
  QuestionChoiceDirection,
  QuestionEventDefinition,
  QuestionModalState,
} from './types'

const QUESTION_DIRECTION_BY_CODE: Partial<
  Record<KeyboardEvent['code'], QuestionChoiceDirection>
> = {
  ArrowUp: 'up',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowDown: 'down',
}

export function createQuestionModalState(
  eventId: number,
  definition: QuestionEventDefinition,
  question: Phase1Question,
  selectionHint = definition.selectionHint,
): QuestionModalState {
  return {
    eventId,
    title: definition.modalTitle,
    selectionHint,
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

export function getCorrectQuestionAnswerLabel(question: Phase1Question) {
  return question.choices[question.correctDirection].label
}
