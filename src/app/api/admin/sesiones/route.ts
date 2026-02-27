import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sesiones = await prisma.sesionEvaluacion.findMany({
      include: {
        evaluacion: {
          select: { nombre: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sesiones);
  } catch (error) {
    console.error("Error fetching sesiones:", error);
    return NextResponse.json(
      { error: "Error fetching sesiones" },
      { status: 500 }
    );
  }
}
