import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Brain, FileText, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          Sistema de Evaluación de Madurez
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Evalúa y mejora la madurez
          <br />
          <span className="text-primary">de tu organización</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 px-4">
          Diagnóstico inteligente con recomendaciones personalizadas generadas por IA.
          Compara tu empresa contra el benchmark del sector.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/evaluacion/demo">
              Iniciar Evaluación <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Ver Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Evaluación Multidimensional"
            description="Analiza tecnología, cultura, procesos y más con preguntas dinámicas"
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="Análisis con IA"
            description="Recomendaciones personalizadas generadas por Claude de Anthropic"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Evolución Temporal"
            description="Compara múltiples evaluaciones y mide tu progreso en el tiempo"
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8" />}
            title="Reportes Automáticos"
            description="PDF profesional enviado automáticamente a tu correo"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
          <CardContent className="py-8 sm:py-12 text-center px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
              ¿Listo para conocer tu nivel de madurez?
            </h2>
            <p className="text-sm sm:text-base md:text-lg opacity-90 mb-6 sm:mb-8">
              Completa la evaluación en menos de 15 minutos y recibe tu diagnóstico personalizado
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/evaluacion/demo">
                Comenzar Ahora <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">© 2024 SARA - Sistema de Evaluación de Madurez</p>
            <div className="flex gap-6 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                Panel Admin
              </Link>
              <Link href="/evaluacion/demo" className="text-muted-foreground hover:text-primary transition-colors">
                Evaluación Demo
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 text-primary">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
