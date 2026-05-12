import "server-only";

import {
  analyzeBoardRegeneration,
  type BoardRegenerationReview
} from "@/lib/ai/guide/boardRegeneration";
import {
  createRealBoardRegenerationReview,
  type BoardRegenerationInput
} from "@/lib/ai/guide/openAiBoardRegeneration";
import { getAiModelRoute } from "@/lib/ai/modelRoutes";
import { isRealOpenAIEnabled } from "@/lib/ai/openAiSettings";

export async function reviewBoardForRegeneration(input: BoardRegenerationInput): Promise<BoardRegenerationReview> {
  const model = getAiModelRoute("boardRegenerationReview").model;
  const shouldUseReal = input.realMode !== false && isRealOpenAIEnabled();

  if (shouldUseReal && model) {
    try {
      return await createRealBoardRegenerationReview(input, model);
    } catch {
      return analyzeBoardRegeneration({
        brand: input.brand,
        model,
        variants: input.variants
      });
    }
  }

  return analyzeBoardRegeneration({
    brand: input.brand,
    model,
    variants: input.variants
  });
}
