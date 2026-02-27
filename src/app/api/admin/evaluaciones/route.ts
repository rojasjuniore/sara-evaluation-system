import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const evaluaciones = await prisma.evaluacion.findMany({
      include: {
        _count: {
          select: {
            dimensiones: true,
            sesiones: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(evaluaciones);
  } catch (error) {
    console.error("Error fetching evaluaciones:", error);
    return NextResponse.json(
      { error: "Error fetching evaluaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const evaluacion = await prisma.evaluacion.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        version: body.version || "1.0",
        activa: body.activa ?? true,
      },
    });

    return NextResponse.json(evaluacion, { status: 201 });
  } catch (error) {
    console.error("Error creating evaluacion:", error);
    return NextResponse.json(
      { error: "Error creating evaluacion" },
      { status: 500 }
    );
  }
}
