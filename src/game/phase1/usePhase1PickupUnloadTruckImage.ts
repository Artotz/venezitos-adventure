import { useEffect, useState } from "react";

import pickupUnloadTruckSrc from "../../assets/410.png";
import { loadOptimizedImage, type LoadedImageSource } from "../imageSource";
import { TEXT } from "../i18n";

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
          TEXT.phase1.errors.pickupUnloadTruck,
          error,
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return image;
}
