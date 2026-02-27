"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { Pregunta, RespuestaPregunta } from "@/types/evaluacion";

interface PreguntaFormProps {
  pregunta: Pregunta;
  numero: number;
  respuesta?: RespuestaPregunta;
  onChange: (respuesta: RespuestaPregunta) => void;
}

export function PreguntaForm({
  pregunta,
  numero,
  respuesta,
  onChange,
}: PreguntaFormProps) {
  const opcionesSeleccionadas = respuesta?.opcionesSeleccionadas ?? [];
  const justificacion = respuesta?.justificacion ?? "";

  const handleOpcionChange = (opcionId: string, checked: boolean) => {
    let nuevasOpciones: string[];

    if (pregunta.tipo === "single") {
      nuevasOpciones = [opcionId];
    } else {
      if (checked) {
        nuevasOpciones = [...opcionesSeleccionadas, opcionId];
      } else {
        nuevasOpciones = opcionesSeleccionadas.filter((id) => id !== opcionId);
      }
    }

    onChange({
      preguntaId: pregunta.id,
      opcionesSeleccionadas: nuevasOpciones,
      justificacion: justificacion || undefined,
    });
  };

  const handleJustificacionChange = (value: string) => {
    onChange({
      preguntaId: pregunta.id,
      opcionesSeleccionadas,
      justificacion: value || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Texto de la pregunta */}
      <div className="space-y-1">
        <Label className="text-base font-medium">
          {numero}. {pregunta.texto}
          {pregunta.requiereJustificacion && pregunta.justificacionObligatoria && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
        {pregunta.tipo === "multiple" && (
          <p className="text-sm text-muted-foreground">
            Puedes seleccionar múltiples opciones
          </p>
        )}
      </div>

      {/* Opciones de respuesta */}
      {pregunta.tipo === "single" ? (
        <RadioGroup
          value={opcionesSeleccionadas[0] ?? ""}
          onValueChange={(value) => handleOpcionChange(value, true)}
          className="space-y-2"
        >
          {pregunta.opciones.map((opcion) => (
            <div key={opcion.id} className="flex items-center space-x-3">
              <RadioGroupItem value={opcion.id} id={opcion.id} />
              <Label
                htmlFor={opcion.id}
                className="font-normal cursor-pointer flex-1"
              >
                {opcion.texto}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="space-y-2">
          {pregunta.opciones.map((opcion) => (
            <div key={opcion.id} className="flex items-center space-x-3">
              <Checkbox
                id={opcion.id}
                checked={opcionesSeleccionadas.includes(opcion.id)}
                onCheckedChange={(checked) =>
                  handleOpcionChange(opcion.id, checked as boolean)
                }
              />
              <Label
                htmlFor={opcion.id}
                className="font-normal cursor-pointer flex-1"
              >
                {opcion.texto}
              </Label>
            </div>
          ))}
        </div>
      )}

      {/* Campo de justificación */}
      {pregunta.requiereJustificacion && (
        <div className="space-y-2 pt-2">
          <Label htmlFor={`justificacion-${pregunta.id}`} className="text-sm">
            {pregunta.justificacionObligatoria
              ? "Justifica tu respuesta *"
              : "Justifica tu respuesta (opcional)"}
          </Label>
          <Textarea
            id={`justificacion-${pregunta.id}`}
            placeholder={
              pregunta.justificacionPlaceholder ??
              "Describe brevemente tu situación actual..."
            }
            value={justificacion}
            onChange={(e) => handleJustificacionChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
      )}
    </div>
  );
}
