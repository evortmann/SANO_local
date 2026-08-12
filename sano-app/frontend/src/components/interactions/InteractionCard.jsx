import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Apple, AlertTriangle, Edit, Eye, Trash2 } from "lucide-react";

export default function InteractionCard({ interaction, onView, onEdit, onDelete, isDeleting = false }) {
  const severityConfig = {
    Grave: { color: "bg-red-100 text-red-700 border-red-200", icon: "text-red-600" },
    Moderada: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: "text-orange-600" },
    Leve: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "text-yellow-600" },
  };

  const config = severityConfig[interaction.severidade] || severityConfig.Leve;

  return (
    <Card className="w-full border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md">
      <CardContent className="p-4 md:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(240px,1.15fr)_minmax(360px,2.2fr)_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              <Pill className={`h-5 w-5 ${config.icon}`} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-900 md:text-lg">
                {interaction.nome_medicamento}
              </h3>
              <p className="mt-0.5 truncate text-sm text-slate-500">
                {interaction.classe_terapeutica || "Classe terapêutica não informada"}
              </p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <Apple className="h-4 w-4 shrink-0 text-green-600" />
              <span className="truncate" title={interaction.nutriente_afetado || "Nutriente não informado"}>
                {interaction.nutriente_afetado || "Nutriente não informado"}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-orange-600" />
              <span className="truncate" title={interaction.tipo_interacao || "Tipo não informado"}>
                {interaction.tipo_interacao || "Tipo não informado"}
              </span>
            </div>
            {interaction.orientacao_nutricional && (
              <p className="col-span-full line-clamp-1 text-xs text-slate-500">
                {interaction.orientacao_nutricional}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Badge className={`${config.color} border`}>
              {interaction.severidade || "Não classificada"}
            </Badge>
            <Button onClick={onView} variant="outline" size="sm" className="whitespace-nowrap">
              <Eye className="mr-1.5 h-4 w-4" />
              Detalhes
            </Button>
            <Button onClick={onEdit} variant="outline" size="sm" aria-label="Editar interação">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
              disabled={isDeleting}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
