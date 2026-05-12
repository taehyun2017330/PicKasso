import type {
  ImageBatchGenerationInput,
  ImageBatchGenerationResult,
  ImageGenerationInput,
  ImageGenerationResult
} from "@/lib/types";
import { compactText } from "@/lib/utils";
import { createOpenAIClient } from "@/lib/ai/openAiClient";
import {
  getImageBackground,
  getImageOutputCompression,
  getImageOutputFormat,
  getImageQuality,
  getImageSize
} from "@/lib/ai/images/options";
import { getOpenAIImageModel } from "@/lib/ai/openAiSettings";
import { buildBatchSocialImagePrompt, buildSingleSocialImagePrompt } from "@/lib/ai/images/socialPrompt";

function dataUrlToBuffer(dataUrl: string) {
  const [meta, data] = dataUrl.split(",");
  const mime = /data:(.*?);/.exec(meta)?.[1] || "image/png";
  return { buffer: Buffer.from(data, "base64"), mime };
}

function imageOptions() {
  const outputFormat = getImageOutputFormat();
  const outputCompression = getImageOutputCompression();

  return {
    size: getImageSize(),
    quality: getImageQuality(),
    background: getImageBackground(),
    output_format: outputFormat,
    ...(outputCompression !== null && outputFormat !== "png" ? { output_compression: outputCompression } : {})
  };
}

function resultFromItem(item: { b64_json?: string; url?: string } | undefined, prompt: string, styleLabel: string, usage?: unknown) {
  const outputFormat = getImageOutputFormat();
  const src = item?.b64_json ? `data:image/${outputFormat};base64,${item.b64_json}` : item?.url || "";
  return { src, prompt, styleLabel, usage };
}

function storedPrompt(value: string) {
  return compactText(value, 900);
}

async function referenceFiles(references: ImageGenerationInput["references"]) {
  const { toFile } = await import("openai");

  return Promise.all(
    (references ?? [])
      .filter((reference) => reference.src.startsWith("data:image/"))
      .slice(0, 4)
      .map(async (reference, index) => {
        const { buffer, mime } = dataUrlToBuffer(reference.src);
        return toFile(buffer, `reference-${index}.png`, { type: mime });
      })
  );
}

export async function createRealImage(input: ImageGenerationInput): Promise<ImageGenerationResult> {
  const openai = createOpenAIClient();
  const model = getOpenAIImageModel();
  const prompt = buildSingleSocialImagePrompt(input);
  const concisePrompt = storedPrompt(input.prompt);

  if (input.references?.length) {
    const files = await referenceFiles(input.references);

    if (files.length) {
      const edited = await openai.images.edit({
        model,
        image: files as never,
        prompt,
        ...imageOptions()
      } as never);
      return resultFromItem(edited.data?.[0], concisePrompt, input.label, edited.usage);
    }
  }

  const generated = await openai.images.generate({
    model,
    prompt,
    ...imageOptions()
  } as never);
  return resultFromItem(generated.data?.[0], concisePrompt, input.label, generated.usage);
}

export async function createRealImageBatch(input: ImageBatchGenerationInput): Promise<ImageBatchGenerationResult> {
  const openai = createOpenAIClient();
  const model = getOpenAIImageModel();
  const prompt = buildBatchSocialImagePrompt(input);
  const batchPrompt = storedPrompt(input.prompt);
  const n = input.outputCount;

  if (input.references?.length) {
    const files = await referenceFiles(input.references);

    if (files.length) {
      const edited = await openai.images.edit({
        model,
        image: files as never,
        prompt,
        n,
        ...imageOptions()
      } as never);

      return {
        prompt: batchPrompt,
        usage: edited.usage,
        images: (edited.data ?? [])
          .slice(0, n)
          .map((item, index) =>
            resultFromItem(
              item,
              storedPrompt(input.variantPrompts[index] || input.prompt),
              input.variantLabels[index] || `Image ${index + 1}`,
              edited.usage
            )
          )
      };
    }
  }

  const generated = await openai.images.generate({
    model,
    prompt,
    n,
    ...imageOptions()
  } as never);

  return {
    prompt: batchPrompt,
    usage: generated.usage,
    images: (generated.data ?? [])
      .slice(0, n)
      .map((item, index) =>
        resultFromItem(
          item,
          storedPrompt(input.variantPrompts[index] || input.prompt),
          input.variantLabels[index] || `Image ${index + 1}`,
          generated.usage
        )
      )
  };
}
