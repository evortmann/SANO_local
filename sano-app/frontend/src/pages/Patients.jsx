import React, { useState } from "react";
import { patientsApi } from "@/api/patients";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PatientForm from "../components/patients/PatientForm";
import PatientCard from "../components/patients/PatientCard";
import PatientDetails from "../components/patients/PatientDetails";

export default function Patients() {
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsApi.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => patientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowForm(false);
      setEditingPatient(null);
      toast({ title: "Paciente salvo"});
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Não foi possível salvar", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => patientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowForm(false);
      setEditingPatient(null);
      setSelectedPatient(null);
      toast({ title: "Paciente atualizado" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Não foi possível atualizar", description: error.message });
    },
  });

  const handleSubmit = (data) => {
    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
    setSelectedPatient(null);
  };

  const filteredPatients = patients.filter(patient =>
    patient.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.tipo_cancer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Pacientes</h1>
            <p className="text-slate-600">Gerencie os pacientes oncológicos em acompanhamento</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPatient(null);
              setSelectedPatient(null);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Paciente
          </Button>
        </div>

        {showForm && (
          <PatientForm
            patient={editingPatient}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPatient(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {selectedPatient && (
          <PatientDetails
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            onEdit={handleEdit}
          />
        )}

        {!showForm && !selectedPatient && (
          <>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nome ou tipo de câncer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-6 bg-white border-slate-200 shadow-sm"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onView={() => setSelectedPatient(patient)}
                  onEdit={() => handleEdit(patient)}
                />
              ))}
            </div>

            {filteredPatients.length === 0 && !isLoading && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
                <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm ? 'Tente buscar com outros termos' : 'Comece adicionando seu primeiro paciente'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Paciente
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}