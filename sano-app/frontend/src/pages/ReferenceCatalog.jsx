import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, ChevronRight, ExternalLink, FlaskConical, Pill, Search } from "lucide-react";
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
    icon: "bg-blue-100 text-blue-700",
    border: "border-blue-200 hover:border-blue-400",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    heading: "text-blue-900",
  },
  purple: {
    icon: "bg-purple-100 text-purple-700",
    border: "border-purple-200 hover:border-purple-400",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    heading: "text-purple-900",
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

  if (selectedItem && section) {
    const colors = colorClasses[section.color];
    return (
      <div className="min-h-full bg-slate-50 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <button type="button" onClick={goBack} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
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
          <button type="button" onClick={goBack} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
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
          <button type="button" onClick={() => setShowLiteratureSearch(false)} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
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
          <button type="button" onClick={() => setShowLiteratureSearch(true)} className="group rounded-2xl border border-amber-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><BookOpen className="h-7 w-7" /></div>
              <ChevronRight className="h-6 w-6 text-slate-300 transition-transform group-hover:translate-x-1" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">BUSCAR</h2>
            <p className="mt-2 leading-relaxed text-slate-600">Procure novas interações droga–nutriente quando ainda não estiverem no catálogo.</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-amber-700"><Search className="h-4 w-4" /> BUSCAR</div>
          </button>
        </div>
      </div>
    </div>
  );
}
