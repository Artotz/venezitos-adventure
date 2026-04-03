import { useEffect, useState } from "react";

import venezitoFaceHappySrc from "../../assets/venezito/venezito-face-happy.png";
import venezitoFaceNeutralSrc from "../../assets/venezito/venezito-face-neutral.png";
import venezitoFaceSadSrc from "../../assets/venezito/venezito-face-sad.png";
import venezitoHappySrc from "../../assets/venezito/venezito-happy.png";
import venezitoNeutralSrc from "../../assets/venezito/venezito-neutral.png";
import venezitoSadSrc from "../../assets/venezito/venezito-sad.png";
import { loadImage } from "../loadImage";
import type { Phase1VenezitoImageSet } from "./venezito";

export function usePhase1VenezitoImages() {
  const [images, setImages] = useState<Phase1VenezitoImageSet | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadImage(venezitoFaceNeutralSrc),
      loadImage(venezitoFaceHappySrc),
      loadImage(venezitoFaceSadSrc),
      loadImage(venezitoNeutralSrc),
      loadImage(venezitoHappySrc),
      loadImage(venezitoSadSrc),
    ])
      .then(
        ([
          faceNeutral,
          faceHappy,
          faceSad,
          fullNeutral,
          fullHappy,
          fullSad,
        ]) => {
          if (cancelled) {
            return;
          }

          setImages({
            face: {
              neutral: faceNeutral,
              happy: faceHappy,
              sad: faceSad,
            },
            full: {
              neutral: fullNeutral,
              happy: fullHappy,
              sad: fullSad,
            },
          });
        },
      )
      .catch((error: unknown) => {
        console.error("Falha ao carregar as imagens do Venezito.", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return images;
}
