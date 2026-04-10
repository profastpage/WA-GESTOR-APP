"use client";

import { useStats, useClients, useMessages, useFollowUps } from "@/hooks/use-data";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, MessageSquare, FileText, Clock, Crown, AlertCircle, Sparkles, TrendingUp, ArrowUpRight, Phone, Zap } from "lucide-react";

export function DashboardView() {
  const { stats, loading } = useStats();
  const { clients } = useClients();
  const { messages } = useMessages();
  const { followUps } = useFollowUps();
  const { isAuthenticated, user } = useAuthStore();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const recentClients = clients.slice(0, 3);
  const recentMessages = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const pendingFollowUps = followUps.filter(f => !f.completed).slice(0, 3);
  const overdueFollowUps = pendingFollowUps.filter(f => new Date(f.dueDate) < new Date());

  const statCards = [
    { label: "Total Clientes", value: stats.totalClients, icon: Users, color: "text-[#128C7E]", bg: "bg-[#128C7E]/10", trend: clients.length > 0 ? "+" : null },
    { label: "Mensajes Hoy", value: stats.messagesToday, icon: MessageSquare, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
    { label: "Plantillas", value: stats.totalTemplates, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Seguimientos Pend.", value: stats.pendingFollowUps, icon: Clock, color: overdueFollowUps.length > 0 ? "text-red-500" : "text-violet-500", bg: overdueFollowUps.length > 0 ? "bg-red-500/10" : "bg-violet-500/10" },
  ];

  const freeLimit = 30;
  const clientUsage = user?.isPro ? 0 : Math.min(Math.round((stats.totalClients / freeLimit) * 100), 100);
  const isNearLimit = !user?.isPro && stats.totalClients >= 25;

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c?.name || c?.phone || "Cliente";
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}{user?.name ? `, ${user.name}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aquí está el resumen de tu actividad
        </p>
      </div>

      {/* Demo mode notice */}
      {!isAuthenticated && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Modo Demo</p>
            <p className="text-[11px] text-muted-foreground">
              Los datos se guardan localmente.{" "}
              <span className="text-[#25D366] font-medium">Inicia sesión</span> para sincronizar en la nube.
            </p>
          </div>
        </div>
      )}

      {/* Pro Banner */}
      {user?.isPro && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 p-4">
          <Crown className="h-6 w-6 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#25D366]">Licencia Pro Activa</p>
            <p className="text-xs text-muted-foreground">Acceso ilimitado a todas las funciones</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <div className="flex items-center gap-0.5 text-[#25D366]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold">Nuevo</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Progress (Free plan) */}
      {!user?.isPro && clients.length > 0 && (
        <Card className={`border-0 shadow-sm ${isNearLimit ? "border-l-4 border-l-amber-500" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className={`h-4 w-4 ${isNearLimit ? "text-amber-500" : "text-muted-foreground"}`} />
                <span className="text-xs font-semibold">Uso del Plan Gratis</span>
              </div>
              <span className={`text-xs font-bold ${isNearLimit ? "text-amber-500" : "text-muted-foreground"}`}>
                {stats.totalClients}/{freeLimit} clientes
              </span>
            </div>
            <Progress value={clientUsage} className={`h-2 ${isNearLimit ? "[&>div]:bg-amber-500" : "[&>div]:bg-[#25D366]"}`} />
            {isNearLimit && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5">
                ⚠️ Estás cerca del límite. Actualiza a Pro para clientes ilimitados.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overdue Follow-ups Alert */}
      {overdueFollowUps.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {overdueFollowUps.length} Seguimiento{overdueFollowUps.length > 1 ? "s" : ""} Vencido{overdueFollowUps.length > 1 ? "s" : ""}
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              {overdueFollowUps.slice(0, 2).map((fu) => (
                <div key={fu.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 text-red-400 shrink-0" />
                  <span className="font-medium text-foreground truncate">{fu.title}</span>
                  <span className="text-red-400 shrink-0">— {getClientName(fu.clientId)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Messages Activity */}
      {recentMessages.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#25D366]" />
              Actividad Reciente
            </h3>
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/10 shrink-0 mt-0.5">
                    <MessageSquare className="h-3.5 w-3.5 text-[#25D366]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">{getClientName(msg.clientId)}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tag Distribution */}
      {stats.tagDistribution.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#128C7E]" />
              Distribución de Etiquetas
            </h3>
            <div className="space-y-3">
              {stats.tagDistribution.map((item) => {
                const maxCount = stats.tagDistribution[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const tagColors: Record<string, string> = {
                  Nuevo: "bg-[#25D366]",
                  Pendiente: "bg-amber-500",
                  VIP: "bg-purple-500",
                };
                return (
                  <div key={item.tag} className="flex items-center gap-3">
                    <div className="w-20 sm:w-24 text-xs font-medium truncate">{item.tag}</div>
                    <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${tagColors[item.tag] || "bg-[#128C7E]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs font-bold w-6 text-right">{item.count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips / CTA */}
      {!user?.isPro && stats.totalClients === 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-300" />
              <h3 className="text-sm font-bold">Comienza a gestionar tus clientes</h3>
            </div>
            <p className="text-xs text-white/80 mb-3">
              Agrega tu primer cliente y envía mensajes de WhatsApp de forma profesional.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white border-0 text-[10px]">
                <Phone className="mr-1 h-3 w-3" /> WhatsApp seguro
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-[10px]">
                <Users className="mr-1 h-3 w-3" /> CRM completo
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-[10px]">
                <FileText className="mr-1 h-3 w-3" /> Plantillas
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA */}
      {!user?.isPro && stats.totalClients > 5 && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-300" />
              <h3 className="text-sm font-bold">Desbloquea el Plan Pro</h3>
            </div>
            <p className="text-xs text-white/80 mb-3">
              Clientes ilimitados, plantillas ilimitadas, seguimientos avanzados y más.
            </p>
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 cursor-pointer">
              S/99 pago único · Activa con código
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
