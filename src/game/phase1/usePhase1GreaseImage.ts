import { useEffect, useState } from "react";

import greaseSrc from "../../assets/venezito/venezito-grease.png";
import { loadImage } from "../loadImage";

export function usePhase1GreaseImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadImage(greaseSrc)
      .then((loadedImage) => {
        if (!cancelled) {
          setImage(loadedImage);
        }
      })
      .catch((error: unknown) => {
        console.error("Falha ao carregar a animacao de graxa da fase 1.", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return image;
}
