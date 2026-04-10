"use client";

import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPhoneDisplay } from "@/lib/whatsapp";
import type { Client, Message, FollowUp } from "@/hooks/use-data";
import {
  Phone,
  Mail,
  Building2,
  StickyNote,
  MessageCircle,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronDown,
  Hash,
  User,
} from "lucide-react";

interface ClientDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  messages: Message[];
  followUps: FollowUp[];
  onSendMessage: () => void;
}

const TAG_COLORS: Record<string, string> = {
  Nuevo: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  VIP: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Activo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Inactivo: "bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400",
};

const PRIORITY_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  alta: {
    color: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    icon: <AlertTriangle className="h-3 w-3 text-red-500" />,
    label: "Alta",
  },
  media: {
    color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    icon: <Clock className="h-3 w-3 text-amber-500" />,
    label: "Media",
  },
  baja: {
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    icon: <ChevronDown className="h-3 w-3 text-emerald-500" />,
    label: "Baja",
  },
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Justo ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

export function ClientDetailPanel({
  open,
  onOpenChange,
  client,
  messages,
  followUps,
  onSendMessage,
}: ClientDetailPanelProps) {
  const stats = useMemo(() => {
    if (!client) return { totalMessages: 0, lastContact: null };
    return {
      totalMessages: messages.length,
      lastContact: messages.length > 0
        ? messages.reduce((latest, m) => {
            const mDate = new Date(m.createdAt);
            return mDate > latest ? mDate : latest;
          }, new Date(0))
        : client.lastContact
          ? new Date(client.lastContact)
          : null,
    };
  }, [client, messages]);

  if (!client) return null;

  const initials = (client.name || client.phone || "?")
    .split(" ")
    .map(w => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const pendingFollowUps = followUps.filter(f => !f.completed);
  const completedFollowUps = followUps.filter(f => f.completed);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-md w-full p-0 overflow-hidden"
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366] px-6 pt-8 pb-6 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full" />

          <SheetHeader className="relative z-10 space-y-0">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30 shadow-lg">
                {initials}
              </div>
            </div>

            <SheetTitle className="text-center text-xl font-bold text-white">
              {client.name || "Sin nombre"}
            </SheetTitle>
            <SheetDescription className="text-center text-white/80 text-sm">
              {formatPhoneDisplay(client.phone) || "Sin teléfono"}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Quick action bar */}
        <div className="flex gap-2 px-4 py-3 bg-muted/50 border-b">
          {client.phone && (
            <a
              href={`tel:${client.phone.replace(/\D/g, "")}`}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs gap-1.5"
              >
                <Phone className="h-3.5 w-3.5 text-[#128C7E]" />
                Llamar
              </Button>
            </a>
          )}
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-[#128C7E]" />
                Email
              </Button>
            </a>
          )}
          <div className="flex-1">
            <Button
              size="sm"
              className="w-full h-9 text-xs gap-1.5 bg-[#25D366] text-white hover:bg-[#128C7E]"
              onClick={onSendMessage}
            >
              <Send className="h-3.5 w-3.5" />
              Enviar WhatsApp
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1 h-[calc(100vh-320px)]">
          <div className="px-4 py-4 space-y-5">
            {/* Client Info Card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Información
                </h4>

                {client.company && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-3.5 w-3.5 text-[#128C7E]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Empresa</p>
                      <p className="text-sm font-medium truncate">{client.company}</p>
                    </div>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0">
                      <Phone className="h-3.5 w-3.5 text-[#128C7E]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Teléfono</p>
                      <a
                        href={`tel:${client.phone.replace(/\D/g, "")}`}
                        className="text-sm font-medium text-[#128C7E] hover:underline"
                      >
                        {formatPhoneDisplay(client.phone)}
                      </a>
                    </div>
                  </div>
                )}

                {client.email && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0">
                      <Mail className="h-3.5 w-3.5 text-[#128C7E]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Email</p>
                      <a
                        href={`mailto:${client.email}`}
                        className="text-sm font-medium text-[#128C7E] hover:underline truncate block"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}

                {client.tags.length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0">
                      <Hash className="h-3.5 w-3.5 text-[#128C7E]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground leading-tight mb-1">Etiquetas</p>
                      <div className="flex flex-wrap gap-1.5">
                        {client.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className={`text-[9px] px-2 py-0.5 h-5 font-bold rounded-full ${TAG_COLORS[tag] || "bg-muted"}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {client.notes && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <StickyNote className="h-3 w-3" />
                    Notas
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {client.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <MessageCircle className="h-3 w-3" />
                  Estadísticas
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[#128C7E]">{stats.totalMessages}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Mensaje{stats.totalMessages !== 1 ? "s" : ""} enviado{stats.totalMessages !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#128C7E]/10 to-[#128C7E]/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[#075E54]">
                      {stats.lastContact ? formatRelativeTime(stats.lastContact.toISOString()) : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Último contacto</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Message History */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <MessageCircle className="h-3 w-3" />
                Historial de Mensajes
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 ml-auto">
                  {sortedMessages.length}
                </Badge>
              </h4>

              {sortedMessages.length === 0 ? (
                <div className="text-center py-6 bg-muted/30 rounded-xl">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Sin mensajes aún</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sortedMessages.slice(0, 20).map((msg) => (
                    <div
                      key={msg.id}
                      className="wa-bubble-sent p-2.5 rounded-xl relative group"
                    >
                      <p className="text-xs text-white/90 whitespace-pre-wrap leading-relaxed pr-8">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[9px] text-white/50">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                        {msg.type === "outgoing" && (
                          <CheckCircle2 className="h-3 w-3 text-white/50" />
                        )}
                      </div>
                    </div>
                  ))}
                  {sortedMessages.length > 20 && (
                    <p className="text-[10px] text-center text-muted-foreground pt-1">
                      +{sortedMessages.length - 20} mensajes más
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Follow-ups */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Calendar className="h-3 w-3" />
                Seguimientos
                {pendingFollowUps.length > 0 && (
                  <Badge className="text-[9px] px-1.5 py-0 h-4 ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-bold rounded-full">
                    {pendingFollowUps.length} pendiente{pendingFollowUps.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </h4>

              {followUps.length === 0 ? (
                <div className="text-center py-6 bg-muted/30 rounded-xl">
                  <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Sin seguimientos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Pending follow-ups */}
                  {pendingFollowUps.map((fu) => {
                    const priority = PRIORITY_CONFIG[fu.priority] || PRIORITY_CONFIG.media;
                    const isOverdue = new Date(fu.dueDate) < new Date();
                    return (
                      <div
                        key={fu.id}
                        className={`border rounded-xl p-3 ${priority.color} border`}
                      >
                        <div className="flex items-start gap-2">
                          {priority.icon}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold truncate">{fu.title}</p>
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 h-4 shrink-0"
                              >
                                {priority.label}
                              </Badge>
                            </div>
                            {fu.description && (
                              <p className="text-[11px] opacity-70 line-clamp-2">{fu.description}</p>
                            )}
                            <div className="flex items-center gap-1 mt-1.5">
                              <Clock className="h-3 w-3 opacity-60" />
                              <p className={`text-[10px] ${isOverdue ? "text-red-500 font-semibold" : "opacity-60"}`}>
                                {isOverdue ? "Vencido: " : ""}{formatDate(fu.dueDate)}
                              </p>
                            </div>
                          </div>
                          <Circle className="h-4 w-4 shrink-0 mt-0.5 opacity-40" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Completed follow-ups */}
                  {completedFollowUps.length > 0 && (
                    <>
                      <p className="text-[10px] text-muted-foreground font-medium pt-1">
                        Completados ({completedFollowUps.length})
                      </p>
                      {completedFollowUps.slice(0, 5).map((fu) => (
                        <div
                          key={fu.id}
                          className="border border-muted rounded-xl p-3 opacity-60"
                        >
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate line-through">{fu.title}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {fu.completedAt ? formatDate(fu.completedAt) : "Completado"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bottom padding for scroll */}
            <div className="h-2" />
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="border-t p-4 bg-muted/30">
          <Button
            className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] h-10 font-semibold"
            onClick={onSendMessage}
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar WhatsApp
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
