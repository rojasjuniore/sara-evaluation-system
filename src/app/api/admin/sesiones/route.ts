import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sesiones = await prisma.sesionEvaluacion.findMany({
      include: {
        evaluacion: {
          select: { nombre: true },
        },
        empresa: {
          select: { nombre: true, email: true },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    // Transformar para compatibilidad con el frontend
    const result = sesiones.map((s) => ({
      id: s.id,
      estado: s.estado,
      puntajeGlobal: s.puntajeGlobal,
      nivelGlobal: null, // Se calcula en base al puntaje
      empresaNombre: s.empresa.nombre,
      empresaEmail: s.empresa.email,
      createdAt: s.startedAt,
      completedAt: s.completedAt,
      evaluacion: s.evaluacion,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching sesiones:", error);
    return NextResponse.json(
      { error: "Error fetching sesiones" },
      { status: 500 }
    );
  }
}
