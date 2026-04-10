"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User, Eye, EyeOff, AlertTriangle, MessageCircle, Shield } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = mode === "login"
        ? await login(email, password)
        : await register(email, password, name);

      if (result.success) {
        onOpenChange(false);
        resetForm();
      } else {
        setError(result.error || "Error desconocido");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden glass-card border-glow-green">
        {/* WhatsApp Gradient Header */}
        <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] px-6 py-6">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-white">
              {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </DialogTitle>
            <DialogDescription className="text-center text-white/75">
              {mode === "login"
                ? "Accede a tu cuenta para sincronizar tus datos"
                : "Regístrate para comenzar a gestionar tus clientes"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive flex items-center gap-2.5 animate-fade-in-up-delay">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] btn-wa font-semibold" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              className="text-muted-foreground hover:text-[#25D366] transition-colors"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            >
              {mode === "login"
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </form>

        <div className="px-6 pb-4 space-y-2">
          <p className="text-center text-xs font-medium text-muted-foreground">Al registrarte obtienes:</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: "📁", label: "CRM completo" },
              { icon: "☁️", label: "Datos en la nube" },
              { icon: "📱", label: "Multi-dispositivo" },
            ].map((f) => (
              <div key={f.label} className="rounded-lg bg-muted/50 p-2">
                <div className="text-lg">{f.icon}</div>
                <div className="text-[10px] text-muted-foreground">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Compliance Notice */}
        <div className="mx-6 mb-6 rounded-lg bg-gradient-to-br from-[#075E54]/5 to-[#128C7E]/5 border border-[#25D366]/10 p-3">
          <div className="flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-[#128C7E] dark:text-[#25D366] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Solo abrimos enlaces de WhatsApp, nunca enviamos automáticamente
              </p>
              <div className="flex items-center gap-1 mt-1">
                <MessageCircle className="h-3 w-3 text-[#25D366]" />
                <span className="text-[10px] font-medium text-[#128C7E] dark:text-[#25D366]">
                  100% conforme con los Términos de WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
