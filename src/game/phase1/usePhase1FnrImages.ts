import { useEffect, useState } from "react";

import fnrSrc from "../../assets/fnr/fnr.png";
import lever1Src from "../../assets/fnr/alavanca1.png";
import lever2Src from "../../assets/fnr/alavanca2.png";
import lever3Src from "../../assets/fnr/alavanca3.png";
import lever4Src from "../../assets/fnr/alavanca4.png";
import { loadOptimizedImage, type LoadedImageSource } from "../imageSource";
import { TEXT } from "../i18n";

type Phase1FnrImages = {
  fnrImage: LoadedImageSource | null;
  leverImages: (LoadedImageSource | null)[];
};

const INITIAL_IMAGES: Phase1FnrImages = {
  fnrImage: null,
  leverImages: [null, null, null, null],
};

export function usePhase1FnrImages() {
  const [images, setImages] = useState<Phase1FnrImages>(INITIAL_IMAGES);

  useEffect(() => {
    let cancelled = false;

    void Promise.allSettled([
      loadOptimizedImage(fnrSrc, { maxWidth: 420, maxHeight: 320 }),
      loadOptimizedImage(lever1Src, { maxWidth: 420, maxHeight: 220 }),
      loadOptimizedImage(lever2Src, { maxWidth: 420, maxHeight: 220 }),
      loadOptimizedImage(lever3Src, { maxWidth: 420, maxHeight: 220 }),
      loadOptimizedImage(lever4Src, { maxWidth: 420, maxHeight: 220 }),
    ]).then((results) => {
      if (cancelled) {
        return;
      }

      setImages({
        fnrImage: results[0].status === "fulfilled" ? results[0].value : null,
        leverImages: results.slice(1).map((result) =>
          result.status === "fulfilled" ? result.value : null,
        ),
      });

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const assetNames = [
            "fnr",
            "alavanca1",
            "alavanca2",
            "alavanca3",
            "alavanca4",
          ];
          console.error(
            TEXT.phase1.errors.sprite(assetNames[index]),
            result.reason,
          );
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return images;
}
