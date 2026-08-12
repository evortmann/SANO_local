import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

const TIPOS_INTERACAO = [
  "Reduz absorção",
  "Aumenta toxicidade",
  "Reduz eficácia",
  "Aumenta efeitos colaterais",
  "Depleção nutricional",
  "Contraindicação",
  "Requer ajuste de dose"
];

export default function InteractionForm({ interaction, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(interaction || {
    nome_medicamento: "",
    classe_terapeutica: "",
    nutriente_afetado: "",
    tipo_interacao: "",
    severidade: "",
    mecanismo: "",
    orientacao_nutricional: "",
    referencias_bibliograficas: "",
    observacoes_clinicas: ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="mb-8 border-none shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-2xl text-slate-900">
          {interaction ? 'Editar Interação' : 'Nova Interação Droga-Nutriente'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome_medicamento" className="text-slate-700 font-medium">Nome do Medicamento *</Label>
              <Input
                id="nome_medicamento"
                value={formData.nome_medicamento}
                onChange={(e) => handleChange('nome_medicamento', e.target.value)}
                required
                placeholder="Ex: Metotrexato, Cisplatina"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classe_terapeutica" className="text-slate-700 font-medium">Classe Terapêutica</Label>
              <Input
                id="classe_terapeutica"
                value={formData.classe_terapeutica}
                onChange={(e) => handleChange('classe_terapeutica', e.target.value)}
                placeholder="Ex: Antimetabólito, Agente alquilante"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nutriente_afetado" className="text-slate-700 font-medium">Nutriente ou Alimento Afetado *</Label>
              <Input
                id="nutriente_afetado"
                value={formData.nutriente_afetado}
                onChange={(e) => handleChange('nutriente_afetado', e.target.value)}
                required
                placeholder="Ex: Ácido fólico, Vitamina B12, Cálcio"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_interacao" className="text-slate-700 font-medium">Tipo de Interação *</Label>
              <Select value={formData.tipo_interacao} onValueChange={(value) => handleChange('tipo_interacao', value)}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_INTERACAO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severidade" className="text-slate-700 font-medium">Severidade *</Label>
              <Select value={formData.severidade} onValueChange={(value) => handleChange('severidade', value)}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Leve">Leve</SelectItem>
                  <SelectItem value="Moderada">Moderada</SelectItem>
                  <SelectItem value="Grave">Grave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mecanismo" className="text-slate-700 font-medium">Mecanismo de Ação</Label>
            <Textarea
              id="mecanismo"
              value={formData.mecanismo}
              onChange={(e) => handleChange('mecanismo', e.target.value)}
              placeholder="Descreva o mecanismo da interação"
              rows={3}
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orientacao_nutricional" className="text-slate-700 font-medium">Orientação Nutricional *</Label>
            <Textarea
              id="orientacao_nutricional"
              value={formData.orientacao_nutricional}
              onChange={(e) => handleChange('orientacao_nutricional', e.target.value)}
              required
              placeholder="Descreva as orientações nutricionais recomendadas"
              rows={4}
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencias_bibliograficas" className="text-slate-700 font-medium">Referências Bibliográficas</Label>
            <Textarea
              id="referencias_bibliograficas"
              value={formData.referencias_bibliograficas}
              onChange={(e) => handleChange('referencias_bibliograficas', e.target.value)}
              placeholder="Liste as referências científicas"
              rows={3}
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes_clinicas" className="text-slate-700 font-medium">Observações Clínicas</Label>
            <Textarea
              id="observacoes_clinicas"
              value={formData.observacoes_clinicas}
              onChange={(e) => handleChange('observacoes_clinicas', e.target.value)}
              placeholder="Observações clínicas relevantes"
              rows={3}
              className="border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}