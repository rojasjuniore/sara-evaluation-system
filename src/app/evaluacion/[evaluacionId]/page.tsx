import { CuestionarioWizard } from "@/components/evaluacion";

interface EvaluacionPageProps {
  params: Promise<{ evaluacionId: string }>;
}

export default async function EvaluacionPage({ params }: EvaluacionPageProps) {
  const { evaluacionId } = await params;

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <CuestionarioWizard evaluacionId={evaluacionId} />
    </main>
  );
}

export async function generateMetadata({ params }: EvaluacionPageProps) {
  const { evaluacionId } = await params;
  
  return {
    title: "Evaluación de Madurez | SARA",
    description: "Completa tu evaluación de madurez empresarial",
  };
}
