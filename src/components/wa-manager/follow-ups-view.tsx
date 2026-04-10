"use client";

import { useState, useMemo } from "react";
import { useClients, useFollowUps } from "@/hooks/use-data";
import { FollowUpFormSheet } from "./followup-form-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FollowUp } from "@/hooks/use-data";
import {
  Plus, CheckCircle2, Trash2, Clock, AlertTriangle, User, Calendar,
  ListFilter, ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRIORITY_CONFIG: Record<string, { color: string; label: string; dotColor: string }> = {
  alta: { color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800", label: "Alta", dotColor: "bg-red-500" },
  media: { color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800", label: "Media", dotColor: "bg-amber-500" },
  baja: { color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800", label: "Baja", dotColor: "bg-green-500" },
};

type FilterTab = "pending" | "completed" | "all";
type PriorityFilter = "all" | "alta" | "media" | "baja";

export function FollowUpsView() {
  const { clients } = useClients();
  const { followUps, loading, addFollowUp, completeFollowUp, deleteFollowUp } = useFollowUps();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  const allPending = followUps.filter(f => !f.completed);
  const allCompleted = followUps.filter(f => f.completed);

  const filtered = useMemo(() => {
    let list: FollowUp[] = [];
    if (activeTab === "pending") list = allPending;
    else if (activeTab === "completed") list = allCompleted;
    else list = followUps;

    if (priorityFilter !== "all") {
      list = list.filter(f => f.priority === priorityFilter);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [followUps, activeTab, priorityFilter, allPending, allCompleted]);

  const handleSave = async (data: { clientId: string; clientName?: string; title: string; description: string; dueDate: string; priority: "baja" | "media" | "alta"; }) => {
    await addFollowUp(data as any);
    toast({ title: "Seguimiento creado", description: `"${data.title}" se ha agregado` });
    setFormOpen(false);
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const formatRelative = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHours < 1) return "Vence pronto";
    if (diffHours < 24) return `Vence en ${diffHours}h`;
    if (diffDays === 1) return "Vence mañana";
    if (diffDays < 0) return `En ${Math.abs(diffDays)} días`;
    return `Hace ${diffDays}d`;
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c?.name || "Cliente";
  };

  const overdueCount = allPending.filter(f => isOverdue(f.dueDate)).length;

  if (loading) {
    return (
      <div className="space-y-4 page-enter">
        <Skeleton className="h-8 w-40" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "pending", label: "Pendientes", count: allPending.length },
    { id: "completed", label: "Completados", count: allCompleted.length },
    { id: "all", label: "Todos", count: followUps.length },
  ];

  return (
    <div className="space-y-4 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-violet-500" />
            </div>
            Seguimientos
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {allPending.length} pendientes
            {overdueCount > 0 && <span className="ml-1.5 text-red-500 font-medium">· {overdueCount} vencido{overdueCount > 1 ? "s" : ""}</span>}
          </p>
        </div>
        <Button size="sm" className="bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm btn-wa press-effect" onClick={() => setFormOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Nuevo
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all press-effect ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? "bg-[#25D366]/15 text-[#128C7E] dark:text-[#25D366]" : "bg-muted text-muted-foreground"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Priority Filter */}
      {activeTab !== "completed" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium">Filtrar:</span>
          </div>
          <div className="flex gap-1.5">
            {(["all", "alta", "media", "baja"] as PriorityFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all press-effect ${
                  priorityFilter === p ? "bg-card text-foreground shadow-sm border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "all" ? "Todos" : PRIORITY_CONFIG[p]?.label || p}
                {p !== "all" && (
                  <span className="ml-0.5 text-[9px] opacity-60">
                    ({followUps.filter(f => f.priority === p && !f.completed).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Alert */}
      {overdueCount > 0 && activeTab === "pending" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/15 p-2.5 animate-slide-down">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
            {overdueCount} seguimiento{overdueCount > 1 ? "s" : ""} vencido{overdueCount > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Follow-ups List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className={`h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            activeTab === "completed" ? "bg-emerald-500/10" : "bg-[#25D366]/10"
          }`}>
            <CheckCircle2 className={`h-8 w-8 ${
              activeTab === "completed" ? "text-emerald-500/40" : "text-[#25D366]/40"
            }`} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {activeTab === "pending" ? "Sin seguimientos pendientes" : activeTab === "completed" ? "Sin seguimientos completados" : "Sin seguimientos"}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {activeTab === "pending" ? "Todo al día — buen trabajo" : "Crea tu primer seguimiento"}
          </p>
          {activeTab !== "completed" && (
            <Button variant="link" className="text-[#25D366] mt-3" onClick={() => setFormOpen(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Crear seguimiento
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-340px)]">
          <div className="space-y-2">
            {filtered.map((fu, idx) => {
              const overdue = !fu.completed && isOverdue(fu.dueDate);
              const priority = PRIORITY_CONFIG[fu.priority] || PRIORITY_CONFIG.media;
              return (
                <Card
                  key={fu.id}
                  className={`border-0 shadow-sm card-interactive stagger-item ${overdue ? "border-l-4 border-l-red-500" : fu.completed ? "border-l-4 border-l-emerald-500 opacity-70" : "border-l-4 border-l-[#25D366]"}`}
                  style={{ animationDelay: `${Math.min(idx * 0.03, 0.3)}s` }}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        fu.completed ? "bg-emerald-100 dark:bg-emerald-900/30" :
                        overdue ? "bg-red-100 dark:bg-red-900/30" : "bg-[#25D366]/10"
                      }`}>
                        {fu.completed
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          : overdue
                            ? <AlertTriangle className="h-5 w-5 text-red-500" />
                            : <Calendar className="h-5 w-5 text-[#25D366]" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold text-sm ${fu.completed ? "line-through text-muted-foreground" : ""}`}>{fu.title}</h3>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-semibold ${priority.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priority.dotColor} mr-1`} />
                            {priority.label}
                          </Badge>
                          {overdue && (
                            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0 animate-pulse-soft">
                              Vencido
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getClientName(fu.clientId)}
                        </p>
                        {fu.description && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-2">{fu.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className={`text-[11px] flex items-center gap-1 ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                            <Clock className="h-3 w-3" />
                            {!fu.completed ? formatRelative(fu.dueDate) : formatDate(fu.completedAt || fu.createdAt)}
                          </p>
                          {!fu.completed && (
                            <p className="text-[10px] text-muted-foreground/50">{formatDate(fu.dueDate)}</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {!fu.completed && (
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-[#25D366] hover:bg-[#25D366]/10 press-effect"
                            onClick={() => { toast({ title: "Completado", description: `"${fu.title}" marcado como completo` }); completeFollowUp(fu.id); }}
                            title="Completar">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 press-effect"
                            onClick={() => { if (confirm("¿Eliminar seguimiento?")) { toast({ title: "Eliminado" }); deleteFollowUp(fu.id); } }}
                            title="Eliminar">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      <FollowUpFormSheet open={formOpen} onOpenChange={setFormOpen} clients={clients} onSave={handleSave} />
    </div>
  );
}
