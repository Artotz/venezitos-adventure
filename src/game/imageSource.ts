import { loadImage } from "./loadImage";

export type LoadedImageSource = HTMLImageElement | HTMLCanvasElement;

type OptimizeImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
};

const optimizedImageCache = new Map<string, Promise<LoadedImageSource>>();

export async function loadOptimizedImage(
  src: string,
  options?: OptimizeImageOptions,
) {
  const cacheKey = `${src}|${options?.maxWidth ?? "auto"}|${
    options?.maxHeight ?? "auto"
  }`;
  const cached = optimizedImageCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const loading = loadImage(src).then((image) => optimizeImageSource(image, options));
  optimizedImageCache.set(cacheKey, loading);

  return loading;
}

export function optimizeImageSource(
  image: HTMLImageElement,
  options?: OptimizeImageOptions,
): LoadedImageSource {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (!sourceWidth || !sourceHeight) {
    return image;
  }

  const maxWidth = options?.maxWidth ?? sourceWidth;
  const maxHeight = options?.maxHeight ?? sourceHeight;
  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);

  if (scale >= 1) {
    return image;
  }

  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    return image;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  return canvas;
}

export function getImageSourceSize(image: LoadedImageSource) {
  return {
    width: image instanceof HTMLImageElement ? image.naturalWidth || image.width : image.width,
    height:
      image instanceof HTMLImageElement ? image.naturalHeight || image.height : image.height,
  };
}
