import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, BookOpen, ChevronRight, ExternalLink, FlaskConical, Pill, Search, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LiteratureSearchModal from "../components/interactions/LiteratureSearchModal";
import catalog from "../data/referenceCatalog.json";

const sectionConfig = {
  farmacoterapeutico: {
    title: "Farmacoterapêutico",
    subtitle: "Medicamentos e informações para administração segura",
    itemTitle: "Medicamentos",
    icon: Pill,
    color: "blue",
  },
  antineoplasicos: {
    title: "Antineoplásicos",
    subtitle: "Protocolos antineoplásicos para consulta clínica",
    itemTitle: "Protocolos",
    icon: FlaskConical,
    color: "purple",
  },
};

const colorClasses = {
  blue: {
    icon: "bg-teal-100 text-teal-700",
    border: "border-teal-200 hover:border-teal-400",
    badge: "bg-teal-100 text-teal-700 border-teal-200",
    heading: "text-teal-900",
  },
  purple: {
    icon: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200 hover:border-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    heading: "text-emerald-900",
  },
};

function normalize(value = "") {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-slate-700">{label}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{value}</p>
    </div>
  );
}

export default function ReferenceCatalog() {
  const [sectionKey, setSectionKey] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLiteratureSearch, setShowLiteratureSearch] = useState(false);
  const [isClearingInteractions, setIsClearingInteractions] = useState(false);
  const [clearMessage, setClearMessage] = useState("");

  const section = sectionKey ? sectionConfig[sectionKey] : null;
  const sourceItems = sectionKey ? catalog[sectionKey]?.items || [] : [];
  const filteredItems = useMemo(() => {
    const query = normalize(searchTerm.trim());
    if (!query) return sourceItems;
    return sourceItems.filter((item) => normalize(item.name).includes(query));
  }, [searchTerm, sourceItems]);

  const openSection = (key) => {
    setSectionKey(key);
    setSelectedItem(null);
    setSearchTerm("");
  };

  const goBack = () => {
    if (selectedItem) setSelectedItem(null);
    else if (sectionKey) setSectionKey(null);
    setSearchTerm("");
  };

  const clearAllInteractions = async () => {
    const confirmed = window.confirm("Tem certeza que deseja excluir TODOS os registos de interações? Esta ação não apaga pacientes nem orientações salvas e não pode ser desfeita.");
    if (!confirmed) return;

    setIsClearingInteractions(true);
    setClearMessage("");
    try {
      const interactions = await base44.entities.DrugNutrientInteraction.list();
      for (const interaction of interactions) {
        await base44.entities.DrugNutrientInteraction.delete(interaction.id);
      }
      setClearMessage(`${interactions.length} registo(s) de interação foram excluídos.`);
    } catch (error) {
      setClearMessage("Não foi possível zerar a base de interações. Verifique a ligação e tente novamente.");
    } finally {
      setIsClearingInteractions(false);
    }
  };

  if (selectedItem && section) {
    const colors = colorClasses[section.color];
    return (
      <div className="min-h-full bg-slate-50 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <button type="button" onClick={goBack} className="mb-6 inline-flex items-center gap-2 rounded-xl border-2 border-teal-600 bg-white px-4 py-2.5 text-sm font-bold text-teal-800 shadow-sm transition-all hover:bg-teal-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">
            <ArrowLeft className="h-4 w-4" /> Voltar para {section.itemTitle.toLowerCase()}
          </button>
          <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.icon}`}>
                <section.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-slate-500">{section.title} / {section.itemTitle}</p>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{selectedItem.name}</h1>
              </div>
            </div>
            <a href={selectedItem.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline">
              Ver fonte original <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <h2 className={`text-xl font-bold ${colors.heading}`}>Ficha detalhada</h2>
            <Badge className={`${colors.badge} border`}>{Object.keys(selectedItem.fields || {}).length} campos</Badge>
          </div>
          {Object.keys(selectedItem.fields || {}).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(selectedItem.fields).map(([label, value]) => (
                <DetailField key={label} label={label} value={value} />
              ))}
            </div>
          ) : (
            <Card><CardContent className="p-8 text-center text-slate-500">Esta ficha ainda não possui campos detalhados importados.</CardContent></Card>
          )}
          <p className="mt-8 text-xs leading-relaxed text-slate-500">
            Fonte dos dados: Guia Farmacoterapêutico do Hospital Erasto Gaertner. Conteúdo para consulta e sujeito à validação clínica.
          </p>
        </div>
      </div>
    );
  }

  if (section) {
    const colors = colorClasses[section.color];
    return (
      <div className="min-h-full bg-slate-50 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <button type="button" onClick={goBack} className="mb-6 inline-flex items-center gap-2 rounded-xl border-2 border-teal-600 bg-white px-4 py-2.5 text-sm font-bold text-teal-800 shadow-sm transition-all hover:bg-teal-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">
            <ArrowLeft className="h-4 w-4" /> Voltar para Base de Interações
          </button>
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">Base de Interações / {section.title}</p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{section.itemTitle}</h1>
            <p className="mt-2 text-slate-600">{section.subtitle}</p>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={`Pesquisar ${section.itemTitle.toLowerCase()}...`} className="border-slate-200 bg-white py-6 pl-10 shadow-sm" />
          </div>
          <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
            <span>{filteredItems.length} registos disponíveis</span>
            <span>Selecione um registo para abrir a ficha</span>
          </div>
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <button key={item.url} type="button" onClick={() => setSelectedItem(item)} className={`flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md ${colors.border}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.icon}`}><section.icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1 font-medium text-slate-800">{item.name}</span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
          {filteredItems.length === 0 && <Card className="mt-4"><CardContent className="p-10 text-center text-slate-500">Nenhum registo encontrado.</CardContent></Card>}
        </div>
      </div>
    );
  }

  if (showLiteratureSearch) {
    return (
      <div className="min-h-full bg-slate-50 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <button type="button" onClick={() => setShowLiteratureSearch(false)} className="mb-6 inline-flex items-center gap-2 rounded-xl border-2 border-teal-600 bg-white px-4 py-2.5 text-sm font-bold text-teal-800 shadow-sm transition-all hover:bg-teal-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">
            <ArrowLeft className="h-4 w-4" /> Voltar para Base de Interações
          </button>
          <LiteratureSearchModal
            onClose={() => setShowLiteratureSearch(false)}
            onImported={() => setShowLiteratureSearch(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">Consulta clínica</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Base de Interações</h1>
          <p className="mt-2 text-slate-600">Escolha uma segmentação para consultar medicamentos ou protocolos.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(sectionConfig).map(([key, item]) => {
            const colors = colorClasses[item.color];
            return (
              <button key={key} type="button" onClick={() => openSection(key)} className={`group rounded-2xl border bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${colors.border}`}>
                <div className="mb-6 flex items-center justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.icon}`}><item.icon className="h-7 w-7" /></div>
                  <ChevronRight className="h-6 w-6 text-slate-300 transition-transform group-hover:translate-x-1" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{item.title}</h2>
                <p className="mt-2 leading-relaxed text-slate-600">{item.subtitle}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-500"><BookOpen className="h-4 w-4" />{catalog[key]?.items?.length || 0} {item.itemTitle.toLowerCase()}</div>
              </button>
            );
          })}
          <button type="button" onClick={() => setShowLiteratureSearch(true)} className="group rounded-2xl border border-teal-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-teal-400 hover:shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><BookOpen className="h-7 w-7" /></div>
              <ChevronRight className="h-6 w-6 text-slate-300 transition-transform group-hover:translate-x-1" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">BUSCAR</h2>
            <p className="mt-2 leading-relaxed text-slate-600">Procure novas interações droga–nutriente quando ainda não estiverem no catálogo.</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-teal-700"><Search className="h-4 w-4" /> BUSCAR</div>
          </button>
        </div>
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-800">Limpar base de interações</p>
            <p className="mt-1 text-sm text-slate-500">Exclui todos os registos da base droga–nutriente, sem apagar pacientes.</p>
            {clearMessage && <p className="mt-2 text-sm font-medium text-slate-700">{clearMessage}</p>}
          </div>
          <button type="button" onClick={clearAllInteractions} disabled={isClearingInteractions} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-red-600 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
            {isClearingInteractions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {isClearingInteractions ? "A limpar..." : "Zerar interações"}
          </button>
        </div>
      </div>
    </div>
  );
}
