"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Key, Mail, Database, Bot, CheckCircle, XCircle } from "lucide-react";

export default function ConfiguracionPage() {
  const configItems = [
    {
      title: "Anthropic API",
      description: "API key para análisis con IA",
      icon: Bot,
      status: process.env.ANTHROPIC_API_KEY ? true : false,
      envVar: "ANTHROPIC_API_KEY",
    },
    {
      title: "Base de Datos",
      description: "PostgreSQL en Railway",
      icon: Database,
      status: true,
      envVar: "DATABASE_URL",
    },
    {
      title: "Email (Resend)",
      description: "Para envío de reportes",
      icon: Mail,
      status: false,
      envVar: "RESEND_API_KEY",
    },
    {
      title: "Auth Secret",
      description: "Secret para NextAuth",
      icon: Key,
      status: true,
      envVar: "AUTH_SECRET",
    },
  ];

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
              <h1 className="text-2xl font-bold">Configuración</h1>
              <p className="text-muted-foreground">Variables de entorno y ajustes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variables de Entorno</CardTitle>
              <CardDescription>
                Configura estas variables en Railway para habilitar todas las funciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configItems.map((item) => (
                <div key={item.envVar} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <code className="text-xs bg-muted px-1 rounded">{item.envVar}</code>
                    </div>
                  </div>
                  {item.status ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios Admin</CardTitle>
              <CardDescription>
                Crear nuevos usuarios administradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="nuevo@admin.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input placeholder="Nombre completo" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <Input type="password" placeholder="Mínimo 8 caracteres" />
                </div>
                <Button type="button">Crear Usuario</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Versión:</strong> 1.0.0</p>
              <p><strong>Next.js:</strong> 16.1.6</p>
              <p><strong>Prisma:</strong> 6.19.2</p>
              <p><strong>Ambiente:</strong> {process.env.NODE_ENV}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
