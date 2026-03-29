import { useEffect, useState } from "react";

import instructorSrc from "../../assets/venezito/venezito.png";
import { loadImage } from "../loadImage";

export function usePhase1InstructorImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadImage(instructorSrc)
      .then((loadedImage) => {
        if (!cancelled) {
          setImage(loadedImage);
        }
      })
      .catch((error: unknown) => {
        console.error("Falha ao carregar o instrutor da fase 1.", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return image;
}
