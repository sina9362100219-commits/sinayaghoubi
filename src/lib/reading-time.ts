export function estimateReadingMinutes(text: string): number {
  const wordCount = text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;

  return Math.max(1, Math.ceil(wordCount / 220));
}
