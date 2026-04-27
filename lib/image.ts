export function buildImageUrl(promptVisual: string) {
  const encoded = encodeURIComponent(`${promptVisual}, marketing digital, clean design`);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${Date.now()}`;
}
