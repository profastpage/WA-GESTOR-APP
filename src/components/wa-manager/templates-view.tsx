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
  Eye,
  EyeOff,
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

const CAT_BORDERS: Record<string, string> = {
  general: "border-l-slate-400",
  saludo: "border-l-green-500",
  ventas: "border-l-amber-500",
  seguimiento: "border-l-blue-500",
  recordatorio: "border-l-red-500",
  cierre: "border-l-purple-500",
};

const CAT_DOTS: Record<string, string> = {
  general: "bg-slate-400",
  saludo: "bg-green-500",
  ventas: "bg-amber-500",
  seguimiento: "bg-blue-500",
  recordatorio: "bg-red-500",
  cierre: "bg-purple-500",
};

function substituteVariables(text: string): React.ReactNode[] {
  const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const now = new Date();
  const todayFormatted = `${now.getDate()} de ${MONTHS_ES[now.getMonth()]}, ${now.getFullYear()}`;

  const knownVars: Record<string, string> = {
    "{nombre}": "Juan Pérez",
    "{empresa}": "Mi Empresa SAC",
    "{fecha}": todayFormatted,
    "{telefono}": "+51 999 888 777",
    "{email}": "juan@empresa.com",
    "{servicio}": "Consultoría Empresarial",
  };

  const varRegex = /\{[^}]+\}/g;
  const parts = text.split(varRegex);
  const matches = text.match(varRegex);

  const result: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part) result.push(part);
    if (matches && matches[i]) {
      const resolved = knownVars[matches[i]];
      if (resolved) {
        result.push(<span key={`v${i}`} className="font-semibold text-foreground">{resolved}</span>);
      } else {
        result.push(<span key={`v${i}`} className="text-muted-foreground/60">{matches[i]}</span>);
      }
    }
  });
  return result;
}

export function TemplatesView() {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTmpl, setEditTmpl] = useState<Template | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [previewId, setPreviewId] = useState<string | null>(null);

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
      {/* Section Header with Gradient Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-sm">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Plantillas</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} de {templates.length} plantillas</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm btn-wa"
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
        {/* Category Filter Pills with Colored Dots */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all press-effect flex items-center gap-1.5 ${
              filterCat === "all"
                ? "bg-[#128C7E] text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCat(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all press-effect flex items-center gap-1.5 ${
                filterCat === cat.value
                  ? "bg-[#128C7E] text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${filterCat === cat.value ? "bg-white/70" : CAT_DOTS[cat.value] || "bg-slate-400"}`} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Tip Box */}
      <div className="flex items-start gap-3 rounded-xl border border-[#25D366]/25 bg-gradient-to-r from-[#25D366]/5 via-[#128C7E]/5 to-[#25D366]/5 p-3.5 shadow-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#25D366]/10 shrink-0">
          <Sparkles className="h-4 w-4 text-[#25D366]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground mb-1">Tip: Personaliza tus mensajes</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Usa variables como{" "}
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border">{"{nombre}"}</code>,{" "}
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border">{"{empresa}"}</code>,{" "}
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border">{"{fecha}"}</code>{" "}
            para personalizar cada mensaje.
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        /* Enhanced Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-[#25D366]/50" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            {searchTerm || filterCat !== "all" ? "No se encontraron resultados" : "Sin plantillas aún"}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {searchTerm || filterCat !== "all" ? "Intenta con otros términos de búsqueda" : "Crea tu primera plantilla para empezar"}
          </p>
          {!searchTerm && filterCat === "all" && (
            <Button
              variant="outline"
              className="mt-4 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white text-xs press-effect"
              onClick={() => { setEditTmpl(null); setFormOpen(true); }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Crear primera plantilla
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-380px)]">
          <div className="space-y-2.5">
            {filtered.map((tmpl, idx) => {
              const cat = CATEGORIES.find(c => c.value === tmpl.category);
              return (
                <Card
                  key={tmpl.id}
                  className={`border-0 shadow-sm card-interactive stagger-item border-l-4 ${CAT_BORDERS[tmpl.category] || CAT_BORDERS.general}`}
                  style={{ animationDelay: `${Math.min(idx * 0.04, 0.3)}s` }}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{tmpl.name}</h3>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 h-4 font-semibold ${CAT_COLORS[tmpl.category] || CAT_COLORS.general}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${CAT_DOTS[tmpl.category] || CAT_DOTS.general} mr-1`} />
                            {tmpl.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 whitespace-pre-wrap line-clamp-3 leading-relaxed">
                          {tmpl.content}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          {tmpl.usageCount > 0 && (
                            <p className="text-[10px] text-muted-foreground/60">
                              Usada {tmpl.usageCount} vez{tmpl.usageCount !== 1 ? "es" : ""}
                            </p>
                          )}
                          <span className="text-[10px] text-muted-foreground/40">
                            {tmpl.content.length} caracteres
                          </span>
                        </div>

                        {previewId === tmpl.id && (
                          <div className="mt-3 stagger-item">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Preview</p>
                            <div className="wa-bubble-sent rounded-xl px-4 py-3 max-w-[300px]">
                              <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                {substituteVariables(tmpl.content)}
                              </p>
                              <p className="text-[9px] text-foreground/40 mt-1.5 text-right">
                                {new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })} ✓✓
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 hover:bg-[#25D366]/10 ${previewId === tmpl.id ? "text-[#25D366]" : ""}`}
                          onClick={() => setPreviewId(previewId === tmpl.id ? null : tmpl.id)}
                          title="Vista previa"
                        >
                          {previewId === tmpl.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 hover:bg-[#25D366]/10 ${copiedId === tmpl.id ? "text-[#25D366]" : ""}`}
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
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all press-effect flex items-center gap-1 ${
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
            <div className="flex items-center justify-between">
              <Label htmlFor="tmpl-content">Contenido *</Label>
              <span className="text-[10px] text-muted-foreground">{content.length} caracteres</span>
            </div>
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
            <Button type="submit" className="flex-1 bg-[#25D366] text-white hover:bg-[#128C7E] btn-wa" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
