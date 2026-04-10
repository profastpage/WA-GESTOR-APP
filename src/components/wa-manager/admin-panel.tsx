"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldCheck,
  Users,
  Check,
  X,
  Trash2,
  Key,
  Copy,
  RefreshCw,
  Crown,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  approved: boolean;
  isPro: boolean;
  createdAt: string;
}

export function AdminPanel() {
  const { user } = useAuthStore();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [licenseKeys, setLicenseKeys] = useState<{ id: string; key: string; used: boolean; usedByEmail?: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [genCount, setGenCount] = useState(5);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.filter((u: AdminUser) => u.role !== "deleted"));
      }
    } catch { /* silent */ }
  }, []);

  const fetchLicenses = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/licenses");
      if (res.ok) {
        const data = await res.json();
        setLicenseKeys(data);
      }
    } catch { /* silent */ }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let mounted = true;
    Promise.all([fetchUsers(), fetchLicenses()]).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [fetchUsers, fetchLicenses]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) await fetchUsers();
    } catch { /* silent */ }
  };

  const handleGenerateKeys = async () => {
    setGenLoading(true);
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", count: genCount }),
      });
      if (res.ok) {
        await fetchLicenses();
      }
    } catch { /* silent */ }
    setGenLoading(false);
  };

  const handleCopyKey = async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch { /* silent */ }
  };

  if (user?.role !== "admin") return null;

  const stats = {
    total: adminUsers.length,
    approved: adminUsers.filter(u => u.approved).length,
    pending: adminUsers.filter(u => !u.approved).length,
  };

  return (
    <div className="space-y-5 page-enter">
      <div>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-red-500" /> Panel de Administración
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Gestión de usuarios y licencias</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-foreground" },
              { label: "Aprobados", value: stats.approved, color: "text-[#25D366]" },
              { label: "Pendientes", value: stats.pending, color: "text-amber-500" },
            ].map((s) => (
              <Card key={s.label} className="border-0 shadow-sm text-center">
                <CardContent className="p-3">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Users List */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Usuarios ({stats.total})
            </h3>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {adminUsers.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">No hay usuarios registrados</p>
                ) : (
                  adminUsers.map((u) => (
                    <Card key={u.id} className={`border-0 shadow-sm border-l-4 ${u.approved ? "border-l-[#25D366]" : "border-l-amber-500"}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-semibold truncate">{u.name || u.email}</span>
                              {u.role === "admin" && <Badge className="text-[9px] px-1.5 h-4 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">ADMIN</Badge>}
                              {u.isPro && <Crown className="h-3 w-3 text-amber-500" />}
                              {u.approved ? (
                                <Badge className="text-[9px] px-1.5 h-4 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Aprobado</Badge>
                              ) : (
                                <Badge className="text-[9px] px-1.5 h-4 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Pendiente</Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{u.email}</p>
                          </div>
                          {u.role !== "admin" && (
                            <div className="flex gap-1 shrink-0">
                              {!u.approved ? (
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] text-[#25D366] hover:bg-[#25D366]/10" onClick={() => handleUserAction(u.id, "approve")}>
                                  <Check className="h-3 w-3 mr-0.5" /> Aprobar
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] text-amber-500 hover:bg-amber-50" onClick={() => handleUserAction(u.id, "revoke")}>
                                  <X className="h-3 w-3 mr-0.5" /> Revocar
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-7 text-[10px] text-red-400 hover:bg-red-50" onClick={() => { if (confirm("¿Eliminar usuario?")) handleUserAction(u.id, "delete"); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* License Generator */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-amber-500" /> Generador de Licencias
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={genCount}
                    onChange={(e) => setGenCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className="w-20 h-9 text-sm text-center"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">claves</span>
                </div>
                <Button
                  size="sm"
                  className="bg-[#25D366] text-white hover:bg-[#128C7E] flex-1"
                  onClick={handleGenerateKeys}
                  disabled={genLoading}
                >
                  {genLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Key className="mr-1.5 h-3.5 w-3.5" />}
                  Generar
                </Button>
              </div>

              {licenseKeys.length > 0 && (
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-1.5">
                    {licenseKeys.slice(0, 20).map((lk) => (
                      <div key={lk.id} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                        <code className="flex-1 text-xs font-mono truncate">{lk.key}</code>
                        <Badge className={`text-[9px] px-1.5 h-4 ${lk.used ? "bg-muted text-muted-foreground" : "bg-[#25D366]/10 text-[#25D366]"}`}>
                          {lk.used ? "Usada" : "Disponible"}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleCopyKey(lk.key, lk.id)}
                        >
                          {copiedKey === lk.id ? <Check className="h-3 w-3 text-[#25D366]" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
