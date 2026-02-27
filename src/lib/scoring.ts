import prisma from "./prisma";

// =============================================
// MOTOR DE SCORING
// =============================================

interface PuntajeDimensionResult {
  puntaje: number;
  nivel: string;
  recomendacionBaseId: string | null;
}

/**
 * Calcula el puntaje de una dimensión para una sesión
 */
export async function calcularPuntajeDimension(
  sesionId: string,
  dimensionId: string
): Promise<PuntajeDimensionResult> {
  // 1. Obtener preguntas de la dimensión con sus pesos
  const preguntas = await prisma.pregunta.findMany({
    where: { dimensionId, activa: true },
    include: { opciones: true },
  });

  // 2. Obtener respuestas del usuario para esta sesión
  const respuestas = await prisma.respuestaCuestionario.findMany({
    where: {
      sesionId,
      preguntaId: { in: preguntas.map((p) => p.id) },
    },
  });

  let sumaPonderada = 0;
  let sumaPesos = 0;

  for (const pregunta of preguntas) {
    const respuesta = respuestas.find((r) => r.preguntaId === pregunta.id);
    if (!respuesta) continue;

    let puntajePregunta: number;

    if (pregunta.tipo === "single") {
      // Radio: puntaje de la opción seleccionada
      const opcion = pregunta.opciones.find(
        (o) => o.id === respuesta.opcionesSeleccionadas[0]
      );
      puntajePregunta = opcion?.puntaje ?? 0;
    } else {
      // Checkbox: promedio de opciones seleccionadas
      const opcionesSeleccionadas = pregunta.opciones.filter((o) =>
        respuesta.opcionesSeleccionadas.includes(o.id)
      );
      puntajePregunta =
        opcionesSeleccionadas.length > 0
          ? opcionesSeleccionadas.reduce((sum, o) => sum + o.puntaje, 0) /
            opcionesSeleccionadas.length
          : 0;
    }

    // Aplicar peso de la pregunta
    sumaPonderada += puntajePregunta * pregunta.peso;
    sumaPesos += pregunta.peso;

    // Guardar puntaje calculado en la respuesta
    await prisma.respuestaCuestionario.update({
      where: { id: respuesta.id },
      data: { puntajeCalculado: puntajePregunta },
    });
  }

  // Puntaje final de la dimensión (0-100)
  const puntajeDimension = sumaPesos > 0 ? sumaPonderada / sumaPesos : 0;

  // Determinar nivel según rangos configurados
  const recomendacion = await prisma.recomendacionBase.findFirst({
    where: {
      dimensionId,
      puntajeMin: { lte: puntajeDimension },
      puntajeMax: { gte: puntajeDimension },
    },
  });

  return {
    puntaje: Math.round(puntajeDimension * 100) / 100,
    nivel: recomendacion?.nivel ?? "Sin clasificar",
    recomendacionBaseId: recomendacion?.id ?? null,
  };
}

/**
 * Calcula el puntaje global de una sesión
 */
export async function calcularPuntajeGlobal(sesionId: string): Promise<number> {
  const resultados = await prisma.resultadoDimension.findMany({
    where: { sesionId },
    include: { dimension: true },
  });

  let sumaPonderada = 0;
  let sumaPesos = 0;

  for (const resultado of resultados) {
    sumaPonderada += resultado.puntaje * resultado.dimension.peso;
    sumaPesos += resultado.dimension.peso;
  }

  return sumaPesos > 0
    ? Math.round((sumaPonderada / sumaPesos) * 100) / 100
    : 0;
}

/**
 * Calcula todos los puntajes de una sesión
 */
export async function calcularTodosLosPuntajes(sesionId: string): Promise<{
  puntajeGlobal: number;
  resultadosDimensiones: Array<{
    dimensionId: string;
    puntaje: number;
    nivel: string;
  }>;
}> {
  // Obtener la sesión con su evaluación
  const sesion = await prisma.sesionEvaluacion.findUnique({
    where: { id: sesionId },
    include: {
      evaluacion: {
        include: {
          dimensiones: true,
        },
      },
    },
  });

  if (!sesion) {
    throw new Error(`Sesión ${sesionId} no encontrada`);
  }

  const resultadosDimensiones: Array<{
    dimensionId: string;
    puntaje: number;
    nivel: string;
  }> = [];

  // Calcular puntaje por cada dimensión
  for (const dimension of sesion.evaluacion.dimensiones) {
    const resultado = await calcularPuntajeDimension(sesionId, dimension.id);

    // Guardar resultado en la BD
    await prisma.resultadoDimension.upsert({
      where: {
        id: `${sesionId}-${dimension.id}`, // Composite key workaround
      },
      create: {
        id: `${sesionId}-${dimension.id}`,
        sesionId,
        dimensionId: dimension.id,
        puntaje: resultado.puntaje,
        nivel: resultado.nivel,
        recomendacionBaseId: resultado.recomendacionBaseId,
      },
      update: {
        puntaje: resultado.puntaje,
        nivel: resultado.nivel,
        recomendacionBaseId: resultado.recomendacionBaseId,
      },
    });

    resultadosDimensiones.push({
      dimensionId: dimension.id,
      puntaje: resultado.puntaje,
      nivel: resultado.nivel,
    });
  }

  // Calcular puntaje global
  const puntajeGlobal = await calcularPuntajeGlobal(sesionId);

  // Actualizar sesión con puntaje global
  await prisma.sesionEvaluacion.update({
    where: { id: sesionId },
    data: { puntajeGlobal },
  });

  return { puntajeGlobal, resultadosDimensiones };
}

/**
 * Determina el nivel global basado en el puntaje
 */
export function determinarNivelGlobal(puntaje: number): string {
  if (puntaje >= 80) return "Líder";
  if (puntaje >= 60) return "Maduro";
  if (puntaje >= 40) return "En Desarrollo";
  if (puntaje >= 20) return "Inicial";
  return "Incipiente";
}
