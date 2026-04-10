"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useClients, useTemplates, useFollowUps, useMessages } from "@/hooks/use-data";
import { DashboardView } from "./dashboard-view";
import { ClientsView } from "./clients-view";
import { TemplatesView } from "./templates-view";
import { FollowUpsView } from "./follow-ups-view";
import { PricingView } from "./pricing-view";
import { AdminPanel } from "./admin-panel";
import { LoginDialog } from "./login-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  Crown,
  ShieldCheck,
  Download,
  LogOut,
  LogIn,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatPhoneDisplay } from "@/lib/whatsapp";

type View = "dashboard" | "clients" | "templates" | "followups" | "pricing" | "admin";

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
      // Fallback for demo
      const headers = ["Nombre", "Teléfono", "Email", "Empresa", "Etiquetas"];
      const rows = clients.map(c => [
        `"${c.name}"`, c.phone, c.email, c.company, `"${c.tags.join(", ")}"`
      ]);
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

  const navItems: { id: View; label: string; icon: React.ElementType; show?: boolean }[] = [
    { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "templates", label: "Plantillas", icon: FileText },
    { id: "followups", label: "Seguimiento", icon: Clock },
    { id: "pricing", label: "Precios", icon: Crown },
    { id: "admin", label: "Admin", icon: ShieldCheck, show: user?.role === "admin" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="h-14 border-b flex items-center px-4 gap-3">
          <Skeleton className="h-8 w-32" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
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
      case "admin": return user?.role === "admin" ? <AdminPanel /> : <DashboardView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white shadow-lg">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold leading-none">WA Manager</h1>
                <p className="text-[10px] text-white/60 leading-none mt-0.5">Gestión de Clientes</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user && (
              <>
                {user.isPro && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full">
                    <Crown className="h-3 w-3" /> PRO
                  </span>
                )}
                <span className="hidden md:inline text-xs text-white/70 max-w-[120px] truncate">{user.email}</span>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isAuthenticated && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem onClick={() => setActiveView("admin")}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Panel Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isAuthenticated && (
              <Button
                size="sm"
                className="h-8 bg-white/20 text-white hover:bg-white/30 text-xs font-semibold"
                onClick={() => setLoginOpen(true)}
              >
                <LogIn className="mr-1.5 h-3.5 w-3.5" /> Ingresar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Desktop sidebar + Mobile dropdown */}
      {/* Desktop Navigation (top bar below header) */}
      <div className="hidden md:block border-b bg-card">
        <div className="flex items-center gap-1 px-4 overflow-x-auto">
          {navItems.filter(item => item.show !== false).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeView === item.id
                  ? "bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          {clients.length > 0 && (
            <div className="flex-1" />
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-card animate-scale-in">
          <div className="p-2 space-y-1">
            {navItems.filter(item => item.show !== false).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeView === item.id
                    ? "bg-[#25D366]/10 text-[#128C7E]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            {clients.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" /> Exportar CSV
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 pb-24 md:pb-6">
          {renderView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                activeView === item.id
                  ? "text-[#128C7E] dark:text-[#25D366]"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                ["pricing", "admin"].includes(activeView)
                  ? "text-[#128C7E] dark:text-[#25D366]"
                  : "text-muted-foreground"
              }`}>
                <Crown className="h-5 w-5" />
                <span className="text-[10px] font-medium">Más</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="w-48 mb-2">
              <DropdownMenuItem onClick={() => setActiveView("pricing")}>
                <Crown className="mr-2 h-4 w-4" /> Precios
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => setActiveView("admin")}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Panel Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" /> Exportar CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
