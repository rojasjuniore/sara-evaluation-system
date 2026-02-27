import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Crear evaluación principal
  const evaluacion = await prisma.evaluacion.create({
    data: {
      id: "demo",
      nombre: "Evaluación de Madurez Digital",
      descripcion:
        "Evalúa el nivel de madurez digital de tu organización en múltiples dimensiones",
      version: "1.0",
      activa: true,
    },
  });

  console.log("✅ Evaluación creada:", evaluacion.nombre);

  // 2. Configuración LLM
  await prisma.configuracionLlm.create({
    data: {
      evaluacionId: evaluacion.id,
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      systemPrompt: `Eres un consultor experto en transformación digital y madurez organizacional con más de 15 años de experiencia en empresas de Latinoamérica.

Tu rol es analizar los resultados de evaluaciones de madurez empresarial y proporcionar recomendaciones estratégicas personalizadas.

Características de tu análisis:
- Basado en evidencia y datos proporcionados
- Específico al contexto de la empresa (sector, tamaño, situación actual)
- Priorizado por impacto y factibilidad
- Accionable y medible
- Tono profesional pero accesible, en español

Estructura tu respuesta en formato Markdown con:
## Diagnóstico Ejecutivo
## Fortalezas Identificadas
## Áreas Críticas de Mejora
## Roadmap de 90 Días
## Quick Wins
## Métricas de Seguimiento

Evita:
- Recomendaciones genéricas que apliquen a cualquier empresa
- Jerga técnica excesiva sin explicación
- Sugerencias sin considerar el contexto proporcionado`,
      temperature: 0.7,
      maxTokens: 4000,
    },
  });

  console.log("✅ Configuración LLM creada");

  // 3. Campos de caracterización
  const camposCaracterizacion = [
    {
      nombre: "sector",
      label: "Sector Industrial",
      tipo: "select",
      opciones: [
        "Fintech",
        "Retail",
        "Manufactura",
        "Servicios Profesionales",
        "Salud",
        "Educación",
        "Logística",
        "Telecomunicaciones",
        "Otro",
      ],
      requerido: true,
      orden: 0,
      placeholder: "Selecciona tu sector",
    },
    {
      nombre: "empleados",
      label: "Número de Empleados",
      tipo: "select",
      opciones: ["1-10", "11-50", "51-200", "201-500", "500+"],
      requerido: true,
      orden: 1,
    },
    {
      nombre: "pais",
      label: "País",
      tipo: "select",
      opciones: [
        "Colombia",
        "México",
        "Argentina",
        "Chile",
        "Perú",
        "Ecuador",
        "España",
        "Otro",
      ],
      requerido: true,
      orden: 2,
    },
    {
      nombre: "facturacion",
      label: "Facturación Anual (USD)",
      tipo: "select",
      opciones: [
        "Menos de $100K",
        "$100K - $500K",
        "$500K - $1M",
        "$1M - $5M",
        "$5M - $20M",
        "Más de $20M",
      ],
      requerido: false,
      orden: 3,
    },
  ];

  for (const campo of camposCaracterizacion) {
    await prisma.campoCaracterizacion.create({
      data: {
        evaluacionId: evaluacion.id,
        ...campo,
        opciones: campo.opciones,
      },
    });
  }

  console.log("✅ Campos de caracterización creados:", camposCaracterizacion.length);

  // 4. Dimensiones con preguntas
  const dimensionesData = [
    {
      nombre: "Tecnología",
      descripcion:
        "Evalúa la infraestructura tecnológica y herramientas digitales de la organización",
      peso: 1.0,
      orden: 0,
      icono: "server",
      color: "#3B82F6",
      preguntas: [
        {
          texto: "¿Qué nivel de digitalización tienen sus procesos core de negocio?",
          tipo: "single",
          requiereJustificacion: true,
          justificacionObligatoria: false,
          justificacionPlaceholder:
            "Describe brevemente qué procesos están digitalizados y cuáles no...",
          opciones: [
            { texto: "Totalmente manuales (papel/Excel)", puntaje: 0 },
            { texto: "Parcialmente digitalizados (algunas herramientas)", puntaje: 25 },
            { texto: "Mayormente digitalizados con sistemas legacy", puntaje: 50 },
            { texto: "Completamente digitales con sistemas modernos", puntaje: 75 },
            { texto: "Digitales con IA/automatización avanzada", puntaje: 100 },
          ],
        },
        {
          texto: "¿Qué tecnologías cloud utilizan actualmente?",
          tipo: "multiple",
          requiereJustificacion: false,
          opciones: [
            { texto: "Ninguna (todo on-premise)", puntaje: 0 },
            { texto: "SaaS (Office 365, Google Workspace, etc.)", puntaje: 25 },
            { texto: "IaaS (AWS, Azure, GCP)", puntaje: 50 },
            { texto: "PaaS (Heroku, Railway, Vercel)", puntaje: 75 },
            { texto: "Arquitectura serverless/microservicios", puntaje: 100 },
          ],
        },
        {
          texto: "¿Cómo gestionan la seguridad de la información?",
          tipo: "single",
          requiereJustificacion: true,
          justificacionObligatoria: false,
          opciones: [
            { texto: "No hay políticas formales de seguridad", puntaje: 0 },
            { texto: "Políticas básicas (antivirus, backups manuales)", puntaje: 25 },
            { texto: "Políticas documentadas pero implementación parcial", puntaje: 50 },
            { texto: "Framework de seguridad implementado (ISO 27001, SOC2)", puntaje: 75 },
            { texto: "Seguridad proactiva con monitoreo 24/7 y respuesta a incidentes", puntaje: 100 },
          ],
        },
      ],
    },
    {
      nombre: "Cultura Organizacional",
      descripcion: "Evalúa la mentalidad digital y capacidad de cambio de la organización",
      peso: 1.0,
      orden: 1,
      icono: "users",
      color: "#10B981",
      preguntas: [
        {
          texto: "¿Cómo describirías la apertura al cambio tecnológico en tu organización?",
          tipo: "single",
          requiereJustificacion: true,
          justificacionObligatoria: true,
          justificacionPlaceholder: "Explica con un ejemplo concreto de un cambio reciente...",
          opciones: [
            { texto: "Alta resistencia al cambio", puntaje: 0 },
            { texto: "Aceptan cambios pero con mucha lentitud", puntaje: 25 },
            { texto: "Abiertos pero necesitan convencimiento", puntaje: 50 },
            { texto: "Proactivos en adoptar nuevas tecnologías", puntaje: 75 },
            { texto: "Cultura de innovación continua", puntaje: 100 },
          ],
        },
        {
          texto: "¿Cómo se toman las decisiones basadas en datos?",
          tipo: "single",
          requiereJustificacion: false,
          opciones: [
            { texto: "Las decisiones son principalmente por intuición", puntaje: 0 },
            { texto: "Algunos reportes pero decisiones mayormente intuitivas", puntaje: 25 },
            { texto: "Dashboards disponibles pero uso inconsistente", puntaje: 50 },
            { texto: "Data-driven en la mayoría de decisiones", puntaje: 75 },
            { texto: "Cultura data-driven con experimentación continua (A/B testing)", puntaje: 100 },
          ],
        },
        {
          texto: "¿Qué nivel de capacitación digital tiene tu equipo?",
          tipo: "single",
          requiereJustificacion: false,
          opciones: [
            { texto: "Conocimientos básicos de ofimática", puntaje: 0 },
            { texto: "Capacitados en herramientas específicas del trabajo", puntaje: 25 },
            { texto: "Programas de capacitación ocasionales", puntaje: 50 },
            { texto: "Plan de desarrollo digital continuo", puntaje: 75 },
            { texto: "Cultura de aprendizaje con certificaciones y upskilling activo", puntaje: 100 },
          ],
        },
      ],
    },
    {
      nombre: "Procesos",
      descripcion: "Evalúa la eficiencia y automatización de los procesos de negocio",
      peso: 1.0,
      orden: 2,
      icono: "workflow",
      color: "#F59E0B",
      preguntas: [
        {
          texto: "¿Qué nivel de documentación tienen sus procesos de negocio?",
          tipo: "single",
          requiereJustificacion: false,
          opciones: [
            { texto: "No hay documentación formal", puntaje: 0 },
            { texto: "Documentación parcial o desactualizada", puntaje: 25 },
            { texto: "Procesos principales documentados", puntaje: 50 },
            { texto: "Todos los procesos documentados y actualizados", puntaje: 75 },
            { texto: "Procesos documentados con mejora continua (BPM)", puntaje: 100 },
          ],
        },
        {
          texto: "¿Qué nivel de automatización tienen los procesos repetitivos?",
          tipo: "single",
          requiereJustificacion: true,
          justificacionObligatoria: false,
          justificacionPlaceholder: "Menciona ejemplos de procesos automatizados...",
          opciones: [
            { texto: "Todo es manual", puntaje: 0 },
            { texto: "Algunas macros o scripts básicos", puntaje: 25 },
            { texto: "Automatización con herramientas no-code (Zapier, Make)", puntaje: 50 },
            { texto: "RPA implementado en procesos clave", puntaje: 75 },
            { texto: "Automatización inteligente con IA/ML", puntaje: 100 },
          ],
        },
        {
          texto: "¿Cómo miden y optimizan el rendimiento de sus procesos?",
          tipo: "single",
          requiereJustificacion: false,
          opciones: [
            { texto: "No hay métricas definidas", puntaje: 0 },
            { texto: "Métricas básicas (tiempo, costo) medidas manualmente", puntaje: 25 },
            { texto: "KPIs definidos con seguimiento periódico", puntaje: 50 },
            { texto: "Dashboards en tiempo real con alertas", puntaje: 75 },
            { texto: "Optimización continua basada en analytics predictivo", puntaje: 100 },
          ],
        },
      ],
    },
    {
      nombre: "Experiencia del Cliente",
      descripcion: "Evalúa la madurez en la gestión de la experiencia digital del cliente",
      peso: 1.0,
      orden: 3,
      icono: "heart",
      color: "#EC4899",
      preguntas: [
        {
          texto: "¿Qué canales digitales utilizan para interactuar con clientes?",
          tipo: "multiple",
          requiereJustificacion: false,
          opciones: [
            { texto: "Solo canales tradicionales (teléfono, presencial)", puntaje: 0 },
            { texto: "Email y formularios web", puntaje: 20 },
            { texto: "Redes sociales activas", puntaje: 40 },
            { texto: "Chat en vivo / WhatsApp Business", puntaje: 60 },
            { texto: "App móvil propia", puntaje: 80 },
            { texto: "Chatbot con IA / Omnicanalidad integrada", puntaje: 100 },
          ],
        },
        {
          texto: "¿Cómo personalizan la experiencia del cliente?",
          tipo: "single",
          requiereJustificacion: false,
          opciones: [
            { texto: "Experiencia genérica para todos", puntaje: 0 },
            { texto: "Segmentación básica por tipo de cliente", puntaje: 25 },
            { texto: "Personalización basada en historial de compras", puntaje: 50 },
            { texto: "Recomendaciones personalizadas en tiempo real", puntaje: 75 },
            { texto: "Hiper-personalización con IA predictiva", puntaje: 100 },
          ],
        },
        {
          texto: "¿Cómo recopilan y actúan sobre el feedback del cliente?",
          tipo: "single",
          requiereJustificacion: true,
          justificacionObligatoria: false,
          opciones: [
            { texto: "No hay proceso formal de feedback", puntaje: 0 },
            { texto: "Encuestas ocasionales", puntaje: 25 },
            { texto: "NPS/CSAT medido regularmente", puntaje: 50 },
            { texto: "Voice of Customer integrado en decisiones", puntaje: 75 },
            { texto: "Feedback en tiempo real con acción automatizada", puntaje: 100 },
          ],
        },
      ],
    },
  ];

  for (const dimData of dimensionesData) {
    const { preguntas, ...dimensionFields } = dimData;

    const dimension = await prisma.dimension.create({
      data: {
        evaluacionId: evaluacion.id,
        ...dimensionFields,
      },
    });

    // Crear recomendaciones base para la dimensión
    const recomendaciones = [
      {
        puntajeMin: 0,
        puntajeMax: 20,
        nivel: "Incipiente",
        titulo: `${dimension.nombre}: Nivel Incipiente`,
        descripcion: `Tu organización está en las etapas iniciales de madurez en ${dimension.nombre}. Se requiere una estrategia integral de transformación.`,
        accionesSugeridas: [
          "Realizar diagnóstico detallado",
          "Definir visión y roadmap",
          "Identificar quick wins",
        ],
      },
      {
        puntajeMin: 20,
        puntajeMax: 40,
        nivel: "Inicial",
        titulo: `${dimension.nombre}: Nivel Inicial`,
        descripcion: `Hay esfuerzos aislados en ${dimension.nombre} pero falta una estrategia integrada. Es momento de consolidar.`,
        accionesSugeridas: [
          "Documentar procesos actuales",
          "Identificar gaps principales",
          "Priorizar iniciativas de alto impacto",
        ],
      },
      {
        puntajeMin: 40,
        puntajeMax: 60,
        nivel: "En Desarrollo",
        titulo: `${dimension.nombre}: En Desarrollo`,
        descripcion: `Buen progreso en ${dimension.nombre}. Las bases están establecidas, ahora es momento de escalar.`,
        accionesSugeridas: [
          "Optimizar procesos existentes",
          "Implementar métricas avanzadas",
          "Expandir adopción en toda la organización",
        ],
      },
      {
        puntajeMin: 60,
        puntajeMax: 80,
        nivel: "Maduro",
        titulo: `${dimension.nombre}: Nivel Maduro`,
        descripcion: `Excelente nivel de madurez en ${dimension.nombre}. Enfócate en optimización continua y diferenciación.`,
        accionesSugeridas: [
          "Implementar mejora continua",
          "Explorar tecnologías emergentes",
          "Compartir best practices internamente",
        ],
      },
      {
        puntajeMin: 80,
        puntajeMax: 100,
        nivel: "Líder",
        titulo: `${dimension.nombre}: Nivel Líder`,
        descripcion: `Tu organización es líder en ${dimension.nombre}. Mantén la innovación y considera compartir conocimiento con el ecosistema.`,
        accionesSugeridas: [
          "Innovación continua",
          "Mentoring a otras áreas/organizaciones",
          "Explorar nuevos horizontes tecnológicos",
        ],
      },
    ];

    for (const rec of recomendaciones) {
      await prisma.recomendacionBase.create({
        data: {
          dimensionId: dimension.id,
          ...rec,
          accionesSugeridas: rec.accionesSugeridas,
        },
      });
    }

    // Crear preguntas
    for (let i = 0; i < preguntas.length; i++) {
      const preguntaData = preguntas[i];
      const { opciones, ...preguntaFields } = preguntaData;

      const pregunta = await prisma.pregunta.create({
        data: {
          dimensionId: dimension.id,
          ...preguntaFields,
          orden: i,
        },
      });

      // Crear opciones
      for (let j = 0; j < opciones.length; j++) {
        await prisma.opcionRespuesta.create({
          data: {
            preguntaId: pregunta.id,
            texto: opciones[j].texto,
            puntaje: opciones[j].puntaje,
            orden: j,
          },
        });
      }
    }

    console.log(`✅ Dimensión creada: ${dimension.nombre} (${preguntas.length} preguntas)`);
  }

  console.log("\n🎉 Seed completado exitosamente!");
  console.log(`\n📊 Resumen:`);
  console.log(`   - 1 Evaluación`);
  console.log(`   - ${camposCaracterizacion.length} campos de caracterización`);
  console.log(`   - ${dimensionesData.length} dimensiones`);
  console.log(
    `   - ${dimensionesData.reduce((acc, d) => acc + d.preguntas.length, 0)} preguntas`
  );
  console.log(`\n🔗 URL de prueba: http://localhost:3000/evaluacion/demo`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
