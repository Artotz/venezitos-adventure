import { useEffect, useState } from "react";

import instructorSrc from "../../assets/venezito/venezito.png";
import { loadOptimizedImage, type LoadedImageSource } from "../imageSource";

export function usePhase1InstructorImage() {
  const [image, setImage] = useState<LoadedImageSource | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadOptimizedImage(instructorSrc, {
      maxHeight: 960,
      maxWidth: 768,
    })
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
