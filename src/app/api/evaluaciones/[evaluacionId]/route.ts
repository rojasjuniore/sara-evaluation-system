import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { CuestionarioPayload } from "@/types/evaluacion";

/**
 * GET /api/evaluaciones/:evaluacionId
 * Obtiene una evaluación completa para renderizar el cuestionario
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ evaluacionId: string }> }
) {
  try {
    const { evaluacionId } = await params;

    const evaluacion = await prisma.evaluacion.findUnique({
      where: { id: evaluacionId, activa: true },
      include: {
        camposCaracterizacion: {
          orderBy: { orden: "asc" },
        },
        dimensiones: {
          orderBy: { orden: "asc" },
          include: {
            preguntas: {
              where: { activa: true },
              orderBy: { orden: "asc" },
              include: {
                opciones: {
                  orderBy: { orden: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!evaluacion) {
      return NextResponse.json(
        { error: "Evaluación no encontrada" },
        { status: 404 }
      );
    }

    // Calcular metadata
    const totalPreguntas = evaluacion.dimensiones.reduce(
      (acc, d) => acc + d.preguntas.length,
      0
    );
    const tiempoEstimado = Math.ceil(totalPreguntas * 0.75); // ~45 segundos por pregunta

    // Transformar a formato de payload
    const payload: CuestionarioPayload = {
      evaluacion: {
        id: evaluacion.id,
        nombre: evaluacion.nombre,
        version: evaluacion.version,
      },
      caracterizacion: {
        campos: evaluacion.camposCaracterizacion.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          label: c.label,
          tipo: c.tipo as "text" | "select" | "multiselect" | "number",
          opciones: (c.opciones as string[]) ?? undefined,
          requerido: c.requerido,
          orden: c.orden,
          placeholder: c.placeholder ?? undefined,
          validacion: c.validacion as { min?: number; max?: number; pattern?: string } | undefined,
        })),
      },
      dimensiones: evaluacion.dimensiones.map((d) => ({
        id: d.id,
        nombre: d.nombre,
        descripcion: d.descripcion ?? undefined,
        peso: d.peso,
        orden: d.orden,
        icono: d.icono ?? undefined,
        color: d.color ?? undefined,
        preguntas: d.preguntas.map((p) => ({
          id: p.id,
          texto: p.texto,
          tipo: p.tipo as "single" | "multiple",
          requiereJustificacion: p.requiereJustificacion,
          justificacionObligatoria: p.justificacionObligatoria,
          justificacionPlaceholder: p.justificacionPlaceholder ?? undefined,
          orden: p.orden,
          peso: p.peso,
          opciones: p.opciones.map((o) => ({
            id: o.id,
            texto: o.texto,
            puntaje: o.puntaje,
            orden: o.orden,
          })),
        })),
      })),
      metadata: {
        totalPreguntas,
        totalDimensiones: evaluacion.dimensiones.length,
        tiempoEstimadoMinutos: tiempoEstimado,
      },
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error obteniendo evaluación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
