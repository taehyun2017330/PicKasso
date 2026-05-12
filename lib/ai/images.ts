import type {
  ImageBatchGenerationInput,
  ImageBatchGenerationResult,
  ImageGenerationInput,
  ImageGenerationResult
} from "@/lib/types";
import { isRealOpenAIEnabled } from "@/lib/ai/openAiSettings";
import { createMockImageDataUrl } from "@/lib/ai/images/mockImage";
import { createRealImage, createRealImageBatch } from "@/lib/ai/images/openAiImage";

export { createMockImageDataUrl };

export async function createImageVariant(input: ImageGenerationInput): Promise<ImageGenerationResult> {
  const shouldUseReal = isRealOpenAIEnabled() && input.runtimeConfig?.realMode !== false;

  if (!shouldUseReal) {
    return {
      src: createMockImageDataUrl(input),
      prompt: input.prompt,
      styleLabel: input.label
    };
  }

  return createRealImage(input);
}

export async function createImageVariantsBatch(input: ImageBatchGenerationInput): Promise<ImageBatchGenerationResult> {
  const shouldUseReal = isRealOpenAIEnabled() && input.runtimeConfig?.realMode !== false;

  if (!shouldUseReal) {
    const images = Array.from({ length: input.outputCount }, (_, index) => {
      const label = input.variantLabels[index] || `Image ${index + 1}`;
      const prompt = input.variantPrompts[index] || input.prompt;

      return {
        src: createMockImageDataUrl({
          brand: input.brand,
          label,
          prompt,
          category: input.category,
          styleIndex: index,
          seed: `${input.seed}:${index}`,
          references: input.references
        }),
        prompt,
        styleLabel: label
      };
    });

    return {
      images,
      prompt: input.prompt
    };
  }

  return createRealImageBatch(input);
}
