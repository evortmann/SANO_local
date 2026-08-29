import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Loader2, CheckCircle, X, Plus, AlertTriangle } from "lucide-react";

export default function LiteratureSearchModal({ onClose, onImported }) {
  const [drugName, setDrugName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [importing, setImporting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState(null);

  const severityColors = {
    'Grave': 'bg-red-100 text-red-700 border-red-200',
    'Moderada': 'bg-orange-100 text-orange-700 border-orange-200',
    'Leve': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const handleSearch = async () => {
    if (!drugName.trim()) return;
    setIsSearching(true);
    setResults(null);
    setSelectedItems([]);
    setError(null);
    setImportedCount(0);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em farmacologia e nutrição clínica oncológica. Pesquise na literatura científica (PubMed, DrugBank, Micromedex, Lexicomp, artigos clínicos) as interações droga-nutriente conhecidas para o medicamento: "${drugName}".

Retorne SOMENTE interações com evidência científica documentada. Para cada interação inclua:
- nome do medicamento (exatamente como informado)
- classe terapêutica do medicamento
- nutriente ou alimento que interage
- tipo de interação (use EXATAMENTE um dos: "Reduz absorção", "Aumenta toxicidade", "Reduz eficácia", "Aumenta efeitos colaterais", "Depleção nutricional", "Contraindicação", "Requer ajuste de dose")
- severidade (use EXATAMENTE: "Grave", "Moderada" ou "Leve")
- mecanismo de ação detalhado
- orientação nutricional prática para o paciente
- referências bibliográficas (autor, ano, periódico)
- observações clínicas relevantes

Retorne o máximo de interações documentadas que encontrar, sendo rigoroso com a evidência científica.`,
        add_context_from_internet: true,
        model: "gemini_3_1_pro",
        response_json_schema: {
          type: "object",
          properties: {
            interacoes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  nome_medicamento: { type: "string" },
                  classe_terapeutica: { type: "string" },
                  nutriente_afetado: { type: "string" },
                  tipo_interacao: { type: "string" },
                  severidade: { type: "string" },
                  mecanismo: { type: "string" },
                  orientacao_nutricional: { type: "string" },
                  referencias_bibliograficas: { type: "string" },
                  observacoes_clinicas: { type: "string" }
                }
              }
            }
          }
        }
      });

      setResults(result.interacoes || []);
      setSelectedItems((result.interacoes || []).map((_, i) => i));
    } catch (err) {
      setError("Erro ao buscar na literatura. Tente novamente.");
    }

    setIsSearching(false);
  };

  const toggleItem = (index) => {
    setSelectedItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleImport = async () => {
    if (selectedItems.length === 0) return;
    setImporting(true);

    const toImport = selectedItems.map(i => results[i]);
    let count = 0;
    for (const item of toImport) {
      await base44.entities.DrugNutrientInteraction.create(item);
      count++;
    }

    setImportedCount(count);
    setImporting(false);
    onImported();
  };

  return (
    <Card className="border-none shadow-xl mb-6">
      <CardHeader className="border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground font-heading">
            <BookOpen className="w-5 h-5 text-primary" />
            Busca na Literatura
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Busca automática em PubMed, DrugBank, Micromedex e literatura oncológica via IA
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Search input */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Nome do medicamento (ex: Metotrexato, Capecitabina...)"
              value={drugName}
              onChange={e => setDrugName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!drugName.trim() || isSearching}
            className="bg-primary hover:bg-primary/90"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>

        {isSearching && (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Consultando literatura científica...</p>
            <p className="text-sm text-muted-foreground mt-1">PubMed · DrugBank · Micromedex · Lexicomp</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {importedCount > 0 && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">{importedCount} interação(ões) importada(s) com sucesso!</p>
          </div>
        )}

        {results && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Nenhuma interação encontrada para este medicamento.</p>
          </div>
        )}

        {results && results.length > 0 && importedCount === 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{results.length}</span> interações encontradas
                — <span className="font-semibold text-foreground">{selectedItems.length}</span> selecionadas
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedItems(results.map((_, i) => i))}>
                  Selecionar todas
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedItems([])}>
                  Limpar
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {results.map((item, index) => (
                <div
                  key={index}
                  onClick={() => toggleItem(index)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedItems.includes(index)
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-secondary'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">
                        {item.nome_medicamento} + {item.nutriente_afetado}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.tipo_interacao}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={severityColors[item.severidade] || 'bg-muted text-muted-foreground'}>
                        {item.severidade}
                      </Badge>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedItems.includes(index) ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {selectedItems.includes(index) && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                  {item.mecanismo && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.mecanismo}</p>
                  )}
                  {item.referencias_bibliograficas && (
                    <p className="text-xs text-primary mt-1 italic line-clamp-1">📚 {item.referencias_bibliograficas}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button
                onClick={handleImport}
                disabled={selectedItems.length === 0 || importing}
                className="bg-primary hover:bg-primary/90"
              >
                {importing
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Importando...</>
                  : <><Plus className="w-4 h-4 mr-2" />Importar {selectedItems.length} interação(ões)</>
                }
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}