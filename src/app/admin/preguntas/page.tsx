"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit } from "lucide-react";

interface Pregunta {
  id: string;
  texto: string;
  tipo: string;
  requiereJustificacion: boolean;
  orden: number;
  dimension: { 
    nombre: string;
    color: string | null;
    evaluacion: { id: string };
  };
  _count: { opciones: number };
}

export default function PreguntasPage() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/preguntas")
      .then((res) => res.json())
      .then((data) => {
        setPreguntas(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Preguntas</h1>
              <p className="text-muted-foreground">Todas las preguntas del sistema</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Cargando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimensión</TableHead>
                    <TableHead>Pregunta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Opciones</TableHead>
                    <TableHead>Justificación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preguntas.map((preg) => (
                    <TableRow key={preg.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preg.dimension.color || "#6366F1" }}
                          />
                          <span className="text-sm">{preg.dimension.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">{preg.texto}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={preg.tipo === "single" ? "default" : "secondary"}>
                          {preg.tipo === "single" ? "Única" : "Múltiple"}
                        </Badge>
                      </TableCell>
                      <TableCell>{preg._count.opciones}</TableCell>
                      <TableCell>
                        {preg.requiereJustificacion ? "Sí" : "No"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/evaluaciones/${preg.dimension.evaluacion.id}/editar`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
