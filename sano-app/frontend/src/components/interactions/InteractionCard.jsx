import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Apple, AlertTriangle, Edit, Eye, Trash2 } from "lucide-react";

export default function InteractionCard({ interaction, onView, onEdit, onDelete, isDeleting = false }) {
  const severityConfig = {
    'Grave': { color: 'bg-red-100 text-red-700 border-red-200', icon: 'text-red-600' },
    'Moderada': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'text-orange-600' },
    'Leve': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: 'text-yellow-600' }
  };

  const config = severityConfig[interaction.severidade] || severityConfig['Leve'];

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden">
      <div className={`h-2 ${config.color.split(' ')[0].replace('100', '500')}`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Pill className={`w-5 h-5 ${config.icon}`} />
              <h3 className="font-bold text-slate-900 text-lg">{interaction.nome_medicamento}</h3>
            </div>
            {interaction.classe_terapeutica && (
              <p className="text-xs text-slate-500 mb-3">{interaction.classe_terapeutica}</p>
            )}
          </div>
          <Badge className={config.color + ' border'}>
            {interaction.severidade}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2">
            <Apple className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Nutriente Afetado</p>
              <p className="text-sm font-semibold text-slate-900">{interaction.nutriente_afetado}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Tipo de Interação</p>
              <p className="text-sm font-semibold text-slate-900">{interaction.tipo_interacao}</p>
            </div>
          </div>

          {interaction.orientacao_nutricional && (
            <div className="p-3 bg-slate-50 rounded-lg mt-3">
              <p className="text-xs text-slate-600 line-clamp-3">{interaction.orientacao_nutricional}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Button onClick={onView} variant="outline" className="flex-1" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          <Button onClick={onEdit} variant="outline" size="sm" aria-label="Editar interação">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            disabled={isDeleting}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}