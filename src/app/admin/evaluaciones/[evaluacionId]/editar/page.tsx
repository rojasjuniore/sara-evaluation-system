"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";

interface Opcion {
  id: string;
  texto: string;
  puntaje: number;
  orden: number;
}

interface Pregunta {
  id: string;
  texto: string;
  tipo: string;
  requiereJustificacion: boolean;
  justificacionObligatoria: boolean;
  justificacionPlaceholder: string | null;
  orden: number;
  opciones: Opcion[];
}

interface Dimension {
  id: string;
  nombre: string;
  descripcion: string | null;
  peso: number;
  orden: number;
  icono: string | null;
  color: string | null;
  preguntas: Pregunta[];
}

interface Evaluacion {
  id: string;
  nombre: string;
  descripcion: string | null;
  version: string;
  activa: boolean;
  dimensiones: Dimension[];
}

export default function EditarEvaluacionPage({
  params,
}: {
  params: Promise<{ evaluacionId: string }>;
}) {
  const { evaluacionId } = use(params);
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/evaluaciones/${evaluacionId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvaluacion(data);
        setLoading(false);
        if (data.dimensiones?.length > 0) {
          setExpandedDimension(data.dimensiones[0].id);
        }
      });
  }, [evaluacionId]);

  const handleSave = async () => {
    if (!evaluacion) return;
    setSaving(true);

    try {
      await fetch(`/api/admin/evaluaciones/${evaluacionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluacion),
      });
      alert("Guardado exitosamente");
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Evaluacion, value: string | boolean) => {
    if (!evaluacion) return;
    setEvaluacion({ ...evaluacion, [field]: value });
  };

  const updateDimension = (dimId: string, field: string, value: string | number) => {
    if (!evaluacion) return;
    setEvaluacion({
      ...evaluacion,
      dimensiones: evaluacion.dimensiones.map((d) =>
        d.id === dimId ? { ...d, [field]: value } : d
      ),
    });
  };

  const updatePregunta = (dimId: string, pregId: string, field: string, value: string | boolean) => {
    if (!evaluacion) return;
    setEvaluacion({
      ...evaluacion,
      dimensiones: evaluacion.dimensiones.map((d) =>
        d.id === dimId
          ? {
              ...d,
              preguntas: d.preguntas.map((p) =>
                p.id === pregId ? { ...p, [field]: value } : p
              ),
            }
          : d
      ),
    });
  };

  const updateOpcion = (dimId: string, pregId: string, opcId: string, field: string, value: string | number) => {
    if (!evaluacion) return;
    setEvaluacion({
      ...evaluacion,
      dimensiones: evaluacion.dimensiones.map((d) =>
        d.id === dimId
          ? {
              ...d,
              preguntas: d.preguntas.map((p) =>
                p.id === pregId
                  ? {
                      ...p,
                      opciones: p.opciones.map((o) =>
                        o.id === opcId ? { ...o, [field]: value } : o
                      ),
                    }
                  : p
              ),
            }
          : d
      ),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Evaluación no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/evaluaciones">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Editar: {evaluacion.nombre}</h1>
              <p className="text-sm text-muted-foreground">
                {evaluacion.dimensiones.length} dimensiones · 
                {evaluacion.dimensiones.reduce((acc, d) => acc + d.preguntas.length, 0)} preguntas
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="dimensiones">Dimensiones y Preguntas</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración LLM</TabsTrigger>
          </TabsList>

          {/* Tab General */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>Datos básicos de la evaluación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={evaluacion.nombre}
                      onChange={(e) => updateField("nombre", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Versión</Label>
                    <Input
                      id="version"
                      value={evaluacion.version}
                      onChange={(e) => updateField("version", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={evaluacion.descripcion || ""}
                    onChange={(e) => updateField("descripcion", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activa"
                    checked={evaluacion.activa}
                    onChange={(e) => updateField("activa", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="activa">Evaluación activa</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Dimensiones */}
          <TabsContent value="dimensiones" className="space-y-4">
            {evaluacion.dimensiones.map((dim) => (
              <Card key={dim.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedDimension(expandedDimension === dim.id ? null : dim.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      {dim.color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: dim.color }}
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg">{dim.nombre}</CardTitle>
                        <CardDescription>
                          {dim.preguntas.length} preguntas · Peso: {dim.peso}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Orden: {dim.orden}</Badge>
                      {expandedDimension === dim.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedDimension === dim.id && (
                  <CardContent className="space-y-6">
                    {/* Campos de la dimensión */}
                    <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={dim.nombre}
                          onChange={(e) => updateDimension(dim.id, "nombre", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <Input
                          type="color"
                          value={dim.color || "#6366F1"}
                          onChange={(e) => updateDimension(dim.id, "color", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Peso</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={dim.peso}
                          onChange={(e) => updateDimension(dim.id, "peso", parseFloat(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Preguntas */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Preguntas</h4>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Pregunta
                        </Button>
                      </div>

                      {dim.preguntas.map((preg, pregIndex) => (
                        <Card key={preg.id} className="border-l-4 border-l-primary">
                          <CardContent className="pt-4 space-y-4">
                            <div className="flex items-start gap-4">
                              <span className="text-sm font-medium text-muted-foreground mt-2">
                                {pregIndex + 1}.
                              </span>
                              <div className="flex-1 space-y-4">
                                <Textarea
                                  value={preg.texto}
                                  onChange={(e) =>
                                    updatePregunta(dim.id, preg.id, "texto", e.target.value)
                                  }
                                  rows={2}
                                />

                                <div className="flex flex-wrap gap-4 text-sm">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      checked={preg.tipo === "single"}
                                      onChange={() =>
                                        updatePregunta(dim.id, preg.id, "tipo", "single")
                                      }
                                    />
                                    Única respuesta
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      checked={preg.tipo === "multiple"}
                                      onChange={() =>
                                        updatePregunta(dim.id, preg.id, "tipo", "multiple")
                                      }
                                    />
                                    Múltiple respuesta
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={preg.requiereJustificacion}
                                      onChange={(e) =>
                                        updatePregunta(dim.id, preg.id, "requiereJustificacion", e.target.checked)
                                      }
                                    />
                                    Requiere justificación
                                  </label>
                                </div>

                                {/* Opciones */}
                                <div className="space-y-2">
                                  <Label className="text-sm">Opciones de respuesta</Label>
                                  {preg.opciones.map((opc, opcIndex) => (
                                    <div key={opc.id} className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground w-6">
                                        {opcIndex + 1}.
                                      </span>
                                      <Input
                                        value={opc.texto}
                                        onChange={(e) =>
                                          updateOpcion(dim.id, preg.id, opc.id, "texto", e.target.value)
                                        }
                                        className="flex-1"
                                      />
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={opc.puntaje}
                                        onChange={(e) =>
                                          updateOpcion(dim.id, preg.id, opc.id, "puntaje", parseInt(e.target.value))
                                        }
                                        className="w-20"
                                        placeholder="Pts"
                                      />
                                      <Button variant="ghost" size="icon" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Opción
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Dimensión
            </Button>
          </TabsContent>

          {/* Tab Configuración */}
          <TabsContent value="configuracion">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Análisis IA</CardTitle>
                <CardDescription>
                  Ajusta el modelo y prompt del sistema para el análisis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input defaultValue="claude-sonnet-4-20250514" />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperatura</Label>
                    <Input type="number" step="0.1" min="0" max="1" defaultValue="0.7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
                    rows={10}
                    defaultValue="Eres un consultor experto en transformación digital..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
