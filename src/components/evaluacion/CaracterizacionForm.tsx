"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CampoCaracterizacion, RespuestaCaracterizacion } from "@/types/evaluacion";

interface CaracterizacionFormProps {
  campos: CampoCaracterizacion[];
  empresa: { nombre: string; email: string; telefono: string };
  caracterizacion: RespuestaCaracterizacion[];
  onEmpresaChange: (empresa: { nombre: string; email: string; telefono: string }) => void;
  onCaracterizacionChange: (campoId: string, valor: string | string[] | number) => void;
}

export function CaracterizacionForm({
  campos,
  empresa,
  caracterizacion,
  onEmpresaChange,
  onCaracterizacionChange,
}: CaracterizacionFormProps) {
  const getValor = (campoId: string) => {
    return caracterizacion.find((c) => c.campoId === campoId)?.valor ?? "";
  };

  return (
    <div className="space-y-6">
      {/* Datos de la empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Empresa</CardTitle>
          <CardDescription>
            Esta información nos ayudará a personalizar tu reporte
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Empresa *</Label>
            <Input
              id="nombre"
              placeholder="Acme Corp"
              value={empresa.nombre}
              onChange={(e) => onEmpresaChange({ ...empresa, nombre: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Corporativo *</Label>
            <Input
              id="email"
              type="email"
              placeholder="contacto@empresa.com"
              value={empresa.email}
              onChange={(e) => onEmpresaChange({ ...empresa, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+57 300 123 4567"
              value={empresa.telefono}
              onChange={(e) => onEmpresaChange({ ...empresa, telefono: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Campos de caracterización */}
      <Card>
        <CardHeader>
          <CardTitle>Caracterización</CardTitle>
          <CardDescription>
            Cuéntanos más sobre tu empresa para contextualizar el análisis
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {campos.map((campo) => (
            <div key={campo.id} className="space-y-2">
              <Label htmlFor={campo.id}>
                {campo.label} {campo.requerido && "*"}
              </Label>
              
              {campo.tipo === "text" && (
                <Input
                  id={campo.id}
                  placeholder={campo.placeholder}
                  value={getValor(campo.id) as string}
                  onChange={(e) => onCaracterizacionChange(campo.id, e.target.value)}
                  required={campo.requerido}
                />
              )}

              {campo.tipo === "number" && (
                <Input
                  id={campo.id}
                  type="number"
                  placeholder={campo.placeholder}
                  value={getValor(campo.id) as number}
                  onChange={(e) => onCaracterizacionChange(campo.id, Number(e.target.value))}
                  min={campo.validacion?.min}
                  max={campo.validacion?.max}
                  required={campo.requerido}
                />
              )}

              {campo.tipo === "select" && campo.opciones && (
                <Select
                  value={getValor(campo.id) as string}
                  onValueChange={(value) => onCaracterizacionChange(campo.id, value)}
                >
                  <SelectTrigger id={campo.id}>
                    <SelectValue placeholder={campo.placeholder ?? "Selecciona una opción"} />
                  </SelectTrigger>
                  <SelectContent>
                    {campo.opciones.map((opcion) => (
                      <SelectItem key={opcion} value={opcion}>
                        {opcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {campo.tipo === "multiselect" && campo.opciones && (
                <div className="flex flex-wrap gap-2">
                  {campo.opciones.map((opcion) => {
                    const valores = (getValor(campo.id) as string[]) || [];
                    const selected = valores.includes(opcion);
                    return (
                      <button
                        key={opcion}
                        type="button"
                        onClick={() => {
                          const newValores = selected
                            ? valores.filter((v) => v !== opcion)
                            : [...valores, opcion];
                          onCaracterizacionChange(campo.id, newValores);
                        }}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted border-input"
                        }`}
                      >
                        {opcion}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
