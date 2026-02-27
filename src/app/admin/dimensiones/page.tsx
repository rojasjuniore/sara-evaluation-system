"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit } from "lucide-react";

interface Dimension {
  id: string;
  nombre: string;
  descripcion: string | null;
  peso: number;
  orden: number;
  color: string | null;
  evaluacion: { nombre: string };
  _count: { preguntas: number };
}

export default function DimensionesPage() {
  const [dimensiones, setDimensiones] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dimensiones")
      .then((res) => res.json())
      .then((data) => {
        setDimensiones(data);
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
              <h1 className="text-2xl font-bold">Dimensiones</h1>
              <p className="text-muted-foreground">Todas las dimensiones del sistema</p>
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
                    <TableHead>Color</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Evaluación</TableHead>
                    <TableHead>Preguntas</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dimensiones.map((dim) => (
                    <TableRow key={dim.id}>
                      <TableCell>
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: dim.color || "#6366F1" }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{dim.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dim.evaluacion.nombre}</Badge>
                      </TableCell>
                      <TableCell>{dim._count.preguntas}</TableCell>
                      <TableCell>{dim.peso}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/evaluaciones/${dim.id}/editar`}>
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
