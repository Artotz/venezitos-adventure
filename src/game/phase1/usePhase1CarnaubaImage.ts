import { useEffect, useState } from "react";

import carnaubaSrc from "../../assets/carnauba.png";
import { loadImage } from "../loadImage";
import { TEXT } from "../i18n";

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
        console.error(TEXT.phase1.errors.carnauba, error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return image;
}
