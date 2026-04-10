"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useClients, useTemplates, useFollowUps } from "@/hooks/use-data";
import { DashboardView } from "./dashboard-view";
import { ClientsView } from "./clients-view";
import { TemplatesView } from "./templates-view";
import { FollowUpsView } from "./follow-ups-view";
import { PricingView } from "./pricing-view";
import { SettingsView } from "./settings-view";
import { AdminPanel } from "./admin-panel";
import { LoginDialog } from "./login-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Users, FileText, Clock, Crown, ShieldCheck, Settings,
  Download, LogOut, LogIn, Moon, Sun, ChevronDown, Menu, X, Bell,
  TrendingUp, MessageCircle, Plus,
} from "lucide-react";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

type View = "dashboard" | "clients" | "templates" | "followups" | "pricing" | "settings" | "admin";

export function AppShell() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isLoading, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { clients } = useClients();
  const { templates } = useTemplates();
  const { followUps } = useFollowUps();

  useEffect(() => {
    useAuthStore.getState().checkSession();
  }, []);

  const pendingFollowUpsCount = followUps.filter(f => !f.completed).length;
  const hasNotifications = pendingFollowUpsCount > 0;

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clientes_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const headers = ["Nombre", "Teléfono", "Email", "Empresa", "Etiquetas"];
      const rows = clients.map(c => [`"${c.name}"`, c.phone, c.email, c.company, `"${c.tags.join(", ")}"`]);
      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clientes_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const navItems: { id: View; label: string; icon: React.ElementType; show?: boolean; badge?: number }[] = [
    { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "templates", label: "Plantillas", icon: FileText },
    { id: "followups", label: "Seguimiento", icon: Clock, badge: pendingFollowUpsCount > 0 ? pendingFollowUpsCount : undefined },
    { id: "pricing", label: "Precios", icon: Crown },
    { id: "settings", label: "Ajustes", icon: Settings },
    { id: "admin", label: "Admin", icon: ShieldCheck, show: user?.role === "admin" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="h-14 border-b flex items-center px-4 gap-3">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case "dashboard": return <DashboardView />;
      case "clients": return <ClientsView />;
      case "templates": return <TemplatesView />;
      case "followups": return <FollowUpsView />;
      case "pricing": return <PricingView />;
      case "settings": return <SettingsView />;
      case "admin": return user?.role === "admin" ? <AdminPanel /> : <DashboardView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-40 glass-header bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white shadow-lg shadow-[#075E54]/20">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors" aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button onClick={() => setActiveView("dashboard")} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold leading-none tracking-tight">WA Manager</h1>
                <p className="text-[10px] text-white/60 leading-none mt-0.5">Gestión de Clientes</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {isAuthenticated && user && (
              <>
                {user.isPro && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/20">
                    <Crown className="h-3 w-3" /> PRO
                  </span>
                )}
                <span className="hidden lg:inline text-xs text-white/70 max-w-[140px] truncate font-medium">{user.email}</span>
              </>
            )}

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            {hasNotifications && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full relative" onClick={() => setActiveView("followups")} aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-1 animate-bounce-in">
                  {pendingFollowUpsCount}
                </span>
              </Button>
            )}

            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {user && (
                    <div className="px-2 py-1.5 border-b mb-1">
                      <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                      {user.isPro && (
                        <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5"><Crown className="h-3 w-3" /> Licencia Pro Activa</p>
                      )}
                    </div>
                  )}
                  <DropdownMenuItem onClick={() => setActiveView("dashboard")} className="cursor-pointer"><TrendingUp className="mr-2 h-4 w-4" /> Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer"><Download className="mr-2 h-4 w-4" /> Exportar CSV</DropdownMenuItem>
                  {user?.role === "admin" && <DropdownMenuItem onClick={() => setActiveView("admin")} className="cursor-pointer"><ShieldCheck className="mr-2 h-4 w-4" /> Panel Admin</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer focus:text-red-600"><LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isAuthenticated && (
              <Button size="sm" className="h-8 bg-white/20 text-white hover:bg-white/30 text-xs font-semibold rounded-lg btn-wa" onClick={() => setLoginOpen(true)}>
                <LogIn className="mr-1.5 h-3.5 w-3.5" /> Ingresar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <div className="hidden md:block border-b bg-card/80 glass-header sticky top-14 z-30">
        <div className="flex items-center gap-1 px-4 overflow-x-auto">
          {navItems.filter(item => item.show !== false).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap press-effect ${
                activeView === item.id
                  ? "bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366] shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.badge && item.badge > 0 && (
                <span className={`ml-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-bold px-1 ${
                  activeView === item.id ? "bg-[#128C7E] text-white dark:bg-[#25D366] dark:text-[#075E54]" : "bg-red-500 text-white"
                }`}>{item.badge}</span>
              )}
              {activeView === item.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#25D366]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-card animate-scale-in shadow-lg">
          <div className="p-2 space-y-1">
            {navItems.filter(item => item.show !== false).map((item) => (
              <button key={item.id} onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeView === item.id ? "bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366]" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge && item.badge > 0 && <Badge className="ml-auto bg-red-500 text-white text-[9px] h-5 min-w-[20px] px-1.5">{item.badge}</Badge>}
              </button>
            ))}
            {clients.length > 0 && (
              <>
                <div className="h-px bg-border my-1" />
                <button onClick={() => { handleExportCSV(); setMobileMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Download className="h-4 w-4" /> Exportar CSV
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 pb-24 md:pb-6" key={activeView}>
          {renderView()}
        </div>
      </main>

      {/* Floating WhatsApp Action Button (Desktop) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col gap-2">
        <Button
          className="h-12 w-12 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg float-action p-0"
          onClick={() => setActiveView("clients")}
          title="Nuevo cliente"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 glass-header border-t z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.filter(i => i.show !== false).slice(0, 4).map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all press-effect ${
              activeView === item.id ? "text-[#25D366]" : "text-muted-foreground"
            }`}>
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white px-0.5">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${activeView === item.id ? "text-[#25D366]" : ""}`}>{item.label}</span>
              {activeView === item.id && <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#25D366]" />}
            </button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all press-effect ${
                ["pricing", "settings", "admin"].includes(activeView) ? "text-[#25D366]" : "text-muted-foreground"
              }`}>
                <div className="relative"><Settings className="h-5 w-5" /></div>
                <span className={`text-[10px] font-medium ${["pricing", "settings", "admin"].includes(activeView) ? "text-[#25D366]" : ""}`}>Más</span>
                {["pricing", "settings", "admin"].includes(activeView) && <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#25D366]" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="w-52 mb-2">
              <DropdownMenuItem onClick={() => setActiveView("pricing")} className="cursor-pointer"><Crown className="mr-2 h-4 w-4 text-amber-500" /> Precios</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveView("settings")} className="cursor-pointer"><Settings className="mr-2 h-4 w-4" /> Ajustes</DropdownMenuItem>
              {user?.role === "admin" && <><DropdownMenuSeparator /><DropdownMenuItem onClick={() => setActiveView("admin")} className="cursor-pointer"><ShieldCheck className="mr-2 h-4 w-4" /> Panel Admin</DropdownMenuItem></>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer"><Download className="mr-2 h-4 w-4" /> Exportar CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
