import { useEffect, useState } from "react";

import dirtPileSrc from "../../assets/dirt-pile.png";
import greaseSignSrc from "../../assets/grease-sign.png";
import holeEmptySrc from "../../assets/hole-empty.png";
import holeFullSrc from "../../assets/hole-full.png";
import maintenanceSignSrc from "../../assets/maintenance-sign.png";
import mudSrc from "../../assets/mud.png";
import workSignSrc from "../../assets/work-sign.png";
import { loadOptimizedImage, type LoadedImageSource } from "../imageSource";
import { TEXT } from "../i18n";

type Phase1EventSprites = {
  dirtPileImage: LoadedImageSource | null;
  greaseSignImage: LoadedImageSource | null;
  holeEmptyImage: LoadedImageSource | null;
  holeFullImage: LoadedImageSource | null;
  maintenanceSignImage: LoadedImageSource | null;
  mudImage: LoadedImageSource | null;
  workSignImage: LoadedImageSource | null;
};

const INITIAL_SPRITES: Phase1EventSprites = {
  dirtPileImage: null,
  greaseSignImage: null,
  holeEmptyImage: null,
  holeFullImage: null,
  maintenanceSignImage: null,
  mudImage: null,
  workSignImage: null,
};

export function usePhase1EventSprites() {
  const [sprites, setSprites] = useState<Phase1EventSprites>(INITIAL_SPRITES);

  useEffect(() => {
    let cancelled = false;

    void Promise.allSettled([
      loadOptimizedImage(dirtPileSrc, { maxWidth: 768, maxHeight: 384 }),
      loadOptimizedImage(greaseSignSrc, { maxWidth: 512, maxHeight: 512 }),
      loadOptimizedImage(holeEmptySrc, { maxWidth: 512, maxHeight: 512 }),
      loadOptimizedImage(holeFullSrc, { maxWidth: 512, maxHeight: 512 }),
      loadOptimizedImage(maintenanceSignSrc, { maxWidth: 512, maxHeight: 512 }),
      loadOptimizedImage(mudSrc, { maxWidth: 768, maxHeight: 384 }),
      loadOptimizedImage(workSignSrc, { maxWidth: 512, maxHeight: 512 }),
    ]).then((results) => {
      if (cancelled) {
        return;
      }

      setSprites({
        dirtPileImage: results[0].status === "fulfilled" ? results[0].value : null,
        greaseSignImage: results[1].status === "fulfilled" ? results[1].value : null,
        holeEmptyImage: results[2].status === "fulfilled" ? results[2].value : null,
        holeFullImage: results[3].status === "fulfilled" ? results[3].value : null,
        maintenanceSignImage: results[4].status === "fulfilled" ? results[4].value : null,
        mudImage: results[5].status === "fulfilled" ? results[5].value : null,
        workSignImage: results[6].status === "fulfilled" ? results[6].value : null,
      });

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const assetNames = [
            "dirt-pile",
            "grease-sign",
            "hole-empty",
            "hole-full",
            "maintenance-sign",
            "mud",
            "work-sign",
          ];
          console.error(TEXT.phase1.errors.sprite(assetNames[index]), result.reason);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return sprites;
}
