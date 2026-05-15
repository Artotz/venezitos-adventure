const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string) {
  const cached = imageCache.get(src);

  if (cached) {
    return cached;
  }

  const loading = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => {
      imageCache.delete(src);
      reject(new Error(`Falha ao carregar ${src}`));
    };
    image.src = src;
  });

  imageCache.set(src, loading);

  return loading;
}
