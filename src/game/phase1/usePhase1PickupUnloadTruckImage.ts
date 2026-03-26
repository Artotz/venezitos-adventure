import { useEffect, useState } from "react";

import pickupUnloadTruckSrc from "../../assets/410.png";
import { loadImage } from "../loadImage";

export function usePhase1PickupUnloadTruckImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadImage(pickupUnloadTruckSrc)
      .then((loadedImage) => {
        if (!cancelled) {
          setImage(loadedImage);
        }
      })
      .catch((error: unknown) => {
        console.error(
          "Falha ao carregar o caminhao de descarregamento da fase 1.",
          error,
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return image;
}
