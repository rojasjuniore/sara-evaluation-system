import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface LlmAnalysisRequest {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LlmAnalysisResponse {
  content: string;
  tokensInput: number;
  tokensOutput: number;
  latencyMs: number;
}

export async function generateAnalysis(
  request: LlmAnalysisRequest
): Promise<LlmAnalysisResponse> {
  const startTime = Date.now();

  const response = await anthropic.messages.create({
    model: request.model || "claude-sonnet-4-20250514",
    max_tokens: request.maxTokens || 4000,
    temperature: request.temperature || 0.7,
    system: request.systemPrompt,
    messages: [
      {
        role: "user",
        content: request.userPrompt,
      },
    ],
  });

  const latencyMs = Date.now() - startTime;

  const content =
    response.content[0].type === "text" ? response.content[0].text : "";

  return {
    content,
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
    latencyMs,
  };
}

export default anthropic;
