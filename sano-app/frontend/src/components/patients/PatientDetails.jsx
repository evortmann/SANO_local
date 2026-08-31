import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, User, Calendar, Activity, Pill, Weight, Ruler, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PatientDetails({ patient, onClose, onEdit }) {
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
    <Card className="mb-8 border-none shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-teal-50 to-teal-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {patient.nome_completo?.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">{patient.nome_completo}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {age && <span className="text-slate-600">{age} anos</span>}
                {patient.sexo && <span className="text-slate-400">•</span>}
                {patient.sexo && <span className="text-slate-600">{patient.sexo}</span>}
                <Badge 
                  variant={patient.status === 'Ativo' ? 'default' : 'secondary'}
                  className={patient.status === 'Ativo' ? 'bg-teal-100 text-teal-700 border-teal-200' : 'ml-2'}
                >
                  {patient.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Dados Pessoais
            </h3>

            {patient.data_nascimento && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Data de Nascimento</p>
                  <p className="font-medium text-slate-900">
                    {format(new Date(patient.data_nascimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}

            {patient.peso && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Weight className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Peso</p>
                  <p className="font-medium text-slate-900">{patient.peso} kg</p>
                </div>
              </div>
            )}

            {patient.altura && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Ruler className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Altura</p>
                  <p className="font-medium text-slate-900">{patient.altura} cm</p>
                </div>
              </div>
            )}

            {imc && (
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                <Activity className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-xs text-teal-600 font-medium">IMC (Índice de Massa Corporal)</p>
                  <p className="font-bold text-teal-900">{imc}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Dados Clínicos
            </h3>

            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-xs text-teal-600 font-medium mb-1">Tipo de Câncer</p>
              <p className="font-bold text-teal-900 text-lg">{patient.tipo_cancer}</p>
            </div>

            {patient.estadiamento && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Estadiamento</p>
                <p className="font-medium text-slate-900">{patient.estadiamento}</p>
              </div>
            )}

            {patient.medicamentos_atuais?.length > 0 && (
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <p className="text-sm text-teal-900 font-medium">Medicamentos em Uso</p>
                </div>
                <div className="space-y-2">
                  {patient.medicamentos_atuais.map((med, index) => (
                    <div key={index} className="bg-white px-3 py-2 rounded border border-teal-200">
                      <p className="text-sm font-medium text-slate-900">{med}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {patient.comorbidades?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-900 font-medium">Comorbidades</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient.comorbidades.map((comorbidade, index) => (
                    <Badge key={`${comorbidade}-${index}`} className="bg-white text-amber-900 border border-amber-300">
                      {comorbidade}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.alergias && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-900 font-medium">Alergias</p>
                </div>
                <p className="text-sm text-red-800">{patient.alergias}</p>
              </div>
            )}
          </div>
        </div>

        {patient.observacoes && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">Observações</h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{patient.observacoes}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
          <p>Cadastrado em: {format(new Date(patient.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          {patient.updated_date && patient.updated_date !== patient.created_date && (
            <p>Última atualização: {format(new Date(patient.updated_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}