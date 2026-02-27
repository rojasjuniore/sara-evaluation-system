# SARA - Sistema de Evaluación de Madurez

Sistema completo para evaluar la madurez digital/organizacional de empresas, con análisis personalizado mediante IA.

## 🎯 Descripción

SARA permite crear y gestionar evaluaciones de madurez multidimensionales. Las empresas completan cuestionarios dinámicos y reciben un diagnóstico personalizado con recomendaciones generadas por IA (Claude de Anthropic).

## 🚀 URLs en Producción

- **Landing:** https://web-production-4e7fb.up.railway.app
- **Evaluación Demo:** https://web-production-4e7fb.up.railway.app/evaluacion/demo
- **Panel Admin:** https://web-production-4e7fb.up.railway.app/admin

## 📊 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (Next.js 16 + React)                      │
├─────────────┬─────────────────────┬─────────────────────────┤
│   Landing   │   Cuestionario      │    Panel Admin          │
│    Page     │     Wizard          │   (CRUD Completo)       │
└─────────────┴─────────────────────┴─────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│              (Next.js Server Actions)                        │
├─────────────┬─────────────────────┬─────────────────────────┤
│ /api/       │ /api/cuestionario/  │ /api/admin/             │
│ evaluaciones│ enviar, estado,     │ stats, evaluaciones,    │
│             │ resultados          │ sesiones                │
└─────────────┴─────────────────────┴─────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐     ┌─────────────────────┐
│    PostgreSQL       │     │   Anthropic API     │
│    (Railway)        │     │   (Claude)          │
│                     │     │                     │
│ - Evaluaciones      │     │ - Análisis IA       │
│ - Dimensiones       │     │ - Recomendaciones   │
│ - Preguntas         │     │   personalizadas    │
│ - Sesiones          │     │                     │
│ - Resultados        │     │                     │
└─────────────────────┘     └─────────────────────┘
```

## 🗃️ Modelo de Datos

```
Evaluacion
├── CampoCaracterizacion[]   # Campos para caracterizar empresa
├── Dimension[]              # Dimensiones de madurez
│   ├── Pregunta[]           # Preguntas por dimensión
│   │   └── OpcionRespuesta[] # Opciones con puntajes
│   └── RecomendacionBase[]  # Recomendaciones por nivel
├── ConfiguracionLlm         # Config del modelo IA
└── SesionEvaluacion[]       # Sesiones completadas
    ├── Empresa              # Datos de la empresa
    ├── RespuestaCuestionario[] # Respuestas dadas
    └── ResultadoDimension[] # Puntajes calculados
```

## 🔧 Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| UI Components | shadcn/ui (Radix UI) |
| Gráficos | Recharts (Radar, Bar charts) |
| Backend | Next.js API Routes |
| Base de Datos | PostgreSQL (Railway) |
| ORM | Prisma 6 |
| IA | Anthropic Claude (claude-sonnet-4) |
| Hosting | Railway |

## 📋 Funcionalidades

### Para Usuarios (Evaluados)

1. **Caracterización de Empresa**
   - Sector industrial
   - Número de empleados
   - País
   - Facturación anual

2. **Cuestionario por Dimensiones**
   - Tecnología
   - Cultura Organizacional
   - Procesos
   - Experiencia del Cliente

3. **Resultados**
   - Puntaje global (0-100)
   - Nivel de madurez (Incipiente → Líder)
   - Gráfico radar multidimensional
   - Gráfico de barras por dimensión
   - Análisis personalizado con IA
   - Recomendaciones accionables

### Para Administradores

1. **Dashboard** (`/admin`)
   - Stats de evaluaciones, dimensiones, preguntas, sesiones

2. **Gestión de Evaluaciones** (`/admin/evaluaciones`)
   - Crear/editar/eliminar evaluaciones
   - Configurar versiones y estado (activa/inactiva)

3. **Editor de Cuestionarios** (`/admin/evaluaciones/[id]/editar`)
   - Editar dimensiones (nombre, color, peso)
   - Editar preguntas (texto, tipo single/multiple)
   - Configurar opciones con puntajes (0-100)
   - Habilitar justificación por pregunta

4. **Sesiones** (`/admin/sesiones`)
   - Ver todas las evaluaciones completadas
   - Puntajes y niveles por empresa
   - Exportar datos

## 🧮 Sistema de Scoring

```javascript
// Por pregunta
puntajePregunta = promedio(opcionesSeleccionadas.puntaje)

// Por dimensión
puntajeDimension = promedio(preguntas.puntaje) * peso

// Global
puntajeGlobal = promedio(dimensiones.puntaje)

// Niveles
0-20:  "Incipiente"
20-40: "Inicial"
40-60: "En Desarrollo"
60-80: "Maduro"
80-100: "Líder"
```

## 🤖 Integración con IA

El sistema genera análisis personalizados usando Claude:

```typescript
// Prompt incluye:
- Datos de la empresa (sector, tamaño, país)
- Puntajes por dimensión
- Respuestas textuales (justificaciones)
- Contexto de la evaluación

// Output estructurado:
- Diagnóstico Ejecutivo
- Fortalezas Identificadas
- Áreas Críticas de Mejora
- Roadmap de 90 Días
- Quick Wins
- Métricas de Seguimiento
```

## 🚀 Deployment

### Variables de Entorno Requeridas

```env
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...  # Opcional - funciona sin IA
```

### Comandos

```bash
# Desarrollo
pnpm install
pnpm run db:push
pnpm run db:seed
pnpm run dev

# Producción
pnpm run build
pnpm run start
```

## 📁 Estructura del Proyecto

```
sara-evaluation-system/
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   └── seed.ts            # Datos iniciales
├── src/
│   ├── app/
│   │   ├── admin/         # Panel de administración
│   │   ├── api/           # API routes
│   │   ├── evaluacion/    # Páginas de evaluación
│   │   └── page.tsx       # Landing
│   ├── components/
│   │   ├── evaluacion/    # Componentes del cuestionario
│   │   └── ui/            # shadcn/ui components
│   ├── lib/
│   │   ├── anthropic.ts   # Cliente IA
│   │   ├── prisma.ts      # Cliente DB
│   │   ├── scoring.ts     # Cálculo de puntajes
│   │   └── prompt-builder.ts # Generador de prompts
│   └── types/
│       └── evaluacion.ts  # TypeScript types
├── railway.toml           # Config Railway
└── nixpacks.toml          # Config build
```

## 📈 Próximos Pasos

- [ ] Autenticación para admin (NextAuth)
- [ ] Exportación a PDF de resultados
- [ ] Envío automático por email
- [ ] Comparativas con benchmark del sector
- [ ] Dashboard de analytics
- [ ] Soporte multi-idioma

## 🔗 Enlaces

- **GitHub:** https://github.com/rojasjuniore/sara-evaluation-system
- **Railway Project:** sara-evaluation
- **Producción:** https://web-production-4e7fb.up.railway.app

---

Desarrollado con ❤️ usando Next.js 16, Prisma, y Claude AI.
