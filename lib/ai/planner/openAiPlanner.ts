import type { PlannerInput, PlannerOutput } from "@/lib/types";
import { createOpenAIClient } from "@/lib/ai/openAiClient";
import { getAiModelRoute } from "@/lib/ai/modelRoutes";
import {
  buildPromptOrchestratorRequest,
  plannerOutputFromPromptBoard,
  promptBoardSchema,
  type PromptBoardPayload
} from "@/lib/ai/promptOrchestrator";

export async function createRealPlanTraceNode(input: PlannerInput): Promise<PlannerOutput> {
  const openai = createOpenAIClient();
  const request = buildPromptOrchestratorRequest(input);
  const modelRoute = getAiModelRoute("promptOrchestrator");

  const response = await openai.responses.create({
    model: modelRoute.model,
    reasoning: {
      effort: modelRoute.reasoningEffort
    },
    input: [
      {
        role: "system",
        content: request.system
      },
      {
        role: "user",
        content: request.user
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "image_prompt_orchestrator_board",
        schema: promptBoardSchema(request.count),
        strict: true
      }
    } as never
  });

  const payload = JSON.parse(response.output_text) as PromptBoardPayload;
  return plannerOutputFromPromptBoard(payload, input, request.situation);
}
