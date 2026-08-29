import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Database, BookOpen } from "lucide-react";
import InteractionForm from "../components/interactions/InteractionForm";
import InteractionGroupCard from "../components/interactions/InteractionGroupCard";
import InteractionDetails from "../components/interactions/InteractionDetails";
import LiteratureSearchModal from "../components/interactions/LiteratureSearchModal";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Interactions() {
  const [showForm, setShowForm] = useState(false);
  const [showLiteratureSearch, setShowLiteratureSearch] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [interactionToDelete, setInteractionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const queryClient = useQueryClient();

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['interactions'],
    queryFn: () => base44.entities.DrugNutrientInteraction.list('-updated_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DrugNutrientInteraction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      setShowForm(false);
      setEditingInteraction(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DrugNutrientInteraction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      setShowForm(false);
      setEditingInteraction(null);
      setSelectedInteraction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DrugNutrientInteraction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      setSelectedInteraction(null);
      setInteractionToDelete(null);
      toast({ title: "Interação excluída" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Não foi possível excluir",
        description: error.message || "Tente novamente.",
      });
    },
  });

  const handleSubmit = (data) => {
    if (editingInteraction) {
      updateMutation.mutate({ id: editingInteraction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (interaction) => {
    setEditingInteraction(interaction);
    setShowForm(true);
    setSelectedInteraction(null);
  };

  const handleDelete = (interaction) => {
    setInteractionToDelete(interaction);
  };

  const filteredInteractions = interactions.filter(interaction => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      interaction.nome_medicamento?.toLowerCase().includes(normalizedSearch) ||
      interaction.nutriente_afetado?.toLowerCase().includes(normalizedSearch);
    const matchesSeverity = filterSeverity === "all" || interaction.severidade === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const groupedInteractions = Object.values(
    filteredInteractions.reduce((groups, interaction) => {
      const key = interaction.nome_medicamento?.trim().toLowerCase() || "medicamento não informado";
      if (!groups[key]) {
        groups[key] = {
          nome_medicamento: interaction.nome_medicamento || "Medicamento não informado",
          interactions: [],
        };
      }
      groups[key].interactions.push(interaction);
      return groups;
    }, {})
  ).sort((first, second) => first.nome_medicamento.localeCompare(second.nome_medicamento, "pt-BR"));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Base de Interações</h1>
            <p className="text-slate-600">Gerencie as interações droga-nutriente conhecidas</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => { setShowLiteratureSearch(true); setShowForm(false); setSelectedInteraction(null); }}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Buscar na Literatura
            </Button>
            <Button
              onClick={() => { setShowForm(!showForm); setEditingInteraction(null); setSelectedInteraction(null); setShowLiteratureSearch(false); }}
              className="bg-primary hover:bg-primary/90 shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Interação
            </Button>
          </div>
        </div>

        <AlertDialog
          open={Boolean(interactionToDelete)}
          onOpenChange={(open) => {
            if (!open && !deleteMutation.isPending) {
              setInteractionToDelete(null);
            }
          }}
        >
          <AlertDialogContent className="max-w-md rounded-2xl border-red-100 bg-white p-6 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-slate-900">
                Excluir interação?
              </AlertDialogTitle>
              <AlertDialogDescription className="leading-relaxed text-slate-600">
                {interactionToDelete ? (
                  <>
                    Esta ação removerá permanentemente a interação do medicamento{" "}
                    <strong className="text-slate-900">{interactionToDelete.nome_medicamento}</strong>.
                    Essa ação não pode ser desfeita.
                  </>
                ) : null}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-3 gap-2">
              <AlertDialogCancel disabled={deleteMutation.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteMutation.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  deleteMutation.mutate(interactionToDelete.id);
                }}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleteMutation.isPending ? "Excluindo..." : "Excluir interação"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {showLiteratureSearch && (
          <LiteratureSearchModal
            onClose={() => setShowLiteratureSearch(false)}
            onImported={() => {
              queryClient.invalidateQueries({ queryKey: ['interactions'] });
              setShowLiteratureSearch(false);
            }}
          />
        )}

        {showForm && (
          <InteractionForm
            interaction={editingInteraction}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingInteraction(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {selectedInteraction && (
          <InteractionDetails
            interaction={selectedInteraction}
            onClose={() => setSelectedInteraction(null)}
            onEdit={handleEdit}
          />
        )}

        {!showForm && !selectedInteraction && (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por medicamento ou nutriente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-6 bg-white border-slate-200 shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'Grave', 'Moderada', 'Leve'].map((severity) => (
                  <Button
                    key={severity}
                    variant={filterSeverity === severity ? 'default' : 'outline'}
                    onClick={() => setFilterSeverity(severity)}
                    className={filterSeverity === severity ? 'bg-green-600' : ''}
                  >
                    {severity === 'all' ? 'Todas' : severity}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <span>Os registos estão agrupados por medicamento.</span>
              <strong>{groupedInteractions.length} {groupedInteractions.length === 1 ? "medicamento" : "medicamentos"}</strong>
            </div>

            <div className="grid w-full grid-cols-1 gap-3">
              {groupedInteractions.map((group) => (
                <InteractionGroupCard
                  key={group.nome_medicamento}
                  group={group}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>

            {groupedInteractions.length === 0 && !isLoading && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
                <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm || filterSeverity !== 'all' ? 'Nenhuma interação encontrada' : 'Nenhuma interação cadastrada'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || filterSeverity !== 'all' ? 'Tente outros filtros' : 'Comece adicionando interações à base de dados'}
                </p>
                {!searchTerm && filterSeverity === 'all' && (
                  <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Interação
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