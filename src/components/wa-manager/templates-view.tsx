"use client";

import { useState, useEffect, useMemo } from "react";
import { useTemplates } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  FileText,
  Sparkles,
  Check,
  Loader2,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TEMPLATE_VARIABLES } from "@/lib/whatsapp";
import type { Template } from "@/hooks/use-data";

const CATEGORIES = [
  { value: "general", label: "General", emoji: "📋" },
  { value: "saludo", label: "Saludo", emoji: "👋" },
  { value: "ventas", label: "Ventas", emoji: "💰" },
  { value: "seguimiento", label: "Seguimiento", emoji: "🔄" },
  { value: "recordatorio", label: "Recordatorio", emoji: "⏰" },
  { value: "cierre", label: "Cierre", emoji: "🤝" },
];

const CAT_COLORS: Record<string, string> = {
  general: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  saludo: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  ventas: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  seguimiento: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  recordatorio: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  cierre: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export function TemplatesView() {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTmpl, setEditTmpl] = useState<Template | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        t.name?.toLowerCase().includes(q) ||
        t.content?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q);
      const matchCat = filterCat === "all" || t.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [templates, searchTerm, filterCat]);

  const handleSave = async (data: { name: string; content: string; category: string }) => {
    if (editTmpl) {
      await updateTemplate(editTmpl.id, data);
      toast({ title: "Plantilla actualizada", description: `"${data.name}" ha sido actualizada` });
    } else {
      await addTemplate(data as any);
      toast({ title: "Plantilla creada", description: `"${data.name}" se ha creado correctamente` });
    }
    setFormOpen(false);
    setEditTmpl(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta plantilla?")) {
      const tmpl = templates.find(t => t.id === id);
      await deleteTemplate(id);
      toast({ title: "Plantilla eliminada", description: `"${tmpl?.name || "Plantilla"}" ha sido eliminada` });
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 page-enter">
        <Skeleton className="h-8 w-40" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#25D366]" /> Plantillas
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} de {templates.length} plantillas</p>
        </div>
        <Button
          size="sm"
          className="bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm"
          onClick={() => { setEditTmpl(null); setFormOpen(true); }}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Nueva
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantilla..."
            className="pl-9 rounded-xl h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterCat === "all"
                ? "bg-[#128C7E] text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCat(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterCat === cat.value
                  ? "bg-[#128C7E] text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2 rounded-lg border border-[#25D366]/20 bg-[#25D366]/5 p-3">
        <Sparkles className="h-4 w-4 shrink-0 text-[#25D366] mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Usa variables como{" "}
          <code className="font-mono bg-muted px-1 rounded text-[10px]">{"{nombre}"}</code>,{" "}
          <code className="font-mono bg-muted px-1 rounded text-[10px]">{"{empresa}"}</code>,{" "}
          <code className="font-mono bg-muted px-1 rounded text-[10px]">{"{fecha}"}</code>{" "}
          para personalizar cada mensaje.
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">{
            searchTerm || filterCat !== "all" ? "No se encontraron resultados" : "Sin plantillas aún"
          }</p>
          {!searchTerm && filterCat === "all" && (
            <Button variant="link" className="text-[#25D366] mt-2" onClick={() => { setEditTmpl(null); setFormOpen(true); }}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Crear primera plantilla
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-380px)]">
          <div className="space-y-2.5">
            {filtered.map((tmpl) => {
              const cat = CATEGORIES.find(c => c.value === tmpl.category);
              return (
                <Card key={tmpl.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{tmpl.name}</h3>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${CAT_COLORS[tmpl.category] || CAT_COLORS.general}`}>
                            {cat?.emoji} {tmpl.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 whitespace-pre-wrap line-clamp-3 leading-relaxed">
                          {tmpl.content}
                        </p>
                        {tmpl.usageCount > 0 && (
                          <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                            Usada {tmpl.usageCount} vez{tmpl.usageCount !== 1 ? "es" : ""}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-muted"
                          onClick={() => handleCopy(tmpl.content, tmpl.id)}
                          title="Copiar"
                        >
                          {copiedId === tmpl.id ? <Check className="h-4 w-4 text-[#25D366]" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-muted"
                          onClick={() => { setEditTmpl(tmpl); setFormOpen(true); }}
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          onClick={() => handleDelete(tmpl.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      <TemplateFormSheet
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTmpl(null); }}
        template={editTmpl}
        onSave={handleSave}
      />
    </div>
  );
}

function TemplateFormSheet({
  open,
  onOpenChange,
  template,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template | null;
  onSave: (data: { name: string; content: string; category: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);
  const isEditing = !!template;

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      setName(template?.name || "");
      setContent(template?.content || "");
      setCategory(template?.category || "general");
    }
  }, [open, template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await onSave({ name, content, category });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Plantilla" : "Nueva Plantilla"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Modifica la plantilla de mensaje" : "Crea una nueva plantilla con variables"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tmpl-name">Nombre *</Label>
            <Input
              id="tmpl-name"
              placeholder="Ej: Saludo inicial"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    category === cat.value
                      ? "bg-[#128C7E] text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Variables disponibles</Label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setContent(prev => prev + v.key)}
                  className="px-2 py-1 rounded-md text-[10px] font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 transition-colors"
                  title={v.example}
                >
                  {v.key}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tmpl-content">Contenido *</Label>
            <Textarea
              id="tmpl-content"
              placeholder={"Hola {nombre}, te contactamos de {empresa}...\n\n¿En qué podemos ayudarte?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="font-mono text-sm resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#25D366] text-white hover:bg-[#128C7E]" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
