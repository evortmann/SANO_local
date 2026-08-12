import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Pill, Apple, AlertTriangle, Info, BookOpen, Stethoscope } from "lucide-react";

export default function InteractionDetails({ interaction, onClose, onEdit }) {
  const severityConfig = {
    'Grave': { color: 'bg-red-100 text-red-700 border-red-200', gradient: 'from-red-50 to-red-100' },
    'Moderada': { color: 'bg-orange-100 text-orange-700 border-orange-200', gradient: 'from-orange-50 to-orange-100' },
    'Leve': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', gradient: 'from-yellow-50 to-yellow-100' }
  };

  const config = severityConfig[interaction.severidade] || severityConfig['Leve'];

  return (
    <Card className="mb-8 border-none shadow-xl bg-white">
      <CardHeader className={`border-b border-slate-100 bg-gradient-to-r ${config.gradient}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl ${config.color} border-2 flex items-center justify-center shadow-lg`}>
              <Pill className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">{interaction.nome_medicamento}</CardTitle>
              {interaction.classe_terapeutica && (
                <p className="text-slate-600 mt-1">{interaction.classe_terapeutica}</p>
              )}
              <Badge className={config.color + ' border mt-2'}>
                Severidade: {interaction.severidade}
              </Badge>
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
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Apple className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Nutriente Afetado</h3>
              </div>
              <p className="text-green-800 font-medium">{interaction.nutriente_afetado}</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">Tipo de Interação</h3>
              </div>
              <p className="text-orange-800 font-medium">{interaction.tipo_interacao}</p>
            </div>

            {interaction.mecanismo && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Mecanismo de Ação</h3>
                </div>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{interaction.mecanismo}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Orientação Nutricional</h3>
              </div>
              <p className="text-sm text-purple-800 whitespace-pre-wrap leading-relaxed">
                {interaction.orientacao_nutricional}
              </p>
            </div>

            {interaction.observacoes_clinicas && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Observações Clínicas</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{interaction.observacoes_clinicas}</p>
              </div>
            )}
          </div>
        </div>

        {interaction.referencias_bibliograficas && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Referências Bibliográficas</h3>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {interaction.referencias_bibliograficas}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}