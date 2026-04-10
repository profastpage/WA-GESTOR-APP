"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, CheckCircle2, PartyPopper } from "lucide-react";

interface LicenseActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LicenseActivationDialog({ open, onOpenChange }: LicenseActivationDialogProps) {
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { user } = useAuthStore();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        // Update local user state
        if (user) {
          localStorage.setItem("wa_session", JSON.stringify({ ...user, isPro: true }));
          useAuthStore.setState({ user: { ...user, isPro: true } });
        }
      } else {
        setError(data.error || "Clave inválida");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setKey("");
    setError("");
    setSuccess(false);
    onOpenChange(false);
  };

  const formatKey = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const parts = clean.match(/.{1,4}/g);
    return parts ? parts.slice(0, 4).join("-") : "";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/20">
              <PartyPopper className="h-8 w-8 text-[#25D366]" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#25D366]">¡Licencia Activada!</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Tu cuenta ha sido actualizada a <span className="font-semibold text-[#128C7E]">Pro</span>. Disfruta de todas las funciones sin límites.
            </p>
            <Button onClick={handleClose} className="bg-[#25D366] text-white hover:bg-[#128C7E]">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              ¡Genial!
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Activar Licencia Pro</DialogTitle>
              <DialogDescription className="text-center">
                Ingresa tu clave de licencia para desbloquear todas las funciones
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleActivate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Clave de licencia</label>
                <Input
                  placeholder="WA-PRO-XXXX-XXXX"
                  value={key}
                  onChange={(e) => setKey(formatKey(e.target.value))}
                  className="text-center font-mono text-lg tracking-wider"
                  maxLength={15}
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Formato: WA-PRO-XXXX-XXXX
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#25D366] text-white hover:bg-[#128C7E]"
                disabled={isLoading || key.length < 15}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Activar Licencia
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                ¿No tienes una clave?{" "}
                <a
                  href="https://wa.me/51933667414?text=Hola%2C%20quiero%20una%20licencia%20Pro%20para%20WA%20Manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#25D366] hover:underline"
                >
                  Contáctanos por WhatsApp
                </a>
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
