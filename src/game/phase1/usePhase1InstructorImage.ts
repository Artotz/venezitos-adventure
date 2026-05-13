import { useEffect, useState } from "react";

import instructorSrc from "../../assets/venezito/venezito.png";
import { loadOptimizedImage, type LoadedImageSource } from "../imageSource";
import { TEXT } from "../i18n";

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
        console.error(TEXT.phase1.errors.instructor, error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return image;
}
