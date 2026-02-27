import Anthropic from "@anthropic-ai/sdk";

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

function getDefaultAnalysis(): string {
  return `## Diagnóstico Ejecutivo

Tu organización muestra un nivel de madurez en desarrollo. Hay oportunidades significativas de mejora en varias dimensiones evaluadas.

## Fortalezas Identificadas

- Disposición para evaluar y mejorar procesos
- Reconocimiento de áreas de oportunidad
- Interés en la transformación digital

## Áreas Críticas de Mejora

- Implementar procesos de documentación más robustos
- Desarrollar una estrategia de datos integral
- Fortalecer la cultura de innovación

## Roadmap de 90 Días

**Mes 1:** Diagnóstico detallado y priorización
**Mes 2:** Implementación de quick wins identificados
**Mes 3:** Evaluación de progreso y ajustes

## Quick Wins

1. Documentar los 3 procesos más críticos
2. Implementar herramientas de colaboración
3. Establecer métricas base de rendimiento

## Métricas de Seguimiento

- Nivel de documentación de procesos
- Adopción de herramientas digitales
- Satisfacción del equipo con nuevos procesos

---
*Para obtener recomendaciones personalizadas con IA, configure ANTHROPIC_API_KEY.*`;
}

export async function generateAnalysis(
  request: LlmAnalysisRequest
): Promise<LlmAnalysisResponse> {
  const startTime = Date.now();

  // Si no hay API key, devolver análisis por defecto
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY no configurada, usando análisis por defecto");
    return {
      content: getDefaultAnalysis(),
      tokensInput: 0,
      tokensOutput: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

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
  } catch (error) {
    console.error("Error llamando a Anthropic:", error);
    return {
      content: getDefaultAnalysis(),
      tokensInput: 0,
      tokensOutput: 0,
      latencyMs: Date.now() - startTime,
    };
  }
}
