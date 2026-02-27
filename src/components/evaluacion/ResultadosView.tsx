"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Mail, Share2, Loader2, TrendingUp, Target, Lightbulb } from "lucide-react";
import type { ResultadoEvaluacion, ResultadoDimension } from "@/types/evaluacion";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface ResultadosViewProps {
  sesionId: string;
}

interface ResultadosCompletos extends ResultadoEvaluacion {
  analisisIa?: string;
}

export function ResultadosView({ sesionId }: ResultadosViewProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ResultadosCompletos | null>(null);

  useEffect(() => {
    fetch(`/api/cuestionario/${sesionId}/resultados`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando resultados:", err);
        setLoading(false);
      });
  }, [sesionId]);

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
            No se pudieron cargar los resultados
          </p>
        </CardContent>
      </Card>
    );
  }

  const { resultados, analisisIa } = data;
  const dimensiones = resultados.dimensiones;

  // Datos para gráficos
  const radarData = dimensiones.map((d) => ({
    dimension: d.nombre,
    puntaje: d.puntaje,
    fullMark: 100,
  }));

  const barData = dimensiones.map((d) => ({
    nombre: d.nombre,
    puntaje: d.puntaje,
    color: d.color || "#6366F1",
  }));

  // Determinar color del nivel global
  const getColorNivel = (puntaje: number) => {
    if (puntaje >= 80) return "bg-green-500";
    if (puntaje >= 60) return "bg-blue-500";
    if (puntaje >= 40) return "bg-yellow-500";
    if (puntaje >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header con puntaje global */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <p className="text-lg opacity-90">Tu Nivel de Madurez</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-7xl font-bold">{resultados.puntajeGlobal}</div>
              <div className="text-left">
                <div className="text-2xl font-semibold">/100</div>
                <Badge variant="secondary" className="mt-1">
                  {resultados.nivelGlobal}
                </Badge>
              </div>
            </div>
            <Progress 
              value={resultados.puntajeGlobal} 
              className="h-3 max-w-md mx-auto bg-white/20" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Enviar por Email
        </Button>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Compartir
        </Button>
      </div>

      {/* Tabs de contenido */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="dimensiones">Por Dimensión</TabsTrigger>
          <TabsTrigger value="analisis">Análisis IA</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="resumen" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gráfico Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Visión General</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Puntaje"
                      dataKey="puntaje"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle>Puntaje por Dimensión</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="nombre" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="puntaje" radius={[0, 4, 4, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Highlights */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mayor Fortaleza</p>
                    <p className="font-semibold">
                      {dimensiones.reduce((a, b) => (a.puntaje > b.puntaje ? a : b)).nombre}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mayor Oportunidad</p>
                    <p className="font-semibold">
                      {dimensiones.reduce((a, b) => (a.puntaje < b.puntaje ? a : b)).nombre}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dimensiones Evaluadas</p>
                    <p className="font-semibold">{dimensiones.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Por Dimensión */}
        <TabsContent value="dimensiones" className="mt-6 space-y-4">
          {dimensiones.map((dim) => (
            <DimensionCard key={dim.nombre} dimension={dim} />
          ))}
        </TabsContent>

        {/* Tab: Análisis IA */}
        <TabsContent value="analisis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Análisis Personalizado
              </CardTitle>
              <CardDescription>
                Generado por IA basado en tus respuestas y contexto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analisisIa ? (
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: analisisIa
                      .replace(/\n/g, "<br>")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/## (.*?)(?:<br>|$)/g, "<h2 class='text-lg font-semibold mt-6 mb-2'>$1</h2>")
                      .replace(/### (.*?)(?:<br>|$)/g, "<h3 class='text-base font-medium mt-4 mb-2'>$1</h3>")
                      .replace(/- (.*?)(?:<br>|$)/g, "<li class='ml-4'>$1</li>")
                  }}
                />
              ) : (
                <p className="text-muted-foreground">
                  No se pudo generar el análisis. Por favor contacta a soporte.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DimensionCard({ dimension }: { dimension: ResultadoDimension }) {
  const getColorByPuntaje = (puntaje: number) => {
    if (puntaje >= 80) return "text-green-600 bg-green-50";
    if (puntaje >= 60) return "text-blue-600 bg-blue-50";
    if (puntaje >= 40) return "text-yellow-600 bg-yellow-50";
    if (puntaje >= 20) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {dimension.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: dimension.color }}
                />
              )}
              <h3 className="font-semibold">{dimension.nombre}</h3>
              <Badge variant="outline">{dimension.nivel}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Progress value={dimension.puntaje} className="flex-1 h-2" />
                <span className={`text-sm font-medium px-2 py-1 rounded ${getColorByPuntaje(dimension.puntaje)}`}>
                  {dimension.puntaje}/100
                </span>
              </div>
              
              {dimension.recomendacion && (
                <p className="text-sm text-muted-foreground mt-2">
                  {dimension.recomendacion}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
