"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye, Download, Mail } from "lucide-react";

interface Sesion {
  id: string;
  estado: string;
  puntajeGlobal: number | null;
  nivelGlobal: string | null;
  empresaNombre: string;
  empresaEmail: string;
  createdAt: string;
  completedAt: string | null;
  evaluacion: {
    nombre: string;
  };
}

export default function SesionesPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sesiones")
      .then((res) => res.json())
      .then((data) => {
        setSesiones(data);
        setLoading(false);
      });
  }, []);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "COMPLETADA":
        return <Badge className="bg-green-500">Completada</Badge>;
      case "EN_PROCESO":
        return <Badge className="bg-blue-500">En Proceso</Badge>;
      case "PROCESANDO":
        return <Badge className="bg-yellow-500">Procesando</Badge>;
      case "ERROR":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
              <h1 className="text-2xl font-bold">Sesiones de Evaluación</h1>
              <p className="text-muted-foreground">
                {sesiones.length} sesiones registradas
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Cargando...</p>
            ) : sesiones.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay sesiones registradas
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Evaluación</TableHead>
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sesiones.map((sesion) => (
                    <TableRow key={sesion.id}>
                      <TableCell className="font-medium">
                        {sesion.empresaNombre}
                      </TableCell>
                      <TableCell>{sesion.empresaEmail}</TableCell>
                      <TableCell>{sesion.evaluacion.nombre}</TableCell>
                      <TableCell>
                        {sesion.puntajeGlobal !== null ? (
                          <span className="font-semibold">{sesion.puntajeGlobal}/100</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {sesion.nivelGlobal ? (
                          <Badge variant="outline">{sesion.nivelGlobal}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{getEstadoBadge(sesion.estado)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(sesion.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/sesiones/${sesion.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
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
