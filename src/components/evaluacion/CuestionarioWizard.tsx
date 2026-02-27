"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Send, Loader2, CheckCircle2 } from "lucide-react";
import { CaracterizacionForm } from "./CaracterizacionForm";
import { PreguntaForm } from "./PreguntaForm";
import { ResultadosView } from "./ResultadosView";
import type { 
  CuestionarioPayload, 
  EnvioEvaluacionPayload,
  RespuestaCaracterizacion,
  RespuestaPregunta 
} from "@/types/evaluacion";

interface CuestionarioWizardProps {
  evaluacionId: string;
}

type WizardStep = "caracterizacion" | "cuestionario" | "enviando" | "resultados";
type TabStep = "caracterizacion" | "cuestionario";

export function CuestionarioWizard({ evaluacionId }: CuestionarioWizardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CuestionarioPayload | null>(null);
  const [step, setStep] = useState<WizardStep>("caracterizacion");
  const [dimensionActual, setDimensionActual] = useState(0);
  
  // Estado del formulario
  const [empresa, setEmpresa] = useState({ nombre: "", email: "", telefono: "" });
  const [caracterizacion, setCaracterizacion] = useState<RespuestaCaracterizacion[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaPregunta>>({});
  
  // Estado de envío
  const [enviando, setEnviando] = useState(false);
  const [sesionId, setSesionId] = useState<string | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [startedAt] = useState(new Date().toISOString());

  // Cargar evaluación
  useEffect(() => {
    fetch(`/api/evaluaciones/${evaluacionId}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando evaluación:", err);
        setLoading(false);
      });
  }, [evaluacionId]);

  // Polling de estado cuando está enviando
  useEffect(() => {
    if (!sesionId || step !== "enviando") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/cuestionario/${sesionId}/estado`);
        const estado = await res.json();
        setProgreso(estado.progreso);

        if (estado.estado === "finalizada") {
          clearInterval(interval);
          setStep("resultados");
        } else if (estado.estado === "error") {
          clearInterval(interval);
          alert("Hubo un error procesando tu evaluación. Por favor intenta de nuevo.");
          setStep("cuestionario");
        }
      } catch (err) {
        console.error("Error polling estado:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sesionId, step]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No se pudo cargar la evaluación
          </p>
        </CardContent>
      </Card>
    );
  }

  const dimensiones = data.dimensiones;
  const dimensionActualData = dimensiones[dimensionActual];
  
  // Calcular progreso total
  const totalPreguntas = data.metadata.totalPreguntas;
  const preguntasRespondidas = Object.keys(respuestas).length;
  const progresoPreguntas = Math.round((preguntasRespondidas / totalPreguntas) * 100);

  // Validaciones
  const caracterizacionCompleta = data.caracterizacion.campos
    .filter((c) => c.requerido)
    .every((c) => caracterizacion.find((r) => r.campoId === c.id)?.valor);

  const empresaCompleta = empresa.nombre.trim() && empresa.email.trim();

  const dimensionCompleta = dimensionActualData?.preguntas.every(
    (p) => respuestas[p.id]?.opcionesSeleccionadas?.length > 0
  );

  const todasPreguntasCompletas = dimensiones.every((d) =>
    d.preguntas.every((p) => respuestas[p.id]?.opcionesSeleccionadas?.length > 0)
  );

  // Handlers
  const handleCaracterizacionChange = (campoId: string, valor: string | string[] | number) => {
    setCaracterizacion((prev) => {
      const existing = prev.findIndex((c) => c.campoId === campoId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { campoId, valor };
        return updated;
      }
      return [...prev, { campoId, valor }];
    });
  };

  const handleRespuestaChange = (preguntaId: string, respuesta: RespuestaPregunta) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: respuesta,
    }));
  };

  const handleEnviar = async () => {
    setEnviando(true);
    setStep("enviando");

    const payload: EnvioEvaluacionPayload = {
      evaluacionId,
      empresa,
      caracterizacion,
      respuestas: Object.values(respuestas),
      metadata: {
        startedAt,
        completedAt: new Date().toISOString(),
      },
    };

    try {
      const res = await fetch("/api/cuestionario/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (res.ok) {
        setSesionId(result.sesionId);
      } else {
        throw new Error(result.error || "Error enviando cuestionario");
      }
    } catch (err) {
      console.error("Error enviando:", err);
      alert("Error enviando el cuestionario. Por favor intenta de nuevo.");
      setEnviando(false);
      setStep("cuestionario");
    }
  };

  // Render según paso
  if (step === "enviando") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Procesando tu evaluación</CardTitle>
          <CardDescription>
            Estamos analizando tus respuestas y generando recomendaciones personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progreso} className="h-3" />
          <p className="text-center text-muted-foreground">
            {progreso}% completado
          </p>
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "resultados") {
    if (sesionId) {
      return <ResultadosView sesionId={sesionId} />;
    }
    // Fallback if no sesionId
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{data.evaluacion.nombre}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {data.metadata.totalPreguntas} preguntas · ~{data.metadata.tiempoEstimadoMinutos} min
        </p>
      </div>

      {/* Progreso */}
      {step === "cuestionario" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progreso</span>
            <span>{progresoPreguntas}%</span>
          </div>
          <Progress value={progresoPreguntas} className="h-2" />
        </div>
      )}

      {/* Tabs de navegación */}
      <Tabs value={step} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger 
            value="caracterizacion" 
            onClick={() => setStep("caracterizacion")}
            className="text-xs sm:text-sm py-2 sm:py-3"
          >
            1. Tu Empresa
          </TabsTrigger>
          <TabsTrigger 
            value="cuestionario" 
            onClick={() => setStep("cuestionario")}
            disabled={!caracterizacionCompleta || !empresaCompleta}
            className="text-xs sm:text-sm py-2 sm:py-3"
          >
            2. Evaluación
          </TabsTrigger>
        </TabsList>

        {/* Paso 1: Caracterización */}
        <TabsContent value="caracterizacion" className="mt-6">
          <CaracterizacionForm
            campos={data.caracterizacion.campos}
            empresa={empresa}
            caracterizacion={caracterizacion}
            onEmpresaChange={setEmpresa}
            onCaracterizacionChange={handleCaracterizacionChange}
          />
          
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep("cuestionario")}
              disabled={!caracterizacionCompleta || !empresaCompleta}
            >
              Continuar <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Paso 2: Cuestionario */}
        <TabsContent value="cuestionario" className="mt-6">
          {/* Navegación de dimensiones */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {dimensiones.map((d, i) => {
              const completada = d.preguntas.every(
                (p) => respuestas[p.id]?.opcionesSeleccionadas?.length > 0
              );
              return (
                <Button
                  key={d.id}
                  variant={i === dimensionActual ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDimensionActual(i)}
                  className="whitespace-nowrap"
                >
                  {completada && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {d.nombre}
                </Button>
              );
            })}
          </div>

          {/* Dimensión actual */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {dimensionActualData.color && (
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: dimensionActualData.color }}
                  />
                )}
                <CardTitle>{dimensionActualData.nombre}</CardTitle>
              </div>
              {dimensionActualData.descripcion && (
                <CardDescription>{dimensionActualData.descripcion}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              {dimensionActualData.preguntas.map((pregunta, idx) => (
                <PreguntaForm
                  key={pregunta.id}
                  pregunta={pregunta}
                  numero={idx + 1}
                  respuesta={respuestas[pregunta.id]}
                  onChange={(r) => handleRespuestaChange(pregunta.id, r)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Navegación */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (dimensionActual > 0) {
                  setDimensionActual(dimensionActual - 1);
                } else {
                  setStep("caracterizacion");
                }
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>

            {dimensionActual < dimensiones.length - 1 ? (
              <Button
                onClick={() => setDimensionActual(dimensionActual + 1)}
                disabled={!dimensionCompleta}
              >
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleEnviar}
                disabled={!todasPreguntasCompletas || enviando}
              >
                {enviando ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar Evaluación
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
