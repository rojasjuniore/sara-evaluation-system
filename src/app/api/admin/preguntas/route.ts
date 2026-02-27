import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const preguntas = await prisma.pregunta.findMany({
      include: {
        dimension: { 
          select: { 
            nombre: true, 
            color: true,
            evaluacion: { select: { id: true } }
          } 
        },
        _count: { select: { opciones: true } },
      },
      orderBy: [{ dimensionId: "asc" }, { orden: "asc" }],
    });

    return NextResponse.json(preguntas);
  } catch (error) {
    console.error("Error fetching preguntas:", error);
    return NextResponse.json(
      { error: "Error fetching preguntas" },
      { status: 500 }
    );
  }
}
