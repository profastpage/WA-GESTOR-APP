"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  User,
  Lock,
  Palette,
  Shield,
  Info,
  Trash2,
  MessageCircle,
  Bell,
  Globe,
  Check,
  Pencil,
  Loader2,
  Moon,
  Sun,
  Save,
  Crown,
  HardDriveDownload,
  HardDriveUpload,
} from "lucide-react";

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

export function SettingsView() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Edit profile state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSaveName = async () => {
    if (!editName.trim()) {
      toast({ title: "Error", description: "El nombre no puede estar vacío" });
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, name: editName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        const stored = localStorage.getItem("wa_session");
        if (stored) {
          const session = JSON.parse(stored);
          session.name = editName.trim();
          localStorage.setItem("wa_session", JSON.stringify(session));
          useAuthStore.setState((s) => ({
            ...s,
            user: s.user ? { ...s.user, name: editName.trim() } : null,
          }));
        }
        setIsEditingName(false);
        toast({ title: "Perfil actualizado", description: "Tu nombre ha sido cambiado correctamente" });
      } else {
        toast({ title: "Error", description: data.error || "No se pudo actualizar el nombre" });
      }
    } catch {
      toast({ title: "Error", description: "Error de conexión" });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Todos los campos son requeridos" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas nuevas no coinciden" });
      return;
    }
    if (newPassword.length < 4) {
      toast({ title: "Error", description: "La nueva contraseña debe tener al menos 4 caracteres" });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
        toast({ title: "Contraseña cambiada", description: "Tu contraseña ha sido actualizada correctamente" });
      } else {
        toast({ title: "Error", description: data.error || "No se pudo cambiar la contraseña" });
      }
    } catch {
      toast({ title: "Error", description: "Error de conexión" });
    } finally {
      setChangingPassword(false);
    }
  };

  const isDark = theme === "dark";

  // Backup/Restore state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImportData = useRef<any>(null);

  const handleExportBackup = () => {
    const backupKeys = ["wa_demo_clients", "wa_demo_templates", "wa_demo_messages", "wa_demo_followups", "wa_session"];
    const backup: Record<string, unknown> = {};
    for (const key of backupKeys) {
      const val = localStorage.getItem(key);
      if (val) {
        try { backup[key] = JSON.parse(val); } catch { backup[key] = val; }
      }
    }
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wa-manager-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Respaldo exportado", description: "Tu archivo de respaldo ha sido descargado" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        pendingImportData.current = data;
        // The AlertDialog will handle confirmation via handleConfirmImport
      } catch {
        toast({ title: "Error", description: "El archivo seleccionado no es un JSON válido", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleConfirmImport = () => {
    const data = pendingImportData.current;
    if (!data) {
      toast({ title: "Error", description: "No se encontraron datos para importar", variant: "destructive" });
      return;
    }
    try {
      const keys = ["wa_demo_clients", "wa_demo_templates", "wa_demo_messages", "wa_demo_followups", "wa_session"];
      let restoredCount = 0;
      for (const key of keys) {
        if (data[key] !== undefined) {
          localStorage.setItem(key, JSON.stringify(data[key]));
          restoredCount++;
        }
      }
      pendingImportData.current = null;
      toast({ title: "Respaldo restaurado", description: `Se restauraron ${restoredCount} categorías de datos correctamente` });
    } catch {
      toast({ title: "Error", description: "No se pudo restaurar el respaldo. Verifica el archivo.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Configuración</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Gestiona tu cuenta y preferencias</p>
        </div>
      </div>

      {/* User Profile Card */}
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#075E54] flex items-center justify-center text-white text-xl font-bold shadow-md">
                {getInitials(user?.name || "")}
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm max-w-[200px]"
                      placeholder="Tu nombre"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    />
                    <Button
                      size="sm"
                      className="h-8 bg-[#25D366] text-white hover:bg-[#128C7E]"
                      onClick={handleSaveName}
                      disabled={savingName}
                    >
                      {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => {
                        setIsEditingName(false);
                        setEditName(user?.name || "");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold truncate">
                      {user?.name || "Usuario"}
                    </h3>
                    <button
                      onClick={() => {
                        setEditName(user?.name || "");
                        setIsEditingName(true);
                      }}
                      className="p-1 rounded-md hover:bg-muted transition-colors"
                      title="Editar nombre"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{user?.email || "—"}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className={`text-[10px] font-semibold ${
                    user?.role === "admin"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {user?.role === "admin" ? (
                    <><Shield className="h-3 w-3 mr-1" /> Admin</>
                  ) : (
                    <><User className="h-3 w-3 mr-1" /> Cliente</>
                  )}
                </Badge>
                {user?.isPro && (
                  <Badge className="bg-[#25D366]/15 text-[#128C7E] dark:text-[#25D366] border-[#25D366]/20 text-[10px] font-semibold">
                    <Crown className="h-3 w-3 mr-1" /> PRO
                  </Badge>
                )}
                {user?.approved !== false && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-semibold">
                    <Check className="h-3 w-3 mr-1" /> Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                <Lock className="h-[18px] w-[18px] text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Cambiar Contraseña</h3>
                <p className="text-[10px] text-muted-foreground">Actualiza tu contraseña de acceso</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              {showPasswordForm ? "Ocultar" : "Cambiar"}
            </Button>
          </div>

          {showPasswordForm && (
            <div className="space-y-3 pt-2">
              <Separator />
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Contraseña actual</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nueva contraseña</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Confirmar nueva contraseña</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="h-9 text-sm"
                  />
                </div>
                <Button
                  className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] h-10 text-sm font-semibold"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Actualizar Contraseña
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Toggle */}
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                <Palette className="h-[18px] w-[18px] text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Tema de la App</h3>
                <p className="text-[10px] text-muted-foreground">Personaliza la apariencia visual</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Sun className={`h-4 w-4 transition-colors ${isDark ? "text-muted-foreground" : "text-amber-500"}`} />
              <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                className="data-[state=checked]:bg-[#128C7E]"
              />
              <Moon className={`h-4 w-4 transition-colors ${isDark ? "text-blue-400" : "text-muted-foreground"}`} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {[
              { label: "Claro", value: "light" },
              { label: "Oscuro", value: "dark" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                  theme === t.value
                    ? "border-[#25D366] bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366]"
                    : "border-muted bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications & Preferences (visual card) */}
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Bell className="h-[18px] w-[18px] text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Notificaciones</h3>
              <p className="text-[10px] text-muted-foreground">Configura tus alertas</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm">Recordatorios de seguimiento</p>
                <p className="text-[10px] text-muted-foreground">Alertas cuando haya seguimientos pendientes</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#25D366]" />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm">Resumen diario</p>
                <p className="text-[10px] text-muted-foreground">Resumen de actividad por correo</p>
              </div>
              <Switch className="data-[state=checked]:bg-[#25D366]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Backup/Restore */}
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10">
              <HardDriveDownload className="h-[18px] w-[18px] text-teal-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Respaldo de Datos</h3>
              <p className="text-[10px] text-muted-foreground">Exporta e importa todos tus datos</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-xs h-9 press-effect"
              onClick={handleExportBackup}
            >
              <HardDriveDownload className="mr-1.5 h-3.5 w-3.5" />
              Exportar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 text-xs h-9 press-effect"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <HardDriveUpload className="mr-1.5 h-3.5 w-3.5" />
                  Importar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Restaurar respaldo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esto reemplazará todos tus datos actuales (clientes, plantillas, mensajes y seguimientos) con los datos del archivo de respaldo. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-[#25D366] text-white hover:bg-[#128C7E]"
                    onClick={handleConfirmImport}
                  >
                    Sí, restaurar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Compliance Notice */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-[#075E54]/5 to-[#128C7E]/5 border border-[#25D366]/10">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#25D366]/15 shrink-0 mt-0.5">
              <MessageCircle className="h-[18px] w-[18px] text-[#25D366]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#128C7E] dark:text-[#25D366]">
                Aviso de Cumplimiento de WhatsApp
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                WA Manager no envía mensajes automáticamente. Todos los mensajes se abren a través
                de enlaces directos de WhatsApp (<span className="font-mono text-[10px]">wa.me</span>),
                lo que significa que tú decides cuándo y qué enviar. Esto cumple con las políticas
                de WhatsApp Business y protege tu número de ser bloqueado por spam.
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <Shield className="h-3.5 w-3.5 text-[#25D366]" />
                <span className="text-[10px] font-medium text-[#128C7E] dark:text-[#25D366]">
                  100% conforme con los Términos de WhatsApp
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10">
              <Info className="h-[18px] w-[18px] text-sky-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Acerca de</h3>
              <p className="text-[10px] text-muted-foreground">Información de la aplicación</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Versión</span>
              <Badge variant="outline" className="text-[10px] font-mono">v2.1.0</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Framework</span>
              <span className="text-xs font-medium">Next.js 16 + TypeScript</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Base de datos</span>
              <span className="text-xs font-medium">SQLite + Prisma</span>
            </div>
            <Separator />
            <div className="flex items-center gap-2 pt-1">
              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                Hecho con 💚 para emprendedores peruanos
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-sm border-t-2 border-t-red-500 bg-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
              <Trash2 className="h-[18px] w-[18px] text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Zona de Peligro</h3>
              <p className="text-[10px] text-muted-foreground">Acciones irreversibles</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-3 mt-2">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Eliminar cuenta</p>
              <p className="text-[10px] text-red-500/80">Esta acción no se puede deshacer</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 h-8 text-xs"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente tu cuenta y todos los datos asociados,
                    incluyendo clientes, plantillas, mensajes y seguimientos. Esta operación no
                    se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => {
                      toast({
                        title: "Operación cancelada",
                        description: "Por seguridad, la eliminación de cuenta está deshabilitada en esta versión.",
                      });
                    }}
                  >
                    Sí, eliminar mi cuenta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
