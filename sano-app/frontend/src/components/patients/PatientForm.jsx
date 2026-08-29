import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

const normalizeMedication = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const COMORBIDITY_OPTIONS = [
  "HAS",
  "DM",
  "Ansiedade",
  "Dislipidemia",
  "Arritmia",
  "DPOC",
  "Asma",
  "Hipotireoidismo",
  "Depressão",
  "Doença hepática",
  "Hepatite",
  "Doença coronariana",
  "Insuficiência cardíaca",
  "Fibromialgia e/ou dor crônica",
  "Doença neurológica degenerativa",
  "Refluxo",
];

const COMMON_MEDICATION_NAMES = {
  setralina: "Sertralina",
  sertraline: "Sertralina",
  varfarina: "Varfarina",
  warfarina: "Varfarina",
  warfarin: "Varfarina",
  metotrexato: "Metotrexato",
  methotrexate: "Metotrexato",
  tamoxifeno: "Tamoxifeno",
  tamoxifen: "Tamoxifeno",
  ciclofosfamida: "Ciclofosfamida",
  cyclophosphamide: "Ciclofosfamida",
  doxorrubicina: "Doxorrubicina",
  doxorubicin: "Doxorrubicina",
};

const levenshteinDistance = (first, second) => {
  const matrix = Array.from({ length: second.length + 1 }, (_, row) => [row]);

  for (let column = 0; column <= first.length; column++) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= second.length; row++) {
    for (let column = 1; column <= first.length; column++) {
      matrix[row][column] = second[row - 1] === first[column - 1]
        ? matrix[row - 1][column - 1]
        : Math.min(
            matrix[row - 1][column - 1] + 1,
            matrix[row][column - 1] + 1,
            matrix[row - 1][column] + 1
          );
    }
  }

  return matrix[second.length][first.length];
};

export default function PatientForm({ patient, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(patient || {
    nome_completo: "",
    telefone: "",
    data_nascimento: "",
    comorbidades: [],
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
  const [comorbidadeInput, setComorbidadeInput] = useState("");

  const { data: interactions = [] } = useQuery({
    queryKey: ["interaction-medication-options"],
    queryFn: () => base44.entities.DrugNutrientInteraction.list(),
    initialData: [],
  });

  const medicationOptions = useMemo(() => {
    return [...new Set([
      ...interactions
        .map((interaction) => interaction.nome_medicamento?.trim())
        .filter(Boolean),
      ...Object.values(COMMON_MEDICATION_NAMES),
    ])].sort((first, second) => first.localeCompare(second, "pt-BR"));
  }, [interactions]);

  const medicationSuggestions = useMemo(() => {
    const query = normalizeMedication(medicamentoInput);
    if (!query) return [];

    return medicationOptions
      .map((name) => ({
        name,
        normalized: normalizeMedication(name),
      }))
      .filter(({ normalized }) => {
        const isTextMatch = normalized.includes(query) || query.includes(normalized);
        const maxDistance = query.length >= 7 ? 2 : 1;
        return isTextMatch || levenshteinDistance(query, normalized) <= maxDistance;
      })
      .sort((first, second) => {
        const firstStarts = first.normalized.startsWith(query) ? 0 : 1;
        const secondStarts = second.normalized.startsWith(query) ? 0 : 1;
        return firstStarts - secondStarts || first.name.localeCompare(second.name, "pt-BR");
      })
      .slice(0, 8)
      .map(({ name }) => name);
  }, [medicamentoInput, medicationOptions]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const findCanonicalMedication = (value) => {
    const normalizedValue = normalizeMedication(value);
    if (!normalizedValue) return value.trim();

    const exactMatch = medicationOptions.find(
      (option) => normalizeMedication(option) === normalizedValue
    );
    if (exactMatch) return exactMatch;

    const commonMedicationMatch = COMMON_MEDICATION_NAMES[normalizedValue];
    if (commonMedicationMatch) return commonMedicationMatch;

    const closeMatch = medicationOptions.find((option) => {
      const normalizedOption = normalizeMedication(option);
      const maxDistance = normalizedValue.length >= 7 ? 2 : 1;
      return normalizedOption.includes(normalizedValue) ||
        normalizedValue.includes(normalizedOption) ||
        levenshteinDistance(normalizedValue, normalizedOption) <= maxDistance;
    });

    return closeMatch || value.trim();
  };

  const handleMedicationBlur = () => {
    if (medicamentoInput.trim()) {
      setMedicamentoInput(findCanonicalMedication(medicamentoInput));
    }
  };

  const handleAddMedicamento = (selectedMedication = null) => {
    const typedMedication = selectedMedication || medicamentoInput;
    const medication = findCanonicalMedication(typedMedication);
    if (!medication) return;

    const alreadyAdded = (formData.medicamentos_atuais || []).some(
      (currentMedication) => normalizeMedication(currentMedication) === normalizeMedication(medication)
    );

    if (!alreadyAdded) {
      setFormData(prev => ({
        ...prev,
        medicamentos_atuais: [...(prev.medicamentos_atuais || []), medication]
      }));
    }

    setMedicamentoInput("");
  };

  const handleRemoveMedicamento = (index) => {
    setFormData(prev => ({
      ...prev,
      medicamentos_atuais: prev.medicamentos_atuais.filter((_, i) => i !== index)
    }));
  };

  const handleAddComorbidade = () => {
    if (!comorbidadeInput || formData.comorbidades?.includes(comorbidadeInput)) return;
    setFormData(prev => ({
      ...prev,
      comorbidades: [...(prev.comorbidades || []), comorbidadeInput],
    }));
    setComorbidadeInput("");
  };

  const handleRemoveComorbidade = (index) => {
    setFormData(prev => ({
      ...prev,
      comorbidades: prev.comorbidades.filter((_, i) => i !== index),
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
    <Card className="mb-8 border-none bg-white shadow-xl">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-2xl text-slate-900">
          {patient ? 'Editar Paciente' : 'Novo Paciente'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome_completo" className="font-medium text-slate-700">Nome Completo *</Label>
              <Input id="nome_completo" value={formData.nome_completo} onChange={(e) => handleChange('nome_completo', e.target.value)} required className="border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone" className="font-medium text-slate-700">Telefone / WhatsApp</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone || ""}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="Ex: +55 11 99999-9999"
                className="border-slate-200"
              />
              <p className="text-xs text-slate-500">Informe o código do país e o DDD para abrir o WhatsApp corretamente.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento" className="font-medium text-slate-700">Data de Nascimento</Label>
              <Input id="data_nascimento" type="date" value={formData.data_nascimento} onChange={(e) => handleChange('data_nascimento', e.target.value)} className="border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo" className="font-medium text-slate-700">Sexo</Label>
              <Select value={formData.sexo} onValueChange={(value) => handleChange('sexo', value)}>
                <SelectTrigger className="border-slate-200"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_cancer" className="font-medium text-slate-700">Tipo de Câncer *</Label>
              <Input id="tipo_cancer" value={formData.tipo_cancer} onChange={(e) => handleChange('tipo_cancer', e.target.value)} required placeholder="Ex: Mama, Pulmão, Cólon" className="border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso" className="font-medium text-slate-700">Peso (kg)</Label>
              <Input id="peso" type="number" step="0.1" value={formData.peso} onChange={(e) => handleChange('peso', e.target.value)} className="border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altura" className="font-medium text-slate-700">Altura (cm)</Label>
              <Input id="altura" type="number" value={formData.altura} onChange={(e) => handleChange('altura', e.target.value)} className="border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadiamento" className="font-medium text-slate-700">Estadiamento</Label>
              <Input id="estadiamento" value={formData.estadiamento} onChange={(e) => handleChange('estadiamento', e.target.value)} placeholder="Ex: Estágio II, T2N1M0" className="border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="font-medium text-slate-700">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-slate-700">Comorbidades</Label>
            <div className="flex gap-2">
              <Select value={comorbidadeInput} onValueChange={setComorbidadeInput}>
                <SelectTrigger className="flex-1 border-slate-200">
                  <SelectValue placeholder="Selecione uma comorbidade" />
                </SelectTrigger>
                <SelectContent>
                  {COMORBIDITY_OPTIONS.filter((option) => !formData.comorbidades?.includes(option)).map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddComorbidade} variant="outline" disabled={!comorbidadeInput}>
                Adicionar
              </Button>
            </div>
            <p className="text-xs text-slate-500">Selecione todas as comorbidades aplicáveis ao paciente.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.comorbidades?.map((comorbidade, index) => (
                <div key={comorbidade} className="flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-sm text-teal-700">
                  {comorbidade}
                  <button type="button" onClick={() => handleRemoveComorbidade(index)} className="hover:text-teal-900" aria-label={`Remover ${comorbidade}`}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-slate-700">Medicamentos Atuais</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={medicamentoInput}
                  onChange={(e) => setMedicamentoInput(e.target.value)}
                  onBlur={handleMedicationBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMedicamento(medicationSuggestions[0] || null);
                    }
                  }}
                  placeholder="Digite o nome do medicamento"
                  className="border-slate-200"
                  autoComplete="off"
                />
                {medicationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    {medicationSuggestions.map((medication) => (
                      <button
                        key={medication}
                        type="button"
                        onClick={() => handleAddMedicamento(medication)}
                        className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
                      >
                        {medication}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="button" onClick={() => handleAddMedicamento()} variant="outline">
                Adicionar
              </Button>
            </div>
            <p className="text-xs text-slate-500">As sugestões usam os nomes padronizados da Base de Interações.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.medicamentos_atuais?.map((med, index) => (
                <div key={index} className="flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-sm text-teal-700">
                  {med}
                  <button type="button" onClick={() => handleRemoveMedicamento(index)} className="hover:text-teal-900" aria-label={`Remover ${med}`}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alergias" className="font-medium text-slate-700">Alergias</Label>
            <Textarea id="alergias" value={formData.alergias} onChange={(e) => handleChange('alergias', e.target.value)} placeholder="Descreva alergias alimentares ou medicamentosas" className="border-slate-200" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="font-medium text-slate-700">Observações</Label>
            <Textarea id="observacoes" value={formData.observacoes} onChange={(e) => handleChange('observacoes', e.target.value)} placeholder="Observações clínicas adicionais" className="border-slate-200" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
