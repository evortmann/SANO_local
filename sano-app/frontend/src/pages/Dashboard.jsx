import React from "react";
import { base44 } from "@/api/base44Client";
import { patientsApi } from "@/api/patients";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Database, FileText, AlertTriangle, TrendingUp, Activity, Bell, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
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

  const { data: guidances = [] } = useQuery({
    queryKey: ['guidances'],
    queryFn: () => base44.entities.NutritionalGuidance.list('-created_date', 10),
    initialData: [],
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 10),
    initialData: [],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId) => base44.entities.Alert.update(alertId, { lido: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const dismissAlertMutation = useMutation({
    mutationFn: (alertId) => base44.entities.Alert.delete(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const unreadAlerts = alerts.filter(a => !a.lido);

  const activePatients = patients.filter(p => p.status === 'Ativo').length;
  const severeInteractions = interactions.filter(i => i.severidade === 'Grave').length;
  
  const interactionsBySeverity = interactions.reduce((acc, int) => {
    acc[int.severidade] = (acc[int.severidade] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
              <p className="text-slate-600">Visão geral do sistema de orientações nutricionais oncológicas</p>
            </div>
            {unreadAlerts.length > 0 && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200">
                <Bell className="w-5 h-5 animate-pulse" />
                <span className="font-semibold">{unreadAlerts.length} alerta(s) não lido(s)</span>
              </div>
            )}
          </div>
        </div>

        {unreadAlerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {unreadAlerts.map((alert) => (
              <Alert 
                key={alert.id} 
                className={`border-2 ${
                  alert.severidade === 'Grave' 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-teal-50 border-teal-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      alert.severidade === 'Grave' ? 'text-red-600' : 'text-teal-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${
                          alert.severidade === 'Grave' ? 'text-red-900' : 'text-teal-900'
                        }`}>
                          Alerta de Interação {alert.severidade}
                        </span>
                        <Badge className={
                          alert.severidade === 'Grave' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-teal-600 text-white'
                        }>
                          {alert.interacoes_count} interação(ões)
                        </Badge>
                        {alert.email_enviado && (
                          <Badge variant="outline" className="text-xs">
                            E-mail enviado
                          </Badge>
                        )}
                      </div>
                      <AlertDescription className={
                        alert.severidade === 'Grave' ? 'text-red-800' : 'text-teal-800'
                      }>
                        {alert.mensagem}
                      </AlertDescription>
                      <p className="text-xs text-slate-500 mt-2">
                        {format(new Date(alert.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsReadMutation.mutate(alert.id)}
                      className="hover:bg-white"
                    >
                      Marcar como lido
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlertMutation.mutate(alert.id)}
                      className="hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg bg-[hsl(var(--sidebar-background))] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Pacientes Ativos</CardTitle>
                <Users className="w-5 h-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activePatients}</div>
              <p className="text-xs opacity-75 mt-1">de {patients.length} total</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-[hsl(var(--sidebar-background))] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Interações na Base</CardTitle>
                <Database className="w-5 h-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{interactions.length}</div>
              <p className="text-xs opacity-75 mt-1">registradas</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Interações Graves</CardTitle>
                <AlertTriangle className="w-5 h-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{severeInteractions}</div>
              <p className="text-xs opacity-75 mt-1">requerem atenção</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-[hsl(var(--sidebar-background))] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Orientações Geradas</CardTitle>
                <FileText className="w-5 h-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{guidances.length}</div>
              <p className="text-xs opacity-75 mt-1">documentos criados</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Activity className="w-5 h-5 text-teal-600" />
                Distribuição de Severidade
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {['Grave', 'Moderada', 'Leve'].map((severity) => {
                  const count = interactionsBySeverity[severity] || 0;
                  const total = interactions.length || 1;
                  const percentage = Math.round((count / total) * 100);
                  const colors = {
                    'Grave': 'bg-red-500',
                    'Moderada': 'bg-teal-500',
                    'Leve': 'bg-yellow-500'
                  };
                  
                  return (
                    <div key={severity}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{severity}</span>
                        <span className="text-sm font-semibold text-slate-900">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`${colors[severity]} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Pacientes Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {patients.slice(0, 5).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                        {patient.nome_completo?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{patient.nome_completo}</p>
                        <p className="text-xs text-slate-500">{patient.tipo_cancer}</p>
                      </div>
                    </div>
                    <Badge variant={patient.status === 'Ativo' ? 'default' : 'secondary'} className="bg-teal-100 text-teal-700 border-teal-200">
                      {patient.status}
                    </Badge>
                  </div>
                ))}
                {patients.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">Nenhum paciente cadastrado ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}