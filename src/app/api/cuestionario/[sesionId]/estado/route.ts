import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { EstadoProcesamientoResponse } from "@/types/evaluacion";

/**
 * GET /api/cuestionario/:sesionId/estado
 * Obtiene el estado de procesamiento de una evaluación
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sesionId: string }> }
) {
  try {
    const { sesionId } = await params;

    const sesion = await prisma.sesionEvaluacion.findUnique({
      where: { id: sesionId },
      include: {
        resultados: true,
        llmResponses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        reportes: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!sesion) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    // Calcular progreso y etapa actual
    const etapas = [
      {
        nombre: "Calculando puntajes",
        completada: sesion.resultados.length > 0,
      },
      {
        nombre: "Generando análisis con IA",
        completada: sesion.llmResponses.length > 0 && sesion.llmResponses[0].status === "success",
      },
      {
        nombre: "Creando reporte",
        completada: sesion.reportes.length > 0,
      },
      {
        nombre: "Enviando por email",
        completada: sesion.estado === "finalizada",
      },
    ];

    const etapasCompletadas = etapas.filter((e) => e.completada).length;
    const progreso = Math.round((etapasCompletadas / etapas.length) * 100);

    const etapaActual =
      etapas.find((e) => !e.completada)?.nombre ?? "Completado";

    const response: EstadoProcesamientoResponse = {
      sesionId,
      estado: sesion.estado as EstadoProcesamientoResponse["estado"],
      progreso,
      etapaActual,
      etapas,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error obteniendo estado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
