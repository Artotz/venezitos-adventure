import { useEffect, useState } from "react";

import foregroundSrc from "../../assets/foreground.png";
import { loadImage } from "../loadImage";

export function usePhase1ForegroundImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadImage(foregroundSrc)
      .then((loadedImage) => {
        if (!cancelled) {
          setImage(loadedImage);
        }
      })
      .catch((error: unknown) => {
        console.error("Falha ao carregar o foreground da fase 1.", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return image;
}
