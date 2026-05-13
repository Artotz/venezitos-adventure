import venezitoSrc from "../../assets/venezito/venezito-happy.png";
import type { Phase2Stage } from "./types";

const STAGE_INTRO_COPY: Record<
  Phase2Stage,
  {
    title: string;
    objective: string;
    implement: string;
  }
> = {
  plowing: {
    title: "Etapa 1 - Corte de grama",
    objective: "Corte toda a grama passando o implemento pelas celulas do campo.",
    implement: "Arado",
  },
  planting: {
    title: "Etapa 2 - Plantio",
    objective: "Prepare o solo plantando nas celulas que ja foram cortadas.",
    implement: "Plantadeira",
  },
  cane: {
    title: "Etapa 3 - Cana",
    objective: "Complete o campo formando o plantio de cana nas celulas plantadas.",
    implement: "Pulverizador",
  },
};

type Phase2StageIntroCardProps = {
  stage: Phase2Stage;
};

export function Phase2StageIntroCard({ stage }: Phase2StageIntroCardProps) {
  const copy = STAGE_INTRO_COPY[stage];

  return (
    <div className="phase2-stage-intro" role="status" aria-live="polite">
      <img
        src={venezitoSrc}
        alt=""
        className="phase2-stage-intro-venezito"
        draggable={false}
      />
      <div className="phase2-stage-intro-copy">
        <p className="phase2-stage-intro-eyebrow">Venezito explica</p>
        <h2>{copy.title}</h2>
        <p>{copy.objective}</p>
        <strong>Implemento: {copy.implement}</strong>
      </div>
    </div>
  );
}
