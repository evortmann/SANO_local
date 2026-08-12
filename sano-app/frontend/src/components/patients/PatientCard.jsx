import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, Activity, Pill, Edit, Eye } from "lucide-react";

export default function PatientCard({ patient, onView, onEdit }) {
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const age = calculateAge(patient.data_nascimento);
  const imc = patient.peso && patient.altura
    ? (patient.peso / Math.pow(patient.altura / 100, 2)).toFixed(1)
    : null;

  return (
    <Card className="w-full border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">
      <CardContent className="p-4 md:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,1.1fr)_minmax(360px,2.2fr)_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-base font-bold text-white shadow-sm">
              {patient.nome_completo?.charAt(0).toUpperCase() || "P"}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-900 md:text-lg">
                {patient.nome_completo}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {age !== null ? `${age} anos` : "Idade não informada"}
                {patient.sexo ? ` • ${patient.sexo}` : ""}
              </p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex min-w-0 items-center gap-1.5">
              <Activity className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="truncate" title={patient.tipo_cancer || "Diagnóstico não informado"}>
                {patient.tipo_cancer || "Diagnóstico não informado"}
              </span>
            </div>

            {patient.estadiamento && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="h-4 w-4 shrink-0 text-blue-600" />
                <span>Estádio {patient.estadiamento}</span>
              </div>
            )}

            {imc && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <User className="h-4 w-4 shrink-0 text-blue-600" />
                <span>IMC {imc}</span>
              </div>
            )}

            {patient.medicamentos_atuais?.length > 0 && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Pill className="h-4 w-4 shrink-0 text-blue-600" />
                <span>{patient.medicamentos_atuais.length} medicamento(s)</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Badge
              variant={patient.status === "Ativo" ? "default" : "secondary"}
              className={patient.status === "Ativo" ? "border border-green-200 bg-green-100 text-green-700" : ""}
            >
              {patient.status || "Sem status"}
            </Badge>
            <Button onClick={onView} variant="outline" size="sm" className="whitespace-nowrap">
              <Eye className="mr-1.5 h-4 w-4" />
              Detalhes
            </Button>
            <Button onClick={onEdit} variant="outline" size="sm" aria-label="Editar paciente">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
