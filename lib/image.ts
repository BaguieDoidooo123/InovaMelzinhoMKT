function simpleHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function buildImageUrl(promptVisual: string, extraSeed = "") {
  const seed = simpleHash(`${promptVisual}-${extraSeed}`) || Date.now();
  const prompt = encodeURIComponent(promptVisual);

  return `/api/generated-image?prompt=${prompt}&seed=${seed}`;
}

export function buildImageFallback(promptVisual: string) {
  const text = encodeURIComponent(promptVisual.slice(0, 90));
  return `https://placehold.co/1024x1024/png?text=${text}&font=inter`;
}
