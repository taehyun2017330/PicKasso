import type { TargetAudienceSuggestionInput } from "@/lib/ai/guide/types";

export const targetAudienceSuggestionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["suggestions"],
  properties: {
    suggestions: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "audience", "rationale"],
        properties: {
          label: { type: "string" },
          audience: { type: "string" },
          rationale: { type: "string" }
        }
      }
    }
  }
};

export function buildTargetAudienceSuggestionPrompt(input: TargetAudienceSuggestionInput) {
  return {
    system:
      "You suggest concise target audiences for a brand setup assistant. Return JSON only. Each audience must be a short phrase, not a sentence. Avoid demographic stereotypes, private traits, and sensitive targeting. Keep labels distinct and practical.",
    user: JSON.stringify({
      brandName: input.brandName || "Unnamed brand",
      category: input.category || "Other / Custom",
      currentAudience: input.currentAudience || "",
      rerollAttempt: input.rerollKey ?? 0,
      instruction:
        "Suggest 4-6 target audience options the user can click into a textbox. Use a few words or one compact phrase per audience. If rerollAttempt is greater than 0, avoid obvious repeats from the first set."
    })
  };
}
