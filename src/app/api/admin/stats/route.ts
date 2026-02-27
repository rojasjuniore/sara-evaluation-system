import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [evaluaciones, dimensiones, preguntas, sesiones, sesionesCompletadas] =
      await Promise.all([
        prisma.evaluacion.count(),
        prisma.dimension.count(),
        prisma.pregunta.count(),
        prisma.sesionEvaluacion.count(),
        prisma.sesionEvaluacion.count({
          where: { estado: "COMPLETADA" },
        }),
      ]);

    return NextResponse.json({
      evaluaciones,
      dimensiones,
      preguntas,
      sesiones,
      sesionesCompletadas,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error fetching stats" },
      { status: 500 }
    );
  }
}
