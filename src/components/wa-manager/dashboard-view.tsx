"use client";

import { useStats } from "@/hooks/use-data";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MessageSquare, FileText, Clock, Crown, AlertCircle, Sparkles } from "lucide-react";

export function DashboardView() {
  const { stats, loading } = useStats();
  const { isAuthenticated, user } = useAuthStore();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const statCards = [
    { label: "Total Clientes", value: stats.totalClients, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Mensajes Hoy", value: stats.messagesToday, icon: MessageSquare, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
    { label: "Plantillas", value: stats.totalTemplates, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Seguimientos Pend.", value: stats.pendingFollowUps, icon: Clock, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}{user?.name ? `, ${user.name}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aquí está el resumen de tu CRM
        </p>
      </div>

      {/* Demo mode notice */}
      {!isAuthenticated && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-amber-600">Modo Demo:</span> Los datos se guardan localmente.{" "}
            <span className="text-[#25D366] font-medium">Inicia sesión</span> para sincronizar en la nube.
          </p>
        </div>
      )}

      {/* Pro Banner */}
      {user?.isPro && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 p-4">
          <Crown className="h-6 w-6 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-[#25D366]">Licencia Pro Activa</p>
            <p className="text-xs text-muted-foreground">Acceso ilimitado a todas las funciones</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tag Distribution */}
      {stats.tagDistribution.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#25D366]" />
              Distribución de Etiquetas
            </h3>
            <div className="space-y-3">
              {stats.tagDistribution.map((item) => {
                const maxCount = stats.tagDistribution[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const tagColors: Record<string, string> = {
                  Nuevo: "bg-blue-500",
                  Pendiente: "bg-amber-500",
                  VIP: "bg-purple-500",
                };
                return (
                  <div key={item.tag} className="flex items-center gap-3">
                    <div className="w-20 sm:w-24 text-xs font-medium truncate">{item.tag}</div>
                    <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${tagColors[item.tag] || "bg-[#25D366]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs font-semibold w-6 text-right">{item.count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      {!user?.isPro && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-300" />
              <h3 className="text-sm font-bold">Desbloquea el Plan Pro</h3>
            </div>
            <p className="text-xs text-white/80 mb-3">
              Clientes ilimitados, plantillas ilimitadas, seguimientos avanzados y más.
            </p>
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 cursor-pointer">
              S/99/mes · Activa con código
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
