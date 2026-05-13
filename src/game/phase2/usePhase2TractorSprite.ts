import { useEffect, useState } from "react";
import plowUrl from "../../assets/phase2/Arado.png.png";
import planterUrl from "../../assets/phase2/Plantadeira,png.png";
import tractorTopUrl from "../../assets/phase2/Trator.png.png";
import { loadImage } from "../loadImage";

export type Phase2VehicleSprites = {
  tractor: HTMLCanvasElement | null;
  plow: HTMLCanvasElement | null;
  planter: HTMLCanvasElement | null;
};

export function usePhase2TractorSprite() {
  const [sprites, setSprites] = useState<Phase2VehicleSprites>({
    tractor: null,
    plow: null,
    planter: null,
  });

  useEffect(() => {
    let active = true;

    Promise.all([loadImage(tractorTopUrl), loadImage(plowUrl), loadImage(planterUrl)])
      .then(([tractorImage, plowImage, planterImage]) => {
        if (!active) {
          return;
        }

        setSprites({
          tractor: createTransparentSprite(tractorImage),
          plow: createTransparentSprite(plowImage),
          planter: createTransparentSprite(planterImage),
        });
      })
      .catch((error) => {
        console.error("Falha ao carregar sprites do veiculo da fase 2.", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return sprites;
}

function createTransparentSprite(image: HTMLImageElement) {
  const source = document.createElement("canvas");
  source.width = image.naturalWidth;
  source.height = image.naturalHeight;

  const context = source.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return source;
  }

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, source.width, source.height);
  const { data } = imageData;
  const visited = new Uint8Array(source.width * source.height);
  const queue: number[] = [];

  const enqueueBackground = (x: number, y: number) => {
    if (x < 0 || x >= source.width || y < 0 || y >= source.height) {
      return;
    }

    const index = y * source.width + x;

    if (visited[index] || !isBackgroundPixel(data, index)) {
      return;
    }

    visited[index] = 1;
    queue.push(index);
  };

  for (let x = 0; x < source.width; x += 1) {
    enqueueBackground(x, 0);
    enqueueBackground(x, source.height - 1);
  }

  for (let y = 0; y < source.height; y += 1) {
    enqueueBackground(0, y);
    enqueueBackground(source.width - 1, y);
  }

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    const x = index % source.width;
    const y = Math.floor(index / source.width);
    const alphaIndex = index * 4 + 3;

    data[alphaIndex] = 0;

    enqueueBackground(x + 1, y);
    enqueueBackground(x - 1, y);
    enqueueBackground(x, y + 1);
    enqueueBackground(x, y - 1);
  }

  context.putImageData(imageData, 0, 0);

  return cropTransparentEdges(source);
}

function isBackgroundPixel(data: Uint8ClampedArray, pixelIndex: number) {
  const dataIndex = pixelIndex * 4;
  const red = data[dataIndex];
  const green = data[dataIndex + 1];
  const blue = data[dataIndex + 2];

  return red < 6 && green < 6 && blue < 6;
}

function cropTransparentEdges(source: HTMLCanvasElement) {
  const context = source.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return source;
  }

  const imageData = context.getImageData(0, 0, source.width, source.height);
  const { data } = imageData;
  let minX = source.width;
  let minY = source.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const alpha = data[(y * source.width + x) * 4 + 3];

      if (alpha <= 12) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX > maxX || minY > maxY) {
    return source;
  }

  const padding = 4;
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropWidth = Math.min(source.width - cropX, maxX - minX + 1 + padding * 2);
  const cropHeight = Math.min(source.height - cropY, maxY - minY + 1 + padding * 2);
  const cropped = document.createElement("canvas");

  cropped.width = cropWidth;
  cropped.height = cropHeight;

  const croppedContext = cropped.getContext("2d");

  if (!croppedContext) {
    return source;
  }

  croppedContext.drawImage(
    source,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  return cropped;
}
