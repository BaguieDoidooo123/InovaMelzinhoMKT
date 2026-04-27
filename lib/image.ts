function simpleHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function buildImageUrl(promptVisual: string, extraSeed = "") {
  const fullPrompt = `${promptVisual}, social media ad, photorealistic, studio lighting`;
  const encoded = encodeURIComponent(fullPrompt);
  const seed = simpleHash(`${promptVisual}-${extraSeed}`) || Date.now();

  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`;
}

export function buildImageFallback(promptVisual: string) {
  const text = encodeURIComponent(promptVisual.slice(0, 90));
  return `https://placehold.co/1024x1024/png?text=${text}&font=inter`;
}
