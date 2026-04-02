import { useEffect, useState } from "react";

import pickupUnloadTruckSrc from "../../assets/410.png";
import { loadOptimizedImage, type LoadedImageSource } from "../imageSource";

export function usePhase1PickupUnloadTruckImage() {
  const [image, setImage] = useState<LoadedImageSource | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadOptimizedImage(pickupUnloadTruckSrc, {
      maxWidth: 1400,
      maxHeight: 900,
    })
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
