import { useEffect, useState } from "react";

import foregroundSrc from "../../assets/foreground.png";
import { loadImage } from "../loadImage";
import { TEXT } from "../i18n";

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
        console.error(TEXT.phase1.errors.foreground, error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return image;
}
