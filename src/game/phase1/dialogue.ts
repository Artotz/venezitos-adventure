import { PHASE1_START_MODAL_HINT } from "./config";
import { TEXT } from "../i18n";
import type { Phase1Question, Phase1SpeechModalState } from "./types";

export const PHASE1_MANIFESTO_MODAL: Phase1SpeechModalState = {
  title: TEXT.phase1.dialogue.manifestoTitle,
  speech: TEXT.phase1.dialogue.manifestoSpeech,
  body: TEXT.phase1.dialogue.manifestoBody.join("\n\n"),
  continueHint: PHASE1_START_MODAL_HINT,
  mood: "neutral",
};

export function createQuestionFeedbackModal(
  question: Phase1Question,
  outcome: "success" | "failure",
): Phase1SpeechModalState {
  const correctAnswer = question.choices[question.correctDirection].label;

  return {
    title:
      outcome === "success"
        ? TEXT.phase1.dialogue.feedbackSuccessTitle
        : TEXT.phase1.dialogue.feedbackFailureTitle,
    speech:
      outcome === "success"
        ? TEXT.phase1.dialogue.feedbackSuccessSpeech
        : TEXT.phase1.dialogue.feedbackFailureSpeech,
    body:
      outcome === "success"
        ? TEXT.phase1.dialogue.feedbackSuccessBody(question.explanation)
        : TEXT.phase1.dialogue.feedbackFailureBody(
            correctAnswer,
            question.explanation,
          ),
    continueHint: PHASE1_START_MODAL_HINT,
    mood: outcome === "success" ? "happy" : "sad",
  };
}

export function createQuestionIntroModal(): Phase1SpeechModalState {
  return {
    title: TEXT.phase1.dialogue.questionIntroTitle,
    speech: TEXT.phase1.dialogue.questionIntroSpeech,
    body: TEXT.phase1.dialogue.questionIntroBody,
    continueHint: PHASE1_START_MODAL_HINT,
    mood: "neutral",
  };
}
