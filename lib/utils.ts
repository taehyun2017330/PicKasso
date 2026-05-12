import type { ImageVariant, TraceNode } from "@/lib/types";

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-5);
  return `${prefix}_${time}_${random}`;
}

export function makeMonogram(name: string) {
  const clean = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!clean.length) return "BR";
  if (clean.length === 1) return clean[0].slice(0, 2).toUpperCase();
  return `${clean[0][0]}${clean[clean.length - 1][0]}`.toUpperCase();
}

export function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

export function seededItem<T>(items: T[], seed: string, offset = 0): T {
  const index = (hashString(seed) + offset * 997) % items.length;
  return items[index];
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function findVariant(nodes: Record<string, TraceNode>, variantId: string): ImageVariant | null {
  for (const node of Object.values(nodes)) {
    const variant = node.variants.find((item) => item.id === variantId);
    if (variant) return variant;
  }
  return null;
}

export function findVariantWithNode(nodes: Record<string, TraceNode>, variantId: string) {
  for (const node of Object.values(nodes)) {
    const variant = node.variants.find((item) => item.id === variantId);
    if (variant) return { variant, node };
  }
  return null;
}

export function getThreadNodes(nodes: Record<string, TraceNode>, threadId: string) {
  return Object.values(nodes)
    .filter((node) => node.threadId === threadId)
    .sort((a, b) => a.depth - b.depth || a.createdAt.localeCompare(b.createdAt));
}

export function compactText(value: string, max = 78) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}...`;
}
