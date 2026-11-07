// 阅读时长估算：中文按 400 字/分钟，英文按 200 词/分钟，至少 1 分钟。
export function readingMinutes(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (text.match(/[A-Za-z0-9_]+/g) || []).length;
  return Math.max(1, Math.ceil(cjk / 400 + words / 200));
}

export function readingLabel(text: string): string {
  return `约 ${readingMinutes(text)} 分钟`;
}
