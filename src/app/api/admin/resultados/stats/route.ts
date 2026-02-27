import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [totalSesiones, completadas, sesionesConPuntaje] = await Promise.all([
      prisma.sesionEvaluacion.count(),
      prisma.sesionEvaluacion.count({ where: { estado: "COMPLETADA" } }),
      prisma.sesionEvaluacion.findMany({
        where: { puntajeGlobal: { not: null } },
        select: { puntajeGlobal: true },
      }),
    ]);

    // Calcular promedio
    const puntajes = sesionesConPuntaje
      .map((s) => s.puntajeGlobal)
      .filter((p): p is number => p !== null);
    
    const promedioGlobal = puntajes.length > 0
      ? puntajes.reduce((a, b) => a + b, 0) / puntajes.length
      : 0;

    // Distribución por nivel
    const getNivel = (puntaje: number) => {
      if (puntaje >= 80) return "Líder";
      if (puntaje >= 60) return "Maduro";
      if (puntaje >= 40) return "En Desarrollo";
      if (puntaje >= 20) return "Inicial";
      return "Incipiente";
    };

    const porNivel: Record<string, number> = {
      "Incipiente": 0,
      "Inicial": 0,
      "En Desarrollo": 0,
      "Maduro": 0,
      "Líder": 0,
    };

    puntajes.forEach((p) => {
      porNivel[getNivel(p)]++;
    });

    return NextResponse.json({
      totalSesiones,
      completadas,
      promedioGlobal,
      porNivel,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error fetching stats" },
      { status: 500 }
    );
  }
}
