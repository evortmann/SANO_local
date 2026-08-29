import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { patientsApi } from "@/api/patients";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, User, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GeneratedGuidanceView from "../components/guidance/GeneratedGuidanceView";

export default function GenerateGuidance() {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGuidance, setGeneratedGuidance] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsApi.list(),
    initialData: [],
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions'],
    queryFn: () => base44.entities.DrugNutrientInteraction.list(),
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.NutritionalGuidance.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidances'] });
    },
  });

  const selectedPatient = patients.find(p => String(p.id) === String(selectedPatientId));

  const handleGenerate = async () => {
    if (!selectedPatient) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedGuidance(null);

    try {
      const patientMeds = selectedPatient.medicamentos_atuais || [];
      
      if (patientMeds.length === 0) {
        setError("O paciente não possui medicamentos cadastrados.");
        setIsGenerating(false);
        return;
      }

      const identifiedInteractions = [];
      patientMeds.forEach(med => {
        const matchingInteractions = interactions.filter(interaction =>
          interaction.nome_medicamento.toLowerCase().includes(med.toLowerCase()) ||
          med.toLowerCase().includes(interaction.nome_medicamento.toLowerCase())
        );
        identifiedInteractions.push(...matchingInteractions);
      });

      const interactionsData = identifiedInteractions.map(int => ({
        medicamento: int.nome_medicamento,
        nutriente: int.nutriente_afetado,
        severidade: int.severidade,
        tipo: int.tipo_interacao,
        orientacao: int.orientacao_nutricional
      }));

      const prompt = `
Você é um nutricionista especializado em oncologia. Com base nas seguintes informações, gere orientações nutricionais personalizadas e detalhadas:

PACIENTE:
- Nome: ${selectedPatient.nome_completo}
- Tipo de câncer: ${selectedPatient.tipo_cancer}
- Peso: ${selectedPatient.peso || 'não informado'} kg
- Altura: ${selectedPatient.altura || 'não informado'} cm
- Alergias: ${selectedPatient.alergias || 'nenhuma informada'}
- Comorbidades: ${selectedPatient.comorbidades?.length ? selectedPatient.comorbidades.join(', ') : 'nenhuma informada'}

MEDICAMENTOS EM USO:
${patientMeds.join(', ')}

INTERAÇÕES IDENTIFICADAS:
${interactionsData.map((int, i) => `${i + 1}. ${int.medicamento} + ${int.nutriente} (${int.severidade}): ${int.tipo}`).join('\n')}

Por favor, forneça:
1. Orientações gerais de alimentação para este paciente oncológico
2. Lista específica de alimentos a evitar (devido às interações)
3. Lista de alimentos recomendados
4. Suplementação necessária (se houver)
5. Orientações sobre horários de alimentação em relação aos medicamentos
6. Observações especiais considerando o tipo de câncer e tratamento

Seja detalhado, prático e considere a qualidade de vida do paciente.
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            orientacoes_gerais: { type: "string" },
            alimentos_evitar: { type: "array", items: { type: "string" } },
            alimentos_recomendados: { type: "array", items: { type: "string" } },
            suplementacao_necessaria: { type: "array", items: { type: "string" } },
            horarios_alimentacao: { type: "string" },
            observacoes_especiais: { type: "string" }
          }
        }
      });

      const today = new Date();
      const validUntil = new Date(today);
      validUntil.setMonth(validUntil.getMonth() + 3);

      const guidance = {
        patient_id: String(selectedPatient.id),
        nome_paciente: selectedPatient.nome_completo,
        telefone: selectedPatient.telefone || "",
        comorbidades: selectedPatient.comorbidades || [],
        medicamentos_analisados: patientMeds,
        interacoes_identificadas: interactionsData,
        orientacoes_gerais: result.orientacoes_gerais,
        alimentos_evitar: result.alimentos_evitar,
        alimentos_recomendados: result.alimentos_recomendados,
        suplementacao_necessaria: result.suplementacao_necessaria,
        horarios_alimentacao: result.horarios_alimentacao,
        observacoes_especiais: result.observacoes_especiais,
        data_geracao: today.toISOString().split('T')[0],
        validade: validUntil.toISOString().split('T')[0]
      };

      setGeneratedGuidance(guidance);
    } catch (err) {
      setError("Erro ao gerar orientações. Tente novamente.");
      console.error(err);
    }

    setIsGenerating(false);
  };

  const handleSave = async (guidanceToSave) => {
    const data = guidanceToSave || generatedGuidance;
    if (data && data.patient_id) {
      const savedGuidance = await saveMutation.mutateAsync(data);
      
      // Verificar se há interações graves ou moderadas
      const criticalInteractions = data.interacoes_identificadas.filter(
        int => int.severidade === 'Grave' || int.severidade === 'Moderada'
      );

      if (criticalInteractions.length > 0) {
        const severidade = criticalInteractions.some(int => int.severidade === 'Grave') ? 'Grave' : 'Moderada';
        const tipo = severidade === 'Grave' ? 'interacao_grave' : 'interacao_moderada';
        
        // Criar alerta
        await base44.entities.Alert.create({
          tipo: tipo,
          paciente_nome: generatedGuidance.nome_paciente,
          paciente_id: generatedGuidance.patient_id,
          orientacao_id: savedGuidance.id,
          severidade: severidade,
          interacoes_count: criticalInteractions.length,
          mensagem: `Nova orientação gerada para ${data.nome_paciente} com ${criticalInteractions.length} interação(ões) de severidade ${severidade}`,
          lido: false,
          email_enviado: false
        });

        // Tentar enviar e-mail (opcional)
        try {
          const user = await base44.auth.me();
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `⚠️ Alerta: Interações ${severidade} Detectadas`,
            body: `
Olá, ${user.full_name || 'Profissional'},

Um alerta foi gerado no sistema NutriOnco:

📋 Paciente: ${data.nome_paciente}
⚠️ Severidade: ${severidade}
🔢 Interações detectadas: ${criticalInteractions.length}

Detalhes das interações:
${criticalInteractions.map((int, i) => `${i + 1}. ${int.medicamento} + ${int.nutriente} (${int.tipo})`).join('\n')}

Por favor, revise a orientação nutricional gerada no sistema.

---
Sistema NutriOnco - Orientações Nutricionais Oncológicas
            `
          });
          
          // Atualizar que o email foi enviado
          await base44.entities.Alert.update(savedGuidance.id, { email_enviado: true });
        } catch (emailError) {
          console.error('Erro ao enviar e-mail:', emailError);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setGeneratedGuidance(null);
      setSelectedPatientId("");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Gerar Orientação Nutricional</h1>
          <p className="text-slate-600">Sistema automatizado de geração de orientações personalizadas</p>
        </div>

        {!generatedGuidance && (
          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Selecionar Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Escolha o paciente para gerar as orientações:
                  </label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="w-full py-6 text-lg">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.filter(p => p.status === 'Ativo').map((patient) => (
                        <SelectItem key={patient.id} value={String(patient.id)}>
                          <div className="flex items-center gap-3 py-1">
                            <User className="w-4 h-4" />
                            <span>{patient.nome_completo} - {patient.tipo_cancer}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPatient && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">Resumo do Paciente</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-600">Nome:</span>
                        <span className="ml-2 text-blue-900 font-medium">{selectedPatient.nome_completo}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Tipo de câncer:</span>
                        <span className="ml-2 text-blue-900 font-medium">{selectedPatient.tipo_cancer}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Medicamentos:</span>
                        <span className="ml-2 text-blue-900 font-medium">
                          {selectedPatient.medicamentos_atuais?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600">Status:</span>
                        <span className="ml-2 text-blue-900 font-medium">{selectedPatient.status}</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={!selectedPatientId || isGenerating}
                  className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gerando orientações...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Gerar Orientações Automáticas
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {generatedGuidance && (
          <GeneratedGuidanceView
            guidance={generatedGuidance}
            onSave={handleSave}
            onCancel={() => setGeneratedGuidance(null)}
            isSaving={saveMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}