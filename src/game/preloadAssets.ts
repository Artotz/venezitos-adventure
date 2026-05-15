import heroPhase1Src from "../assets/hero-menu.jpg";
import heroPhase2Src from "../assets/hero2-menu.jpg";
import pickupUnloadTruckSrc from "../assets/410.png";
import carnaubaSrc from "../assets/carnauba.png";
import dirtPileSrc from "../assets/dirt-pile.png";
import fnrSrc from "../assets/fnr/fnr.png";
import lever1Src from "../assets/fnr/alavanca1.png";
import lever2Src from "../assets/fnr/alavanca2.png";
import lever3Src from "../assets/fnr/alavanca3.png";
import lever4Src from "../assets/fnr/alavanca4.png";
import foregroundSrc from "../assets/foreground.png";
import greaseSignSrc from "../assets/grease-sign.png";
import groundSrc from "../assets/ground.png";
import holeEmptySrc from "../assets/hole-empty.png";
import holeFullSrc from "../assets/hole-full.png";
import maintenanceSignSrc from "../assets/maintenance-sign.png";
import mudSrc from "../assets/mud.png";
import plowUrl from "../assets/phase2/Arado.png.png";
import planterUrl from "../assets/phase2/Plantadeira,png.png";
import sprayerUrl from "../assets/phase2/Pulverizador.png.png";
import tractorTopUrl from "../assets/phase2/Trator.png.png";
import venezitoFaceHappySrc from "../assets/venezito/venezito-face-happy.png";
import venezitoFaceNeutralSrc from "../assets/venezito/venezito-face-neutral.png";
import venezitoFaceSadSrc from "../assets/venezito/venezito-face-sad.png";
import venezitoHappySrc from "../assets/venezito/venezito-happy.png";
import venezitoNeutralSrc from "../assets/venezito/venezito-neutral.png";
import venezitoSadSrc from "../assets/venezito/venezito-sad.png";
import workSignSrc from "../assets/work-sign.png";
import { loadOptimizedImage } from "./imageSource";
import { loadImage } from "./loadImage";

const retroSpriteModules = import.meta.glob("../assets/retro/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

let preloadedAllPhasesPromise: Promise<void> | null = null;

export function preloadAllPhaseAssets() {
  if (preloadedAllPhasesPromise) {
    return preloadedAllPhasesPromise;
  }

  preloadedAllPhasesPromise = Promise.allSettled([
    ...Object.values(retroSpriteModules).map((src) => loadImage(src)),
    loadImage(heroPhase1Src),
    loadImage(heroPhase2Src),
    loadImage(carnaubaSrc),
    loadImage(foregroundSrc),
    loadImage(groundSrc),
    loadImage(venezitoFaceNeutralSrc),
    loadImage(venezitoFaceHappySrc),
    loadImage(venezitoFaceSadSrc),
    loadImage(venezitoNeutralSrc),
    loadImage(venezitoHappySrc),
    loadImage(venezitoSadSrc),
    loadOptimizedImage(pickupUnloadTruckSrc, { maxWidth: 1400, maxHeight: 900 }),
    loadOptimizedImage(dirtPileSrc, { maxWidth: 768, maxHeight: 384 }),
    loadOptimizedImage(greaseSignSrc, { maxWidth: 512, maxHeight: 512 }),
    loadOptimizedImage(holeEmptySrc, { maxWidth: 512, maxHeight: 512 }),
    loadOptimizedImage(holeFullSrc, { maxWidth: 512, maxHeight: 512 }),
    loadOptimizedImage(maintenanceSignSrc, { maxWidth: 512, maxHeight: 512 }),
    loadOptimizedImage(mudSrc, { maxWidth: 768, maxHeight: 384 }),
    loadOptimizedImage(workSignSrc, { maxWidth: 512, maxHeight: 512 }),
    loadOptimizedImage(fnrSrc, { maxWidth: 420, maxHeight: 320 }),
    loadOptimizedImage(lever1Src, { maxWidth: 420, maxHeight: 220 }),
    loadOptimizedImage(lever2Src, { maxWidth: 420, maxHeight: 220 }),
    loadOptimizedImage(lever3Src, { maxWidth: 420, maxHeight: 220 }),
    loadOptimizedImage(lever4Src, { maxWidth: 420, maxHeight: 220 }),
    loadImage(tractorTopUrl),
    loadImage(plowUrl),
    loadImage(planterUrl),
    loadImage(sprayerUrl),
  ]).then(() => undefined);

  return preloadedAllPhasesPromise;
}
