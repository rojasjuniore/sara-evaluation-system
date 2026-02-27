import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const dimensiones = await prisma.dimension.findMany({
      include: {
        evaluacion: { select: { nombre: true } },
        _count: { select: { preguntas: true } },
      },
      orderBy: [{ evaluacionId: "asc" }, { orden: "asc" }],
    });

    return NextResponse.json(dimensiones);
  } catch (error) {
    console.error("Error fetching dimensiones:", error);
    return NextResponse.json(
      { error: "Error fetching dimensiones" },
      { status: 500 }
    );
  }
}
