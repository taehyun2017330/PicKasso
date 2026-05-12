import type { ImageGenerationInput } from "@/lib/types";
import { hashString } from "@/lib/utils";

function svgEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function createMockImageDataUrl(input: ImageGenerationInput) {
  const placeholderSeed = hashString(`${input.seed}:${input.styleIndex}:${input.label}`);
  const tone = 236 - (placeholderSeed % 18);
  const line = 202 - (placeholderSeed % 16);
  const label = `Image placeholder ${input.styleIndex + 1}`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <rect width="1024" height="1024" fill="rgb(${tone},${tone},${tone})"/>
      <path d="M0 0H1024V1024H0Z" fill="none" stroke="rgb(${line},${line},${line})" stroke-width="2"/>
      <path d="M96 96H928V928H96Z" fill="none" stroke="rgb(${line},${line},${line})" stroke-width="2" stroke-dasharray="16 18"/>
      <path d="M96 512H928M512 96V928" stroke="rgb(${line},${line},${line})" stroke-width="2" opacity=".55"/>
      <circle cx="512" cy="512" r="58" fill="none" stroke="rgb(${line},${line},${line})" stroke-width="2"/>
      <title>${svgEscape(label)}</title>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
