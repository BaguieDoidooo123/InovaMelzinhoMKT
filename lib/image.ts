export function buildImageUrl(promptVisual: string) {
  const text = encodeURIComponent(promptVisual.slice(0, 120));
  return `https://placehold.co/1024x1024/png?text=${text}&font=inter`;
}
