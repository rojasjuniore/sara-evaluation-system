import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { determinarNivelGlobal } from "@/lib/scoring";
import type { ResultadoEvaluacion } from "@/types/evaluacion";

/**
 * GET /api/cuestionario/:sesionId/resultados
 * Obtiene los resultados finales de una evaluación
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
        empresa: true,
        resultados: {
          include: {
            dimension: true,
            recomendacionBase: true,
          },
        },
        reportes: {
          include: {
            envios: {
              where: { estado: "enviado" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        llmResponses: {
          where: { status: "success" },
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

    if (sesion.estado !== "finalizada") {
      return NextResponse.json(
        { error: "La evaluación aún no ha sido procesada", estado: sesion.estado },
        { status: 400 }
      );
    }

    const response: ResultadoEvaluacion = {
      sesionId,
      estado: sesion.estado,
      resultados: {
        puntajeGlobal: sesion.puntajeGlobal ?? 0,
        nivelGlobal: determinarNivelGlobal(sesion.puntajeGlobal ?? 0),
        dimensiones: sesion.resultados.map((r) => ({
          nombre: r.dimension.nombre,
          puntaje: r.puntaje,
          nivel: r.nivel ?? "Sin clasificar",
          color: r.dimension.color ?? undefined,
          recomendacion: r.recomendacionBase?.descripcion,
        })),
      },
      reporte: sesion.reportes[0]
        ? {
            url: sesion.reportes[0].archivoUrl ?? `/api/cuestionario/${sesionId}/reporte`,
            enviadoA: sesion.empresa.email,
            enviadoAt: sesion.reportes[0].envios[0]?.enviadoAt?.toISOString() ?? "",
          }
        : undefined,
    };

    // Agregar análisis de IA si existe
    const analisisIa = sesion.llmResponses[0]?.respuestaLlm;

    return NextResponse.json({
      ...response,
      analisisIa,
    });
  } catch (error) {
    console.error("Error obteniendo resultados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
