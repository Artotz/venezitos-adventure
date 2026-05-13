import { TEXT } from "../i18n";
import type { Phase1Question } from "./types";

export const QUESTION_CATALOG: Phase1Question[] = [
  {
    id: "question-safety-lock",
    prompt:
      TEXT.phase1.questions.safetyLock.prompt,
    choices: {
      up: { label: TEXT.phase1.questions.safetyLock.up },
      left: { label: TEXT.phase1.questions.safetyLock.left },
      right: { label: TEXT.phase1.questions.safetyLock.right },
      down: { label: TEXT.phase1.questions.safetyLock.down },
    },
    correctDirection: "down",
    explanation: TEXT.phase1.questions.safetyLock.explanation,
    successMessage: TEXT.phase1.questions.safetyLock.success,
    failureMessage: TEXT.phase1.questions.safetyLock.failure,
    reward: 220,
    penalty: 120,
  },
  {
    id: "question-loader-height",
    prompt:
      TEXT.phase1.questions.loaderHeight.prompt,
    choices: {
      up: { label: TEXT.phase1.questions.loaderHeight.up },
      left: { label: TEXT.phase1.questions.loaderHeight.left },
      right: { label: TEXT.phase1.questions.loaderHeight.right },
      down: { label: TEXT.phase1.questions.loaderHeight.down },
    },
    correctDirection: "up",
    explanation: TEXT.phase1.questions.loaderHeight.explanation,
    successMessage: TEXT.phase1.questions.loaderHeight.success,
    failureMessage: TEXT.phase1.questions.loaderHeight.failure,
    reward: 220,
    penalty: 120,
  },
  {
    id: "question-rear-dig",
    prompt:
      TEXT.phase1.questions.rearDig.prompt,
    choices: {
      up: { label: TEXT.phase1.questions.rearDig.up },
      left: { label: TEXT.phase1.questions.rearDig.left },
      right: { label: TEXT.phase1.questions.rearDig.right },
      down: { label: TEXT.phase1.questions.rearDig.down },
    },
    correctDirection: "left",
    explanation: TEXT.phase1.questions.rearDig.explanation,
    successMessage: TEXT.phase1.questions.rearDig.success,
    failureMessage: TEXT.phase1.questions.rearDig.failure,
    reward: 220,
    penalty: 120,
  },
];

export function getQuestionFromCatalog(cursor: number) {
  return QUESTION_CATALOG[cursor % QUESTION_CATALOG.length];
}
