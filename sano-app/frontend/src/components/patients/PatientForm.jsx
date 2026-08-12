import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

export default function PatientForm({ patient, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(patient || {
    nome_completo: "",
    data_nascimento: "",
    sexo: "",
    peso: "",
    altura: "",
    tipo_cancer: "",
    estadiamento: "",
    medicamentos_atuais: [],
    alergias: "",
    observacoes: "",
    status: "Ativo"
  });

  const [medicamentoInput, setMedicamentoInput] = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMedicamento = () => {
    if (medicamentoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        medicamentos_atuais: [...(prev.medicamentos_atuais || []), medicamentoInput.trim()]
      }));
      setMedicamentoInput("");
    }
  };

  const handleRemoveMedicamento = (index) => {
    setFormData(prev => ({
      ...prev,
      medicamentos_atuais: prev.medicamentos_atuais.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      peso: formData.peso ? parseFloat(formData.peso) : undefined,
      altura: formData.altura ? parseFloat(formData.altura) : undefined,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="mb-8 border-none shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-2xl text-slate-900">
          {patient ? 'Editar Paciente' : 'Novo Paciente'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome_completo" className="text-slate-700 font-medium">Nome Completo *</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => handleChange('nome_completo', e.target.value)}
                required
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento" className="text-slate-700 font-medium">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleChange('data_nascimento', e.target.value)}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo" className="text-slate-700 font-medium">Sexo</Label>
              <Select value={formData.sexo} onValueChange={(value) => handleChange('sexo', value)}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_cancer" className="text-slate-700 font-medium">Tipo de Câncer *</Label>
              <Input
                id="tipo_cancer"
                value={formData.tipo_cancer}
                onChange={(e) => handleChange('tipo_cancer', e.target.value)}
                required
                placeholder="Ex: Mama, Pulmão, Cólon"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso" className="text-slate-700 font-medium">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                value={formData.peso}
                onChange={(e) => handleChange('peso', e.target.value)}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altura" className="text-slate-700 font-medium">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                value={formData.altura}
                onChange={(e) => handleChange('altura', e.target.value)}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadiamento" className="text-slate-700 font-medium">Estadiamento</Label>
              <Input
                id="estadiamento"
                value={formData.estadiamento}
                onChange={(e) => handleChange('estadiamento', e.target.value)}
                placeholder="Ex: Estágio II, T2N1M0"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700 font-medium">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Medicamentos Atuais</Label>
            <div className="flex gap-2">
              <Input
                value={medicamentoInput}
                onChange={(e) => setMedicamentoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedicamento())}
                placeholder="Digite o nome do medicamento"
                className="border-slate-200"
              />
              <Button type="button" onClick={handleAddMedicamento} variant="outline">
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.medicamentos_atuais?.map((med, index) => (
                <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                  {med}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicamento(index)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alergias" className="text-slate-700 font-medium">Alergias</Label>
            <Textarea
              id="alergias"
              value={formData.alergias}
              onChange={(e) => handleChange('alergias', e.target.value)}
              placeholder="Descreva alergias alimentares ou medicamentosas"
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-slate-700 font-medium">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações clínicas adicionais"
              className="border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}