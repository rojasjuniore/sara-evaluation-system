"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Eye, Trash2, ArrowLeft } from "lucide-react";

interface Evaluacion {
  id: string;
  nombre: string;
  descripcion: string | null;
  version: string;
  activa: boolean;
  _count: {
    dimensiones: number;
    sesiones: number;
  };
}

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/evaluaciones")
      .then((res) => res.json())
      .then((data) => {
        setEvaluaciones(data);
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Evaluaciones</h1>
              <p className="text-muted-foreground">Gestionar cuestionarios</p>
            </div>
            <Button asChild>
              <Link href="/admin/evaluaciones/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Evaluación
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Cargando...</p>
            ) : evaluaciones.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No hay evaluaciones creadas</p>
                <Button asChild>
                  <Link href="/admin/evaluaciones/nueva">Crear Primera Evaluación</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Versión</TableHead>
                    <TableHead>Dimensiones</TableHead>
                    <TableHead>Sesiones</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluaciones.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ev.nombre}</p>
                          {ev.descripcion && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {ev.descripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{ev.version}</TableCell>
                      <TableCell>{ev._count.dimensiones}</TableCell>
                      <TableCell>{ev._count.sesiones}</TableCell>
                      <TableCell>
                        <Badge variant={ev.activa ? "default" : "secondary"}>
                          {ev.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/evaluacion/${ev.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/evaluaciones/${ev.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
