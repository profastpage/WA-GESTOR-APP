"use client";

import { useState } from "react";
import { useClients, useFollowUps } from "@/hooks/use-data";
import { FollowUpFormSheet } from "./followup-form-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPhoneDisplay } from "@/lib/whatsapp";
import type { Client, FollowUp } from "@/hooks/use-data";
import {
  Plus,
  CheckCircle2,
  Trash2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  alta: { color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800", label: "Alta" },
  media: { color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800", label: "Media" },
  baja: { color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800", label: "Baja" },
};

export function FollowUpsView() {
  const { clients } = useClients();
  const { followUps, loading, addFollowUp, completeFollowUp, deleteFollowUp } = useFollowUps();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);

  const handleSave = async (data: {
    clientId: string;
    clientName?: string;
    title: string;
    description: string;
    dueDate: string;
    priority: "baja" | "media" | "alta";
  }) => {
    await addFollowUp(data as any);
    toast({ title: "Seguimiento creado", description: `"${data.title}" se ha agregado` });
    setFormOpen(false);
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c?.name || "Cliente";
  };

  if (loading) {
    return (
      <div className="space-y-4 page-enter">
        <Skeleton className="h-8 w-40" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  const pending = followUps.filter(f => !f.completed);

  return (
    <div className="space-y-4 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#25D366]" /> Seguimientos
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{pending.length} pendientes</p>
        </div>
        <Button
          size="sm"
          className="bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Nuevo
        </Button>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Sin seguimientos pendientes</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Todo al día</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-280px)]">
          <div className="space-y-2.5">
            {pending.map((fu) => {
              const overdue = isOverdue(fu.dueDate);
              const priority = PRIORITY_CONFIG[fu.priority] || PRIORITY_CONFIG.media;
              return (
                <Card key={fu.id} className={`border-0 shadow-sm hover:shadow-md transition-shadow ${overdue ? "border-l-4 border-l-red-500" : "border-l-4 border-l-[#25D366]"}`}>
                  <CardContent className="p-3.5">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        overdue ? "bg-red-100 dark:bg-red-900/30" : "bg-[#25D366]/10"
                      }`}>
                        {overdue
                          ? <AlertTriangle className="h-5 w-5 text-red-500" />
                          : <Calendar className="h-5 w-5 text-[#25D366]" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{fu.title}</h3>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-semibold ${priority.color}`}>
                            {priority.label}
                          </Badge>
                          {overdue && (
                            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0">
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
                        <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          <Clock className="h-3 w-3" />
                          {formatDate(fu.dueDate)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#25D366] hover:bg-[#25D366]/10"
                          onClick={() => {
                            toast({ title: "Seguimiento completado", description: `"${fu.title}" marcado como completo` });
                            completeFollowUp(fu.id);
                          }}
                          title="Completar"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          onClick={() => {
                            if (confirm("¿Eliminar seguimiento?")) {
                              toast({ title: "Seguimiento eliminado", description: `"${fu.title}" ha sido eliminado` });
                              deleteFollowUp(fu.id);
                            }
                          }}
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

      <FollowUpFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        clients={clients}
        onSave={handleSave}
      />
    </div>
  );
}
