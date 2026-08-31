import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Apple, AlertTriangle, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const severityConfig = {
  Grave: { color: "bg-red-100 text-red-700 border-red-200", icon: "text-red-600" },
  Moderada: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: "text-orange-600" },
  Leve: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "text-yellow-600" },
};

const severityRank = { Grave: 0, Moderada: 1, Leve: 2 };

export default function InteractionGroupCard({ group, onEdit, onDelete, isDeleting = false, showActions = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const highestSeverity = [...group.interactions].sort(
    (first, second) => (severityRank[first.severidade] ?? 3) - (severityRank[second.severidade] ?? 3)
  )[0]?.severidade;
  const config = severityConfig[highestSeverity] || severityConfig.Leve;
  const classes = [...new Set(group.interactions.map((item) => item.classe_terapeutica).filter(Boolean))];

  return (
    <Card className="w-full border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center gap-4 p-4 text-left md:p-5"
          aria-expanded={isOpen}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50">
            <Pill className={`h-6 w-6 ${config.icon}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 md:text-xl">{group.nome_medicamento}</h3>
              <Badge className="border-blue-200 bg-blue-100 text-blue-700">
                {group.interactions.length} {group.interactions.length === 1 ? "interação" : "interações"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {classes.length ? classes.join(" · ") : "Classe terapêutica não informada"}
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Badge className={`${config.color} border`}>
              {highestSeverity || "Não classificada"}
            </Badge>
          </div>
          {isOpen ? <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" /> : <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />}
        </button>

        {isOpen && (
          <div className="border-t border-slate-100 bg-slate-50/60 p-4 md:p-5">
            <div className="space-y-3">
              {group.interactions.map((interaction) => {
                const itemConfig = severityConfig[interaction.severidade] || severityConfig.Leve;
                return (
                  <div key={interaction.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 text-sm md:grid-cols-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <Apple className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Nutriente afetado</p>
                            <p className="font-medium text-slate-800">{interaction.nutriente_afetado || "Não informado"}</p>
                          </div>
                        </div>
                        <div className="flex min-w-0 items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Tipo de interação</p>
                            <p className="font-medium text-slate-800">{interaction.tipo_interacao || "Não informado"}</p>
                          </div>
                        </div>
                        {interaction.orientacao_nutricional && (
                          <div className="col-span-full rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                            <span className="font-semibold text-slate-700">Orientação: </span>
                            {interaction.orientacao_nutricional}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Badge className={`${itemConfig.color} border`}>{interaction.severidade || "Não classificada"}</Badge>
                        {showActions && (
                          <>
                            <Button onClick={() => onEdit(interaction)} variant="outline" size="sm" aria-label={`Editar interação de ${group.nome_medicamento}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => onDelete(interaction)}
                              variant="outline"
                              size="sm"
                              disabled={isDeleting}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Excluir
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { severityRank };
