"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  Layers, 
  HelpCircle, 
  Settings, 
  Users,
  BarChart3,
  Plus,
  ArrowRight,
  LogOut,
  User
} from "lucide-react";

interface DashboardStats {
  evaluaciones: number;
  dimensiones: number;
  preguntas: number;
  sesiones: number;
  sesionesCompletadas: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const menuItems = [
    {
      title: "Evaluaciones",
      description: "Gestionar cuestionarios de evaluación",
      icon: ClipboardList,
      href: "/admin/evaluaciones",
      count: stats?.evaluaciones,
      color: "bg-blue-500",
    },
    {
      title: "Dimensiones",
      description: "Configurar dimensiones de madurez",
      icon: Layers,
      href: "/admin/dimensiones",
      count: stats?.dimensiones,
      color: "bg-purple-500",
    },
    {
      title: "Preguntas",
      description: "Editor de preguntas y opciones",
      icon: HelpCircle,
      href: "/admin/preguntas",
      count: stats?.preguntas,
      color: "bg-green-500",
    },
    {
      title: "Sesiones",
      description: "Ver evaluaciones completadas",
      icon: Users,
      href: "/admin/sesiones",
      count: stats?.sesiones,
      color: "bg-orange-500",
    },
    {
      title: "Resultados",
      description: "Análisis y reportes",
      icon: BarChart3,
      href: "/admin/resultados",
      count: stats?.sesionesCompletadas,
      color: "bg-pink-500",
    },
    {
      title: "Configuración",
      description: "API keys, LLM, email",
      icon: Settings,
      href: "/admin/configuracion",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">Sistema de Evaluación de Madurez</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="truncate max-w-[150px] sm:max-w-none">{session?.user?.email}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                  <Link href="/">Ver sitio</Link>
                </Button>
                <Button size="sm" asChild className="text-xs sm:text-sm">
                  <Link href="/admin/evaluaciones/nueva">
                    <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Nueva Evaluación</span>
                    <span className="sm:hidden">Nueva</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            title="Evaluaciones"
            value={stats?.evaluaciones ?? "-"}
            loading={loading}
          />
          <StatCard
            title="Dimensiones"
            value={stats?.dimensiones ?? "-"}
            loading={loading}
          />
          <StatCard
            title="Preguntas"
            value={stats?.preguntas ?? "-"}
            loading={loading}
          />
          <StatCard
            title="Sesiones"
            value={stats?.sesiones ?? "-"}
            subtitle={`${stats?.sesionesCompletadas ?? 0} completadas`}
            loading={loading}
          />
        </div>

        {/* Menu Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className={`p-3 rounded-lg ${item.color} text-white`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center justify-between">
                      {item.title}
                      {item.count !== undefined && (
                        <Badge variant="secondary">{item.count}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/evaluaciones/demo/editar">Editar Evaluación Demo</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/preguntas/nueva">Agregar Pregunta</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/sesiones?estado=completada">Ver Completadas</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/exportar">Exportar Datos</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  loading,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">
          {loading ? "..." : value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
