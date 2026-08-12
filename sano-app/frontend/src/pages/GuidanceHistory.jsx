import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Eye, FileText, Search, User, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import GeneratedGuidanceView from "../components/guidance/GeneratedGuidanceView";

const formatDate = (date) => {
  if (!date) return "Não informada";

  try {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return date;
  }
};

export default function GuidanceHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuidance, setSelectedGuidance] = useState(null);

  const { data: guidances = [], isLoading } = useQuery({
    queryKey: ["guidances"],
    queryFn: () => base44.entities.NutritionalGuidance.list("-created_date"),
    initialData: [],
  });

  const filteredGuidances = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return guidances;

    return guidances.filter((guidance) =>
      guidance.nome_paciente?.toLowerCase().includes(term) ||
      guidance.medicamentos_analisados?.some((medicamento) => medicamento.toLowerCase().includes(term))
    );
  }, [guidances, searchTerm]);

  if (selectedGuidance) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <Button
            onClick={() => setSelectedGuidance(null)}
            variant="outline"
            className="mb-6"
          >
            <X className="mr-2 h-4 w-4" />
            Voltar ao histórico
          </Button>
          <GeneratedGuidanceView
            guidance={selectedGuidance}
            readOnly
            onCancel={() => setSelectedGuidance(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Orientações Salvas</h1>
          <p className="text-slate-600">
            Consulte as orientações nutricionais geradas e guardadas para cada paciente.
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por paciente ou medicamento analisado..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="bg-white py-6 pl-10 shadow-sm"
            />
          </div>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Carregando orientações salvas...
          </div>
        )}

        {!isLoading && filteredGuidances.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-3">
            {filteredGuidances.map((guidance) => {
              const interactions = guidance.interacoes_identificadas || [];
              const criticalCount = interactions.filter(
                (interaction) => interaction.severidade === "Grave" || interaction.severidade === "Moderada"
              ).length;

              return (
                <Card
                  key={guidance.id}
                  className="w-full border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-purple-200 hover:shadow-md"
                >
                  <CardContent className="p-4 md:p-5">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(230px,1.2fr)_minmax(360px,2fr)_auto] lg:items-center">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-bold text-slate-900 md:text-lg">
                            {guidance.nome_paciente || "Paciente não identificado"}
                          </h2>
                          <p className="mt-0.5 text-sm text-slate-500">
                            Gerada em {formatDate(guidance.data_geracao || guidance.created_date)}
                          </p>
                        </div>
                      </div>

                      <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <User className="h-4 w-4 shrink-0 text-purple-600" />
                          <span className="truncate" title={(guidance.medicamentos_analisados || []).join(", ") || "Nenhum medicamento"}>
                            {(guidance.medicamentos_analisados || []).length} medicamento(s) analisado(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-orange-600" />
                          <span>{interactions.length} interação(ões)</span>
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="h-4 w-4 shrink-0 text-purple-600" />
                          <span>Válida até {formatDate(guidance.validade)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {criticalCount > 0 && (
                          <Badge className="border border-red-200 bg-red-100 text-red-700">
                            {criticalCount} crítica(s)
                          </Badge>
                        )}
                        <Button onClick={() => setSelectedGuidance(guidance)} variant="outline" size="sm">
                          <Eye className="mr-1.5 h-4 w-4" />
                          Abrir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filteredGuidances.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-lg">
            <FileText className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              {searchTerm ? "Nenhuma orientação encontrada" : "Nenhuma orientação salva"}
            </h2>
            <p className="text-slate-600">
              {searchTerm
                ? "Tente pesquisar por outro paciente ou medicamento."
                : "As orientações aparecerão aqui após serem salvas no módulo Gerar Orientação."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
