import prisma from "./prisma";

// =============================================
// ENSAMBLADOR DE PROMPTS PARA LLM
// =============================================

interface PromptContext {
  empresa: {
    nombre: string;
    caracterizacion: Record<string, unknown>;
  };
  evaluacion: {
    nombre: string;
    puntajeGlobal: number;
    dimensiones: Array<{
      nombre: string;
      puntaje: number;
      nivel: string;
      recomendacionBase?: string;
    }>;
  };
  justificaciones: Array<{
    pregunta: string;
    justificacion: string;
  }>;
}

/**
 * Ensambla el contexto completo para enviar al LLM
 */
export async function ensamblarContextoLlm(
  sesionId: string
): Promise<PromptContext> {
  // 1. Cargar datos de la sesión
  const sesion = await prisma.sesionEvaluacion.findUnique({
    where: { id: sesionId },
    include: {
      empresa: true,
      evaluacion: {
        include: { configuracionLlm: true },
      },
    },
  });

  if (!sesion) {
    throw new Error(`Sesión ${sesionId} no encontrada`);
  }

  // 2. Cargar caracterización
  const caracterizacion = await prisma.caracterizacionRespuesta.findMany({
    where: { empresaId: sesion.empresaId },
    include: { campo: true },
  });

  // 3. Cargar resultados por dimensión
  const resultados = await prisma.resultadoDimension.findMany({
    where: { sesionId },
    include: {
      dimension: true,
      recomendacionBase: true,
    },
  });

  // 4. Cargar respuestas con justificación
  const respuestasConJustificacion =
    await prisma.respuestaCuestionario.findMany({
      where: {
        sesionId,
        justificacion: { not: null },
      },
      include: { pregunta: true },
    });

  // 5. Construir contexto estructurado
  return {
    empresa: {
      nombre: sesion.empresa.nombre,
      caracterizacion: caracterizacion.reduce(
        (acc, c) => {
          acc[c.campo.nombre] = c.valor;
          return acc;
        },
        {} as Record<string, unknown>
      ),
    },
    evaluacion: {
      nombre: sesion.evaluacion.nombre,
      puntajeGlobal: sesion.puntajeGlobal ?? 0,
      dimensiones: resultados.map((r) => ({
        nombre: r.dimension.nombre,
        puntaje: r.puntaje,
        nivel: r.nivel ?? "Sin clasificar",
        recomendacionBase: r.recomendacionBase?.descripcion,
      })),
    },
    justificaciones: respuestasConJustificacion
      .filter((r) => r.justificacion)
      .map((r) => ({
        pregunta: r.pregunta.texto,
        justificacion: r.justificacion!,
      })),
  };
}

/**
 * Construye el prompt de usuario para el LLM
 */
export function construirUserPrompt(contexto: PromptContext): string {
  const dimensionesStr = contexto.evaluacion.dimensiones
    .map((d) => `- **${d.nombre}:** ${d.puntaje}/100 (${d.nivel})`)
    .join("\n");

  const justificacionesStr =
    contexto.justificaciones.length > 0
      ? contexto.justificaciones
          .map(
            (j) =>
              `**Pregunta:** ${j.pregunta}\n**Respuesta del usuario:** ${j.justificacion}`
          )
          .join("\n\n")
      : "No se proporcionaron justificaciones adicionales.";

  return `
## Contexto de la Evaluación

### Datos de la Empresa
- **Nombre:** ${contexto.empresa.nombre}
- **Caracterización:** 
${JSON.stringify(contexto.empresa.caracterizacion, null, 2)}

### Resultados de Madurez
- **Puntaje Global:** ${contexto.evaluacion.puntajeGlobal}/100

#### Resultados por Dimensión:
${dimensionesStr}

### Justificaciones y Contexto Adicional del Usuario
${justificacionesStr}

---

Por favor genera un análisis personalizado y accionable con los siguientes elementos:

1. **Diagnóstico Ejecutivo** (3-4 párrafos que resuman la situación actual de la empresa)

2. **Fortalezas Identificadas** (las dimensiones donde la empresa destaca)

3. **Áreas Críticas de Mejora** (las dimensiones con mayor oportunidad, priorizadas por impacto)

4. **Roadmap de 90 Días** con acciones priorizadas:
   - Semanas 1-2: Quick wins
   - Semanas 3-6: Iniciativas de mediano plazo
   - Semanas 7-12: Proyectos estratégicos

5. **Quick Wins** (3-5 acciones de impacto inmediato que pueden ejecutarse esta semana)

6. **Métricas de Seguimiento** (KPIs sugeridos para medir progreso en la próxima evaluación)

Asegúrate de:
- Ser específico al sector y tamaño de la empresa
- Considerar las justificaciones de texto que proporcionó el usuario
- Dar recomendaciones prácticas y accionables, no genéricas
- Usar un tono profesional pero accesible
`;
}

/**
 * Obtiene la configuración del LLM para una evaluación
 */
export async function obtenerConfigLlm(evaluacionId: string) {
  const config = await prisma.configuracionLlm.findUnique({
    where: { evaluacionId },
  });

  return (
    config ?? {
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      systemPrompt: `Eres un consultor experto en transformación digital y madurez organizacional. 
Tu rol es analizar los resultados de evaluaciones de madurez empresarial y proporcionar 
recomendaciones estratégicas personalizadas.

Características de tu análisis:
- Basado en evidencia y datos proporcionados
- Específico al contexto de la empresa (sector, tamaño, situación actual)
- Priorizado por impacto y factibilidad
- Accionable y medible
- Tono profesional pero accesible

Evita:
- Recomendaciones genéricas que apliquen a cualquier empresa
- Jerga técnica excesiva
- Sugerencias sin considerar el contexto proporcionado`,
      temperature: 0.7,
      maxTokens: 4000,
    }
  );
}
