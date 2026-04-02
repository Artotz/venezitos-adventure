import { useEffect, useState } from "react";

import dirtPileSrc from "../../assets/dirt-pile.png";
import greaseSignSrc from "../../assets/grease-sign.png";
import holeEmptySrc from "../../assets/hole-empty.png";
import holeFullSrc from "../../assets/hole-full.png";
import mudSrc from "../../assets/mud.png";
import workSignSrc from "../../assets/work-sign.png";
import { loadImage } from "../loadImage";

type Phase1EventSprites = {
  dirtPileImage: HTMLImageElement | null;
  greaseSignImage: HTMLImageElement | null;
  holeEmptyImage: HTMLImageElement | null;
  holeFullImage: HTMLImageElement | null;
  mudImage: HTMLImageElement | null;
  workSignImage: HTMLImageElement | null;
};

const INITIAL_SPRITES: Phase1EventSprites = {
  dirtPileImage: null,
  greaseSignImage: null,
  holeEmptyImage: null,
  holeFullImage: null,
  mudImage: null,
  workSignImage: null,
};

export function usePhase1EventSprites() {
  const [sprites, setSprites] = useState<Phase1EventSprites>(INITIAL_SPRITES);

  useEffect(() => {
    let cancelled = false;

    void Promise.allSettled([
      loadImage(dirtPileSrc),
      loadImage(greaseSignSrc),
      loadImage(holeEmptySrc),
      loadImage(holeFullSrc),
      loadImage(mudSrc),
      loadImage(workSignSrc),
    ]).then((results) => {
      if (cancelled) {
        return;
      }

      setSprites({
        dirtPileImage: results[0].status === "fulfilled" ? results[0].value : null,
        greaseSignImage: results[1].status === "fulfilled" ? results[1].value : null,
        holeEmptyImage: results[2].status === "fulfilled" ? results[2].value : null,
        holeFullImage: results[3].status === "fulfilled" ? results[3].value : null,
        mudImage: results[4].status === "fulfilled" ? results[4].value : null,
        workSignImage: results[5].status === "fulfilled" ? results[5].value : null,
      });

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const assetNames = [
            "dirt-pile",
            "grease-sign",
            "hole-empty",
            "hole-full",
            "mud",
            "work-sign",
          ];
          console.error(`Falha ao carregar o sprite ${assetNames[index]}.`, result.reason);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return sprites;
}
