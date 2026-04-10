"use client";

import { useStats, useClients, useMessages, useFollowUps } from "@/hooks/use-data";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users, MessageSquare, FileText, Clock, Crown, AlertCircle, Sparkles, TrendingUp,
  ArrowUpRight, Phone, Zap, Send, UserPlus, BarChart3, Activity, ChevronRight,
  CheckCircle2, Star, Target, Rocket,
} from "lucide-react";
import { formatPhoneDisplay } from "@/lib/whatsapp";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function MiniBarChart({ data, color = "#25D366" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="mini-bar">
      {data.map((val, i) => (
        <div
          key={i}
          className="mini-bar-item animate-progress-fill"
          style={{
            height: `${Math.max((val / max) * 100, 6)}%`,
            backgroundColor: color,
            opacity: 0.4 + (val / max) * 0.6,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

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

  const recentClients = clients.slice(-3).reverse();
  const recentMessages = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const pendingFollowUps = followUps.filter(f => !f.completed);
  const overdueFollowUps = pendingFollowUps.filter(f => new Date(f.dueDate) < new Date());
  const completedFollowUps = followUps.filter(f => f.completed).slice(-5).reverse();

  // Simulated weekly data for mini charts
  const weeklyClients = [3, 5, 2, 8, 6, 4, clients.length || 1];
  const weeklyMessages = [12, 18, 9, 22, 15, 7, stats.messagesToday || 1];

  // Weekly activity data for Recharts bar chart
  const weeklyActivityData = [
    { day: "Lun", mensajes: 5 },
    { day: "Mar", mensajes: 12 },
    { day: "Mié", mensajes: 8 },
    { day: "Jue", mensajes: 18 },
    { day: "Vie", mensajes: 14 },
    { day: "Sáb", mensajes: 6 },
    { day: "Dom", mensajes: 3 },
  ];
  const totalWeeklyMessages = weeklyActivityData.reduce((sum, d) => sum + d.mensajes, 0);

  const statCards = [
    { label: "Total Clientes", value: stats.totalClients, icon: Users, color: "text-[#128C7E]", bg: "bg-[#128C7E]/10", borderColor: "border-l-[#128C7E]", chartData: weeklyClients, chartColor: "#128C7E", trend: clients.length > 0 ? "+" : null },
    { label: "Mensajes Hoy", value: stats.messagesToday, icon: MessageSquare, color: "text-[#25D366]", bg: "bg-[#25D366]/10", borderColor: "border-l-[#25D366]", chartData: weeklyMessages, chartColor: "#25D366" },
    { label: "Plantillas", value: stats.totalTemplates, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", borderColor: "border-l-amber-500" },
    { label: "Seguimientos", value: stats.pendingFollowUps, icon: Clock, color: overdueFollowUps.length > 0 ? "text-red-500" : "text-violet-500", bg: overdueFollowUps.length > 0 ? "bg-red-500/10" : "bg-violet-500/10", borderColor: overdueFollowUps.length > 0 ? "border-l-red-500" : "border-l-violet-500" },
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
            <Skeleton key={i} className="h-32 rounded-xl" />
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

  const getWeekDay = () => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[new Date().getDay()];
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-5 page-enter">
      {/* Greeting & Date */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {getWeekDay()}, {getTodayDate()}
          </p>
        </div>
        {!user?.isPro && stats.totalClients === 0 && (
          <div className="animate-float">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-white">
              <Rocket className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>

      {/* Demo mode notice */}
      {!isAuthenticated && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 card-hover press-effect">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Modo Demo</p>
            <p className="text-[11px] text-muted-foreground">
              Datos guardados localmente. <span className="text-[#25D366] font-medium cursor-pointer hover:underline">Inicia sesión</span> para sincronizar.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      )}

      {/* Pro Banner */}
      {user?.isPro && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 p-4 card-hover gradient-border">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Crown className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gradient-wa">Licencia Pro Activa</p>
            <p className="text-xs text-muted-foreground">Acceso ilimitado a todas las funciones</p>
          </div>
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold shrink-0">
            <Star className="mr-1 h-3 w-3" /> PRO
          </Badge>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.label}
            className={`border-0 shadow-sm bg-card card-hover border-l-4 ${stat.borderColor} stagger-item`}
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} transition-transform hover:scale-110`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <div className="flex items-center gap-0.5 bg-[#25D366]/10 px-1.5 py-0.5 rounded-full">
                    <ArrowUpRight className="h-3 w-3 text-[#25D366]" />
                    <span className="text-[10px] font-bold text-[#25D366]">Nuevo</span>
                  </div>
                )}
                {!stat.trend && stat.chartData && (
                  <MiniBarChart data={stat.chartData} color={stat.chartColor} />
                )}
              </div>
              <p className="text-2xl font-bold tracking-tight animate-count-up">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {clients.length > 0 && (
        <div className="stagger-item" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Acciones Rápidas
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <Button
              variant="outline"
              className="h-auto py-3.5 flex-col gap-2 rounded-xl hover:bg-[#25D366]/5 hover:border-[#25D366]/30 transition-all press-effect"
            >
              <div className="h-9 w-9 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-[#25D366]" />
              </div>
              <span className="text-[10px] font-semibold">Nuevo Cliente</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3.5 flex-col gap-2 rounded-xl hover:bg-[#128C7E]/5 hover:border-[#128C7E]/30 transition-all press-effect"
            >
              <div className="h-9 w-9 rounded-lg bg-[#128C7E]/10 flex items-center justify-center">
                <Send className="h-4 w-4 text-[#128C7E]" />
              </div>
              <span className="text-[10px] font-semibold">Enviar Msg</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3.5 flex-col gap-2 rounded-xl hover:bg-amber-500/5 hover:border-amber-500/30 transition-all press-effect"
            >
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-[10px] font-semibold">Ver Reportes</span>
            </Button>
          </div>
        </div>
      )}

      {/* Weekly Activity Chart */}
      {clients.length > 0 && (
        <Card className="border-0 shadow-sm card-hover stagger-item" style={{ animationDelay: "0.35s" }}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#25D366]" />
                </div>
                Actividad Semanal
              </h3>
              <Badge variant="secondary" className="text-[10px] font-medium">
                Mensajes
              </Badge>
            </div>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#25D366" stopOpacity={1} />
                      <stop offset="100%" stopColor="#128C7E" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                    itemStyle={{ color: "#25D366" }}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                  />
                  <Bar
                    dataKey="mensajes"
                    fill="url(#waBarGradient)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              Total: <span className="font-semibold text-foreground">{totalWeeklyMessages}</span> mensajes esta semana
            </p>
          </CardContent>
        </Card>
      )}

      {/* Usage Progress (Free plan) */}
      {!user?.isPro && clients.length > 0 && (
        <Card className={`border-0 shadow-sm card-hover ${isNearLimit ? "border-l-4 border-l-amber-500" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isNearLimit ? "bg-amber-500/10" : "bg-[#25D366]/10"}`}>
                  <Zap className={`h-4 w-4 ${isNearLimit ? "text-amber-500" : "text-[#25D366]"}`} />
                </div>
                <span className="text-xs font-semibold">Uso del Plan Gratis</span>
              </div>
              <span className={`text-xs font-bold ${isNearLimit ? "text-amber-500" : "text-muted-foreground"}`}>
                {stats.totalClients}/{freeLimit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 animate-progress-fill ${isNearLimit ? "bg-amber-500" : "bg-gradient-to-r from-[#25D366] to-[#128C7E]"}`}
                style={{ width: `${clientUsage}%` }}
              />
            </div>
            {isNearLimit && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Cerca del límite. <span className="text-[#128C7E] font-medium cursor-pointer hover:underline">Actualiza a Pro</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overdue Follow-ups Alert */}
      {overdueFollowUps.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500 card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 animate-pulse-soft">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {overdueFollowUps.length} Seguimiento{overdueFollowUps.length > 1 ? "s" : ""} Vencido{overdueFollowUps.length > 1 ? "s" : ""}
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              {overdueFollowUps.slice(0, 3).map((fu) => (
                <div key={fu.id} className="flex items-center gap-2 text-xs bg-red-50 dark:bg-red-500/5 rounded-lg p-2.5">
                  <Clock className="h-3 w-3 text-red-400 shrink-0" />
                  <span className="font-medium text-foreground truncate flex-1">{fu.title}</span>
                  <span className="text-red-400 shrink-0 text-[10px] font-medium">{getClientName(fu.clientId)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline - Recent Activity */}
      {recentMessages.length > 0 && (
        <Card className="border-0 shadow-sm card-hover">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-[#25D366]" />
                </div>
                Actividad Reciente
              </h3>
              <Badge variant="secondary" className="text-[10px] font-medium">
                {recentMessages.length} mensajes
              </Badge>
            </div>
            <div className="timeline-line space-y-4">
              {recentMessages.map((msg, idx) => (
                <div key={msg.id} className="timeline-item stagger-item" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <div className="timeline-dot border-[#25D366] status-glow-green" />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium">{getClientName(msg.clientId)}</span>
                      <div className="wa-bubble-sent rounded-lg px-3 py-2 mt-1.5 max-w-[280px]">
                        <p className="text-[11px] text-foreground/90 line-clamp-2 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{formatDate(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Clients */}
      {recentClients.length > 0 && (
        <Card className="border-0 shadow-sm card-hover">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#128C7E]/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#128C7E]" />
                </div>
                Clientes Recientes
              </h3>
              <Badge variant="secondary" className="text-[10px] font-medium">
                {clients.length} total
              </Badge>
            </div>
            <div className="space-y-1">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm">
                    {(client.name || client.phone || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{client.name || "Sin nombre"}</p>
                    <p className="text-[10px] text-muted-foreground">{formatPhoneDisplay(client.phone) || "—"}</p>
                  </div>
                  {client.tags.length > 0 && (
                    <Badge className={`text-[9px] px-1.5 py-0 h-4 font-bold ${
                      client.tags.includes("VIP") ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
                      client.tags.includes("Nuevo") ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}>
                      {client.tags[0]}
                    </Badge>
                  )}
                  {client.totalMessages > 0 && (
                    <span className="text-[10px] text-muted-foreground/50 shrink-0">
                      {client.totalMessages}msj
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Follow-ups (if any) */}
      {completedFollowUps.length > 0 && (
        <Card className="border-0 shadow-sm card-hover">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                Completados
              </h3>
            </div>
            <div className="space-y-1.5">
              {completedFollowUps.map((fu) => (
                <div key={fu.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-muted-foreground truncate flex-1 line-through">{fu.title}</span>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">{getClientName(fu.clientId)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tag Distribution */}
      {stats.tagDistribution.length > 0 && (
        <Card className="border-0 shadow-sm card-hover">
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#128C7E]/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-[#128C7E]" />
              </div>
              Distribución de Etiquetas
            </h3>
            <div className="space-y-3">
              {stats.tagDistribution.map((item, index) => {
                const maxCount = stats.tagDistribution[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const tagColors: Record<string, string> = {
                  Nuevo: "bg-[#25D366]",
                  Pendiente: "bg-amber-500",
                  VIP: "bg-purple-500",
                };
                return (
                  <div key={item.tag} className="flex items-center gap-3 stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="w-20 sm:w-24 text-xs font-medium truncate">{item.tag}</div>
                    <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full animate-progress-fill ${tagColors[item.tag] || "bg-[#128C7E]"}`}
                        style={{ width: `${pct}%`, animationDelay: `${index * 80}ms` }}
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

      {/* Onboarding CTA - Empty State */}
      {!user?.isPro && stats.totalClients === 0 && (
        <div className="space-y-4 stagger-item" style={{ animationDelay: "0.4s" }}>
          {/* Getting Started Steps */}
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                  <Rocket className="h-4 w-4 text-[#25D366]" />
                </div>
                ¿Cómo empezar?
              </h3>
              <div className="space-y-3">
                {[
                  { step: 1, text: "Agrega tu primer cliente", icon: UserPlus, color: "bg-[#25D366]/10 text-[#25D366]" },
                  { step: 2, text: "Crea plantillas de mensajes", icon: FileText, color: "bg-amber-500/10 text-amber-500" },
                  { step: 3, text: "Envía mensajes por WhatsApp", icon: Send, color: "bg-[#128C7E]/10 text-[#128C7E]" },
                  { step: 4, text: "Programa seguimientos", icon: Clock, color: "bg-violet-500/10 text-violet-500" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{item.text}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50 font-mono">Paso {item.step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feature showcase card */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 right-4 w-16 h-16 bg-white/3 rounded-full" />
            <CardContent className="p-5 relative">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-amber-300" />
                <h3 className="text-sm font-bold">Comienza a gestionar tus clientes</h3>
              </div>
              <p className="text-xs text-white/80 mb-4 leading-relaxed">
                Agrega tu primer cliente y envía mensajes de WhatsApp de forma profesional.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Phone, text: "WhatsApp seguro" },
                  { icon: Users, text: "CRM completo" },
                  { icon: FileText, text: "Plantillas" },
                  { icon: Send, text: "Envío masivo" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
                    <f.icon className="h-3 w-3 text-white/80" />
                    <span className="text-[10px] font-medium text-white/90">{f.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade CTA */}
      {!user?.isPro && stats.totalClients > 5 && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-4 sm:p-5 relative">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-300" />
              <h3 className="text-sm font-bold">Desbloquea el Plan Pro</h3>
            </div>
            <p className="text-xs text-white/80 mb-3">
              Clientes ilimitados, plantillas ilimitadas, seguimientos avanzados y más.
            </p>
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 cursor-pointer transition-colors">
              S/99 pago único · Activa con código
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
