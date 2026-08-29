import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save, X, FileText, AlertTriangle, CheckCircle, Pill, Apple, Clock, Info, Printer, Pencil, Plus, Trash2, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const normalizeWhatsAppPhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
};

const buildWhatsAppMessage = (g) => {
  const lines = [
    `Olá! Segue a orientação nutricional de ${g.nome_paciente}.`,
    "",
    "ORIENTAÇÕES GERAIS",
    g.orientacoes_gerais,
  ];

  if (g.alimentos_evitar?.length) {
    lines.push("", "ALIMENTOS A EVITAR", ...g.alimentos_evitar.map((item) => `• ${item}`));
  }
  if (g.alimentos_recomendados?.length) {
    lines.push("", "ALIMENTOS RECOMENDADOS", ...g.alimentos_recomendados.map((item) => `• ${item}`));
  }
  if (g.suplementacao_necessaria?.length) {
    lines.push("", "SUPLEMENTAÇÃO RECOMENDADA", ...g.suplementacao_necessaria.map((item) => `• ${item}`));
  }
  if (g.horarios_alimentacao) lines.push("", "HORÁRIOS DE ALIMENTAÇÃO", g.horarios_alimentacao);
  if (g.observacoes_especiais) lines.push("", "OBSERVAÇÕES ESPECIAIS", g.observacoes_especiais);

  lines.push("", `Válida até: ${g.validade}`, "", "Esta orientação deve ser avaliada por um profissional nutricionista qualificado.");
  return lines.join("\n");
};

export default function GeneratedGuidanceView({ guidance, onSave, onCancel, isSaving, readOnly = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState(guidance);

  const currentGuidance = isEditing ? edited : guidance;

  const updateField = (field, value) => setEdited(prev => ({ ...prev, [field]: value }));

  const updateListItem = (field, index, value) => {
    const list = [...(edited[field] || [])];
    list[index] = value;
    setEdited(prev => ({ ...prev, [field]: list }));
  };

  const addListItem = (field) => {
    setEdited(prev => ({ ...prev, [field]: [...(prev[field] || []), ""] }));
  };

  const removeListItem = (field, index) => {
    const list = [...(edited[field] || [])];
    list.splice(index, 1);
    setEdited(prev => ({ ...prev, [field]: list }));
  };

  const handleSave = () => onSave(isEditing ? edited : guidance);
  const handleWhatsApp = () => {
    const current = isEditing ? edited : guidance;
    const phone = normalizeWhatsAppPhone(current.telefone);
    if (!phone) {
      window.alert("Este paciente não possui um telefone/WhatsApp cadastrado.");
      return;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(current))}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };
  const handlePrint = () => {
    const g = isEditing ? edited : guidance;
    
    const printContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Orientação Nutricional - ${g.nome_paciente}</title>
    <style>
      @page { margin: 1.5cm; size: A4; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        color: #333;
      }
      .header {
        text-align: center;
        border-bottom: 3px solid #0f766e;
        padding-bottom: 12px;
        margin-bottom: 16px;
      }
      .header h1 { color: #115e59; font-size: 20px; }
      .patient-info {
        background: #f1f5f9;
        padding: 10px 14px;
        border-radius: 6px;
        margin-bottom: 14px;
        border-left: 4px solid #0f766e;
      }
      .patient-info h2 { color: #115e59; font-size: 13px; margin-bottom: 6px; }
      .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; }
      .info-item { font-size: 12px; }
      .info-item strong { color: #475569; }
      .section { margin-bottom: 12px; page-break-inside: avoid; }
      .section-title {
        background: #0f766e;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .section-content { padding: 0 8px; }
      .alert-box {
        background: #fef3c7;
        border: 1.5px solid #f59e0b;
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 12px;
      }
      .alert-box h3 { color: #92400e; margin-bottom: 6px; font-size: 12px; }
      .interaction-item {
        background: white;
        border: 1px solid #e2e8f0;
        padding: 6px 8px;
        margin-bottom: 5px;
        border-radius: 4px;
        border-left: 3px solid #f59e0b;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
      }
      .medication { font-weight: bold; color: #115e59; font-size: 11px; }
      .int-type { font-size: 11px; color: #64748b; }
      .severity {
        padding: 1px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .severity-grave { background: #fee2e2; color: #991b1b; }
      .severity-moderada { background: #fed7aa; color: #9a3412; }
      .severity-leve { background: #fef3c7; color: #92400e; }
      .food-list { columns: 2; column-gap: 16px; }
      .food-item {
        break-inside: avoid;
        padding: 4px 0;
        border-bottom: 1px solid #e2e8f0;
        font-size: 11px;
        padding-left: 12px;
        position: relative;
      }
      .food-item::before { content: "•"; position: absolute; left: 0; font-weight: bold; }
      .avoid-item::before { color: #dc2626; }
      .recommend-item::before { color: #16a34a; }
      .text-content { text-align: justify; line-height: 1.6; font-size: 11px; }
      ul { list-style: none; padding-left: 0; }
      ul li { padding: 3px 0 3px 16px; position: relative; font-size: 11px; }
      ul li::before { content: "→"; position: absolute; left: 0; color: #0f766e; font-weight: bold; }
      .footer {
        margin-top: 16px;
        padding-top: 10px;
        border-top: 1.5px solid #e2e8f0;
        text-align: center;
        font-size: 10px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>🏥 ORIENTAÇÃO NUTRICIONAL ONCOLÓGICA</h1>
    </div>

    <div class="patient-info">
      <h2>📋 Dados do Paciente</h2>
      <div class="info-grid">
        <div class="info-item"><strong>Nome:</strong> ${g.nome_paciente}</div>
        <div class="info-item"><strong>Medicamentos Analisados:</strong> ${g.medicamentos_analisados.length}</div>
        <div class="info-item"><strong>Data de Geração:</strong> ${format(new Date(g.data_geracao), "dd/MM/yyyy", { locale: ptBR })}</div>
        <div class="info-item"><strong>Válido até:</strong> ${format(new Date(g.validade), "dd/MM/yyyy", { locale: ptBR })}</div>
      </div>
    </div>

    ${g.interacoes_identificadas.length > 0 ? `
    <div class="alert-box">
      <h3>⚠️ INTERAÇÕES DROGA-NUTRIENTE IDENTIFICADAS</h3>
      ${g.interacoes_identificadas.map(int => `
        <div class="interaction-item">
          <div>
            <div class="medication">${int.medicamento} + ${int.nutriente}</div>
            <div class="int-type">${int.tipo}</div>
          </div>
          <span class="severity severity-${int.severidade.toLowerCase()}">${int.severidade}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">📝 ORIENTAÇÕES GERAIS</div>
      <div class="section-content">
        <p class="text-content">${g.orientacoes_gerais.replace(/\n/g, '<br>')}</p>
      </div>
    </div>

    ${(g.alimentos_evitar?.length > 0 || g.alimentos_recomendados?.length > 0) ? `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
      ${g.alimentos_evitar?.length > 0 ? `
      <div class="section" style="margin-bottom:0">
        <div class="section-title" style="background:#dc2626;">❌ ALIMENTOS A EVITAR</div>
        <div class="section-content">
          ${g.alimentos_evitar.map(a => `<div class="food-item avoid-item">${a}</div>`).join('')}
        </div>
      </div>` : ''}
      ${g.alimentos_recomendados?.length > 0 ? `
      <div class="section" style="margin-bottom:0">
        <div class="section-title" style="background:#16a34a;">✅ ALIMENTOS RECOMENDADOS</div>
        <div class="section-content">
          ${g.alimentos_recomendados.map(a => `<div class="food-item recommend-item">${a}</div>`).join('')}
        </div>
      </div>` : ''}
    </div>
    ` : ''}

    ${g.suplementacao_necessaria?.length > 0 ? `
    <div class="section">
      <div class="section-title" style="background:#7c3aed;">💊 SUPLEMENTAÇÃO RECOMENDADA</div>
      <div class="section-content">
        <ul>${g.suplementacao_necessaria.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>
    </div>
    ` : ''}

    ${g.horarios_alimentacao ? `
    <div class="section">
      <div class="section-title" style="background:#f59e0b;">⏰ HORÁRIOS DE ALIMENTAÇÃO</div>
      <div class="section-content">
        <p class="text-content">${g.horarios_alimentacao.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
    ` : ''}

    ${g.observacoes_especiais ? `
    <div class="section">
      <div class="section-title" style="background:#64748b;">ℹ️ OBSERVAÇÕES ESPECIAIS</div>
      <div class="section-content">
        <p class="text-content">${g.observacoes_especiais.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p><strong>Este documento foi gerado automaticamente com base em evidências científicas sobre interações droga-nutriente.</strong></p>
      <p>As orientações devem ser avaliadas por profissional nutricionista qualificado antes da implementação.</p>
    </div>
  </body>
</html>`;

    const blob = new Blob([printContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-teal-50 to-teal-100">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-900 flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-teal-600" />
                {readOnly ? "Orientação Nutricional Salva" : "Orientação Nutricional Gerada"}
              </CardTitle>
              <p className="text-slate-600">Paciente: {currentGuidance.nome_paciente}</p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                  {currentGuidance.medicamentos_analisados.length} medicamentos analisados
                </Badge>
                <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                  {currentGuidance.interacoes_identificadas.length} interações identificadas
                </Badge>
              </div>
            </div>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setIsEditing(!isEditing); if (isEditing) setEdited(guidance); }}
                className={isEditing ? "border-teal-400 text-teal-600 hover:bg-teal-50" : "border-primary text-primary hover:bg-primary/10"}
              >
                <Pencil className="w-4 h-4 mr-1" />
                {isEditing ? "Cancelar edição" : "Editar"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {currentGuidance.interacoes_identificadas.length > 0 && (
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-teal-900">Interações Identificadas</h3>
                </div>
                <div className="space-y-2">
                  {currentGuidance.interacoes_identificadas.map((int, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-teal-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{int.medicamento} + {int.nutriente}</p>
                          <p className="text-sm text-slate-600">{int.tipo}</p>
                        </div>
                        <Badge className={
                          int.severidade === 'Grave' ? 'bg-red-100 text-red-700 border-red-200' :
                          int.severidade === 'Moderada' ? 'bg-teal-100 text-teal-700 border-teal-200' :
                          'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }>
                          {int.severidade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-teal-900">Orientações Gerais</h3>
              </div>
              {isEditing ? (
                <Textarea rows={6} value={edited.orientacoes_gerais} onChange={e => updateField('orientacoes_gerais', e.target.value)} className="bg-white" />
              ) : (
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{currentGuidance.orientacoes_gerais}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {(currentGuidance.alimentos_evitar?.length > 0 || isEditing) && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <X className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Alimentos a Evitar</h3>
                  </div>
                  <ul className="space-y-2">
                    {(isEditing ? edited : currentGuidance).alimentos_evitar?.map((alimento, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Input value={alimento} onChange={e => updateListItem('alimentos_evitar', idx, e.target.value)} className="bg-white text-sm h-8" />
                            <button onClick={() => removeListItem('alimentos_evitar', idx)}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                          </>
                        ) : (
                          <><span className="text-red-600 mt-1">•</span><span className="text-sm text-red-800">{alimento}</span></>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditing && <Button variant="ghost" size="sm" className="mt-2 text-red-600" onClick={() => addListItem('alimentos_evitar')}><Plus className="w-3 h-3 mr-1" />Adicionar</Button>}
                </div>
              )}

              {(currentGuidance.alimentos_recomendados?.length > 0 || isEditing) && (
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Apple className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-teal-900">Alimentos Recomendados</h3>
                  </div>
                  <ul className="space-y-2">
                    {(isEditing ? edited : currentGuidance).alimentos_recomendados?.map((alimento, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Input value={alimento} onChange={e => updateListItem('alimentos_recomendados', idx, e.target.value)} className="bg-white text-sm h-8" />
                            <button onClick={() => removeListItem('alimentos_recomendados', idx)}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                          </>
                        ) : (
                          <><span className="text-teal-600 mt-1">•</span><span className="text-sm text-teal-800">{alimento}</span></>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditing && <Button variant="ghost" size="sm" className="mt-2 text-teal-600" onClick={() => addListItem('alimentos_recomendados')}><Plus className="w-3 h-3 mr-1" />Adicionar</Button>}
                </div>
              )}
            </div>

            {(currentGuidance.suplementacao_necessaria?.length > 0 || isEditing) && (
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-teal-900">Suplementação Recomendada</h3>
                </div>
                <ul className="space-y-2">
                  {(isEditing ? edited : currentGuidance).suplementacao_necessaria?.map((supl, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Input value={supl} onChange={e => updateListItem('suplementacao_necessaria', idx, e.target.value)} className="bg-white text-sm h-8" />
                          <button onClick={() => removeListItem('suplementacao_necessaria', idx)}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                        </>
                      ) : (
                        <><span className="text-teal-600 mt-1">•</span><span className="text-sm text-teal-800">{supl}</span></>
                      )}
                    </li>
                  ))}
                </ul>
                {isEditing && <Button variant="ghost" size="sm" className="mt-2 text-teal-600" onClick={() => addListItem('suplementacao_necessaria')}><Plus className="w-3 h-3 mr-1" />Adicionar</Button>}
              </div>
            )}

            {(currentGuidance.horarios_alimentacao || isEditing) && (
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-teal-900">Horários de Alimentação</h3>
                </div>
                {isEditing ? (
                  <Textarea rows={4} value={edited.horarios_alimentacao} onChange={e => updateField('horarios_alimentacao', e.target.value)} className="bg-white" />
                ) : (
                  <p className="text-sm text-teal-800 whitespace-pre-wrap leading-relaxed">{currentGuidance.horarios_alimentacao}</p>
                )}
              </div>
            )}

            {(currentGuidance.observacoes_especiais || isEditing) && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">Observações Especiais</h3>
                </div>
                {isEditing ? (
                  <Textarea rows={4} value={edited.observacoes_especiais} onChange={e => updateField('observacoes_especiais', e.target.value)} className="bg-white" />
                ) : (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{currentGuidance.observacoes_especiais}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
              <div className="text-sm text-slate-600">
                <p>Data de geração: {format(new Date(currentGuidance.data_geracao), "dd/MM/yyyy", { locale: ptBR })}</p>
                <p>Validade: {format(new Date(currentGuidance.validade), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            <Button onClick={onCancel} variant="outline" disabled={isSaving}>
              {readOnly ? "Voltar" : "Descartar"}
            </Button>
            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar pelo WhatsApp
            </Button>
            <Button 
              onClick={handlePrint} 
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            {!readOnly && (
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Orientação'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}