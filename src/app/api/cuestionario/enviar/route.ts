import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { EnvioEvaluacionPayload, EnvioEvaluacionResponse } from "@/types/evaluacion";

/**
 * POST /api/cuestionario/enviar
 * Recibe las respuestas del cuestionario y las guarda
 */
export async function POST(request: NextRequest) {
  try {
    const body: EnvioEvaluacionPayload = await request.json();
    const { evaluacionId, empresa, caracterizacion, respuestas, metadata } = body;

    // 1. Validar que la evaluación existe
    const evaluacion = await prisma.evaluacion.findUnique({
      where: { id: evaluacionId, activa: true },
    });

    if (!evaluacion) {
      return NextResponse.json(
        { error: "Evaluación no encontrada" },
        { status: 404 }
      );
    }

    // 2. Buscar o crear empresa
    let empresaRecord = await prisma.empresa.findFirst({
      where: { email: empresa.email.toLowerCase() },
    });

    if (!empresaRecord) {
      empresaRecord = await prisma.empresa.create({
        data: {
          nombre: empresa.nombre,
          email: empresa.email.toLowerCase(),
          telefono: empresa.telefono,
        },
      });
    } else {
      // Actualizar nombre si cambió
      if (empresaRecord.nombre !== empresa.nombre) {
        await prisma.empresa.update({
          where: { id: empresaRecord.id },
          data: { nombre: empresa.nombre },
        });
      }
    }

    // 3. Guardar/actualizar caracterización
    for (const campo of caracterizacion) {
      await prisma.caracterizacionRespuesta.upsert({
        where: {
          id: `${empresaRecord.id}-${campo.campoId}`,
        },
        create: {
          id: `${empresaRecord.id}-${campo.campoId}`,
          empresaId: empresaRecord.id,
          evaluacionId,
          campoId: campo.campoId,
          valor: campo.valor as unknown as object,
        },
        update: {
          valor: campo.valor as unknown as object,
        },
      });
    }

    // 4. Crear sesión de evaluación
    const sesion = await prisma.sesionEvaluacion.create({
      data: {
        empresaId: empresaRecord.id,
        evaluacionId,
        estado: "completada",
        startedAt: new Date(metadata.startedAt),
        completedAt: new Date(metadata.completedAt),
        ipAddress: metadata.ipAddress ?? request.headers.get("x-forwarded-for") ?? undefined,
        userAgent: metadata.userAgent ?? request.headers.get("user-agent") ?? undefined,
      },
    });

    // 5. Guardar respuestas del cuestionario
    for (const respuesta of respuestas) {
      await prisma.respuestaCuestionario.create({
        data: {
          sesionId: sesion.id,
          preguntaId: respuesta.preguntaId,
          opcionesSeleccionadas: respuesta.opcionesSeleccionadas,
          justificacion: respuesta.justificacion,
        },
      });
    }

    // 6. Actualizar estado a "procesando"
    await prisma.sesionEvaluacion.update({
      where: { id: sesion.id },
      data: { estado: "procesando" },
    });

    // 7. Encolar job de procesamiento (TODO: BullMQ)
    // Por ahora procesamos síncronamente en desarrollo
    // await encolarProcesamiento(sesion.id);

    // Iniciar procesamiento en background
    processEvaluationAsync(sesion.id).catch(console.error);

    // 8. Responder inmediatamente
    const response: EnvioEvaluacionResponse = {
      status: "accepted",
      sesionId: sesion.id,
      message: "Tu evaluación está siendo procesada",
      estimatedTimeSeconds: 45,
      pollingEndpoint: `/api/cuestionario/${sesion.id}/estado`,
    };

    return NextResponse.json(response, { status: 202 });
  } catch (error) {
    console.error("Error enviando cuestionario:", error);
    return NextResponse.json(
      { error: "Error procesando el cuestionario" },
      { status: 500 }
    );
  }
}

/**
 * Procesa la evaluación en background
 */
async function processEvaluationAsync(sesionId: string) {
  const { calcularTodosLosPuntajes } = await import("@/lib/scoring");
  const {
    ensamblarContextoLlm,
    construirUserPrompt,
    obtenerConfigLlm,
  } = await import("@/lib/prompt-builder");
  const { generateAnalysis } = await import("@/lib/anthropic");

  try {
    // 1. Calcular puntajes
    const { puntajeGlobal } = await calcularTodosLosPuntajes(sesionId);
    console.log(`[${sesionId}] Puntajes calculados: ${puntajeGlobal}`);

    // 2. Obtener config LLM
    const sesion = await prisma.sesionEvaluacion.findUnique({
      where: { id: sesionId },
    });
    const configLlm = await obtenerConfigLlm(sesion!.evaluacionId);

    // 3. Ensamblar prompt
    const contexto = await ensamblarContextoLlm(sesionId);
    const userPrompt = construirUserPrompt(contexto);

    // 4. Llamar al LLM
    console.log(`[${sesionId}] Llamando al LLM...`);
    const llmResponse = await generateAnalysis({
      systemPrompt: configLlm.systemPrompt,
      userPrompt,
      model: configLlm.model,
      maxTokens: configLlm.maxTokens,
      temperature: configLlm.temperature,
    });

    // 5. Guardar respuesta del LLM
    await prisma.llmResponse.create({
      data: {
        sesionId,
        promptEnviado: userPrompt,
        respuestaLlm: llmResponse.content,
        tokensInput: llmResponse.tokensInput,
        tokensOutput: llmResponse.tokensOutput,
        latencyMs: llmResponse.latencyMs,
        status: "success",
      },
    });

    console.log(`[${sesionId}] LLM completado en ${llmResponse.latencyMs}ms`);

    // 6. Crear reporte (por ahora solo HTML)
    const reporte = await prisma.reporte.create({
      data: {
        sesionId,
        tipo: "html",
        contenidoHtml: llmResponse.content,
      },
    });

    // 7. TODO: Generar PDF y enviar email
    // await generarPDF(sesionId, llmResponse.content);
    // await enviarEmail(sesionId);

    // 8. Marcar como finalizada
    await prisma.sesionEvaluacion.update({
      where: { id: sesionId },
      data: { estado: "finalizada" },
    });

    console.log(`[${sesionId}] Evaluación finalizada`);
  } catch (error) {
    console.error(`[${sesionId}] Error procesando:`, error);
    await prisma.sesionEvaluacion.update({
      where: { id: sesionId },
      data: { estado: "error" },
    });

    await prisma.llmResponse.create({
      data: {
        sesionId,
        promptEnviado: "Error antes de construir prompt",
        status: "error",
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });
  }
}
