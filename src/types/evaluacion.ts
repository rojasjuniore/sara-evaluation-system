// =============================================
// TIPOS PARA EL SISTEMA DE EVALUACIÓN
// =============================================

// === CONFIGURACIÓN ===

export interface Evaluacion {
  id: string;
  nombre: string;
  descripcion?: string;
  version: string;
  activa: boolean;
}

export interface CampoCaracterizacion {
  id: string;
  nombre: string;
  label: string;
  tipo: "text" | "select" | "multiselect" | "number";
  opciones?: string[];
  requerido: boolean;
  orden: number;
  placeholder?: string;
  validacion?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Dimension {
  id: string;
  nombre: string;
  descripcion?: string;
  peso: number;
  orden: number;
  icono?: string;
  color?: string;
  preguntas: Pregunta[];
}

export interface Pregunta {
  id: string;
  texto: string;
  tipo: "single" | "multiple";
  requiereJustificacion: boolean;
  justificacionObligatoria: boolean;
  justificacionPlaceholder?: string;
  orden: number;
  peso: number;
  opciones: OpcionRespuesta[];
}

export interface OpcionRespuesta {
  id: string;
  texto: string;
  puntaje: number;
  orden: number;
}

// === PAYLOAD BACKEND -> FRONTEND ===

export interface CuestionarioPayload {
  evaluacion: {
    id: string;
    nombre: string;
    version: string;
  };
  caracterizacion: {
    campos: CampoCaracterizacion[];
  };
  dimensiones: Dimension[];
  metadata: {
    totalPreguntas: number;
    totalDimensiones: number;
    tiempoEstimadoMinutos: number;
  };
}

// === PAYLOAD FRONTEND -> BACKEND ===

export interface RespuestaEmpresa {
  nombre: string;
  email: string;
  telefono?: string;
}

export interface RespuestaCaracterizacion {
  campoId: string;
  valor: string | string[] | number;
}

export interface RespuestaPregunta {
  preguntaId: string;
  opcionesSeleccionadas: string[];
  justificacion?: string;
}

export interface EnvioEvaluacionPayload {
  evaluacionId: string;
  empresa: RespuestaEmpresa;
  caracterizacion: RespuestaCaracterizacion[];
  respuestas: RespuestaPregunta[];
  metadata: {
    startedAt: string;
    completedAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

// === RESPUESTAS API ===

export interface EnvioEvaluacionResponse {
  status: "accepted";
  sesionId: string;
  message: string;
  estimatedTimeSeconds: number;
  pollingEndpoint: string;
}

export interface EstadoProcesamientoResponse {
  sesionId: string;
  estado: "en_progreso" | "completada" | "procesando" | "finalizada" | "error";
  progreso: number;
  etapaActual: string;
  etapas: {
    nombre: string;
    completada: boolean;
  }[];
}

// === RESULTADOS ===

export interface ResultadoDimension {
  nombre: string;
  puntaje: number;
  nivel: string;
  color?: string;
  recomendacion?: string;
}

export interface ResultadoEvaluacion {
  sesionId: string;
  estado: string;
  resultados: {
    puntajeGlobal: number;
    nivelGlobal: string;
    dimensiones: ResultadoDimension[];
  };
  reporte?: {
    url: string;
    enviadoA: string;
    enviadoAt: string;
  };
}

// === EVOLUCIÓN TEMPORAL ===

export interface PuntoEvolucion {
  sesionId: string;
  fecha: string;
  puntaje: number;
  delta: number;
  numero: number;
  label?: string;
}

export interface EvolucionEmpresa {
  empresa: {
    id: string;
    nombre: string;
  };
  resumen: {
    totalEvaluaciones: number;
    primeraEvaluacion: string;
    ultimaEvaluacion: string;
    mejoraAcumulada: number;
    tendencia: "positiva" | "negativa" | "estable";
  };
  evolucionGlobal: PuntoEvolucion[];
  evolucionPorDimension: Record<string, { fecha: string; puntaje: number; nivel: string }[]>;
  comparativaUltimaVsAnterior?: {
    puntajeAnterior: number;
    puntajeActual: number;
    delta: number;
    porcentajeMejora: number;
    dimensionesMejoradas: string[];
    dimensionesEstancadas: string[];
    dimensionesRetroceso: string[];
  };
}

// === BENCHMARKING ===

export interface BenchmarkGlobal {
  sector: string;
  tuPuntaje: number;
  percentil: number;
  posicion: string;
  empresasEvaluadas: number;
  comparativa: {
    vsPromedio: number;
    vsMediana: number;
    paraTop25: number;
    paraTop10: number;
  };
  distribucionSector: {
    min: number;
    p25: number;
    mediana: number;
    promedio: number;
    p75: number;
    p90: number;
    max: number;
  };
}

export interface BenchmarkDimension {
  dimension: string;
  tuPuntaje: number;
  percentil: number;
  posicion: "top10" | "top25" | "above_avg" | "below_avg" | "bottom25";
  sectorStats: {
    promedio: number;
    mediana: number;
    p75: number;
    p90: number;
  };
  vsPromedio: number;
  insight: string;
}

export interface BenchmarkResponse {
  disponible: boolean;
  mensaje?: string;
  sesionId: string;
  benchmarkGlobal?: BenchmarkGlobal;
  benchmarkDimensiones?: BenchmarkDimension[];
  insightsIa?: {
    fortalezaCompetitiva: string;
    areaOportunidad: string;
    recomendacionPriorizada: string;
  };
}
