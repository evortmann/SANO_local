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
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {patient.nome_completo?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{patient.nome_completo}</h3>
              {age && (
                <p className="text-sm text-slate-500">{age} anos {patient.sexo && `• ${patient.sexo}`}</p>
              )}
            </div>
          </div>
          <Badge 
            variant={patient.status === 'Ativo' ? 'default' : 'secondary'}
            className={patient.status === 'Ativo' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          >
            {patient.status}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-slate-600">Câncer de <span className="font-semibold text-slate-900">{patient.tipo_cancer}</span></span>
          </div>

          {patient.estadiamento && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">Estadiamento: <span className="font-semibold text-slate-900">{patient.estadiamento}</span></span>
            </div>
          )}

          {imc && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">IMC: <span className="font-semibold text-slate-900">{imc}</span></span>
            </div>
          )}

          {patient.medicamentos_atuais?.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Pill className="w-4 h-4 text-blue-600 mt-0.5" />
              <span className="text-slate-600">{patient.medicamentos_atuais.length} medicamento(s)</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Button onClick={onView} variant="outline" className="flex-1" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}