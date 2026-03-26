import { useEffect, useState } from "react";

import carnaubaSrc from "../../assets/carnauba.png";
import { loadImage } from "../loadImage";

export function usePhase1CarnaubaImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadImage(carnaubaSrc)
      .then((loadedImage) => {
        if (!cancelled) {
          setImage(loadedImage);
        }
      })
      .catch((error: unknown) => {
        console.error("Falha ao carregar a carnauba da fase 1.", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return image;
}
