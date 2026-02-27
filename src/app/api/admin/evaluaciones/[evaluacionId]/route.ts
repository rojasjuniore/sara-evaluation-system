import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ evaluacionId: string }> }
) {
  const { evaluacionId } = await params;

  try {
    const evaluacion = await prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: {
        dimensiones: {
          orderBy: { orden: "asc" },
          include: {
            preguntas: {
              orderBy: { orden: "asc" },
              include: {
                opciones: {
                  orderBy: { orden: "asc" },
                },
              },
            },
          },
        },
        configuracionLlm: true,
      },
    });

    if (!evaluacion) {
      return NextResponse.json(
        { error: "Evaluación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluacion);
  } catch (error) {
    console.error("Error fetching evaluacion:", error);
    return NextResponse.json(
      { error: "Error fetching evaluacion" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ evaluacionId: string }> }
) {
  const { evaluacionId } = await params;
  const body = await request.json();

  try {
    // Actualizar evaluación básica
    const evaluacion = await prisma.evaluacion.update({
      where: { id: evaluacionId },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        version: body.version,
        activa: body.activa,
      },
    });

    // Actualizar dimensiones y preguntas si se proporcionan
    if (body.dimensiones) {
      for (const dim of body.dimensiones) {
        await prisma.dimension.update({
          where: { id: dim.id },
          data: {
            nombre: dim.nombre,
            descripcion: dim.descripcion,
            peso: dim.peso,
            orden: dim.orden,
            icono: dim.icono,
            color: dim.color,
          },
        });

        // Actualizar preguntas
        if (dim.preguntas) {
          for (const preg of dim.preguntas) {
            await prisma.pregunta.update({
              where: { id: preg.id },
              data: {
                texto: preg.texto,
                tipo: preg.tipo,
                requiereJustificacion: preg.requiereJustificacion,
                justificacionObligatoria: preg.justificacionObligatoria,
                justificacionPlaceholder: preg.justificacionPlaceholder,
                orden: preg.orden,
              },
            });

            // Actualizar opciones
            if (preg.opciones) {
              for (const opc of preg.opciones) {
                await prisma.opcionRespuesta.update({
                  where: { id: opc.id },
                  data: {
                    texto: opc.texto,
                    puntaje: opc.puntaje,
                    orden: opc.orden,
                  },
                });
              }
            }
          }
        }
      }
    }

    return NextResponse.json(evaluacion);
  } catch (error) {
    console.error("Error updating evaluacion:", error);
    return NextResponse.json(
      { error: "Error updating evaluacion" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ evaluacionId: string }> }
) {
  const { evaluacionId } = await params;

  try {
    await prisma.evaluacion.delete({
      where: { id: evaluacionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting evaluacion:", error);
    return NextResponse.json(
      { error: "Error deleting evaluacion" },
      { status: 500 }
    );
  }
}
