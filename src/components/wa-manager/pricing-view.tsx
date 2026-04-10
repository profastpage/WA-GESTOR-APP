"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { LicenseActivationDialog } from "./license-activation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X, Zap, ShieldCheck, Headphones, RefreshCw } from "lucide-react";

export function PricingView() {
  const { user } = useAuthStore();
  const [showActivation, setShowActivation] = useState(false);
  const isPro = user?.isPro;

  return (
    <div className="space-y-5 page-enter">
      <div>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" /> Planes y Precios
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Elige el plan perfecto para tu negocio</p>
      </div>

      {isPro && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-[#25D366]/10 border border-amber-500/20 p-4">
          <Crown className="h-6 w-6 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Tienes el Plan Pro</p>
            <p className="text-xs text-muted-foreground">Disfruta de todas las funciones sin límites</p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {/* Free Plan */}
        <Card className={`border-2 ${!isPro ? "border-foreground/20" : "border-muted opacity-60"} relative`}>
          {!isPro && (
            <Badge className="absolute -top-2.5 left-4 bg-muted text-muted-foreground text-[10px] px-2.5">
              ACTUAL
            </Badge>
          )}
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold">Gratis</h3>
                <p className="text-xs text-muted-foreground">Para empezar</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">S/0</p>
                <p className="text-[10px] text-muted-foreground">Para siempre</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {[
                { text: "Hasta 30 clientes", ok: true },
                { text: "3 plantillas de mensajes", ok: true },
                { text: "Mensajes ilimitados", ok: true },
                { text: "Dashboard básico", ok: true },
                { text: "Estadísticas avanzadas", ok: false },
                { text: "Soporte prioritario", ok: false },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2 text-sm">
                  {item.ok
                    ? <Check className="h-4 w-4 text-[#25D366] shrink-0" />
                    : <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  }
                  <span className={item.ok ? "text-foreground" : "text-muted-foreground/60"}>{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-2 border-[#25D366] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#25D366] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
            RECOMENDADO
          </div>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-1.5">
                  Pro <Crown className="h-4 w-4 text-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground">Para negocios serios</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#128C7E]">S/99</p>
                <p className="text-[10px] text-muted-foreground">Pago único</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {[
                { text: "Clientes ilimitados", icon: Zap },
                { text: "Plantillas ilimitadas", icon: Zap },
                { text: "Mensajes ilimitados", icon: Zap },
                { text: "Estadísticas avanzadas", icon: ShieldCheck },
                { text: "Soporte prioritario", icon: Headphones },
                { text: "Actualizaciones incluidas", icon: RefreshCw },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-[#25D366] shrink-0" />
                  <span className="font-medium">{item.text}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="mt-5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 p-4 text-center">
                <p className="font-semibold text-[#128C7E] text-sm">Plan Pro Activo</p>
                <p className="text-xs text-muted-foreground mt-0.5">Gracias por confiar en nosotros</p>
              </div>
            ) : (
              <div className="space-y-2.5 mt-5">
                <a
                  href="https://wa.me/51933667414?text=Hola,%20quiero%20activar%20mi%20licencia%20Pro%20de%20WA%20Manager"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] h-11 font-semibold text-sm shadow-sm">
                    Pagar por WhatsApp
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E] hover:text-white h-10 text-xs font-semibold"
                  onClick={() => setShowActivation(true)}
                >
                  Ya tengo mi clave de activación
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How to activate */}
      {!isPro && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3">¿Cómo activar el Plan Pro?</h4>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="font-bold text-[#128C7E]">1.</span> Haz clic en &quot;Pagar por WhatsApp&quot;</li>
              <li className="flex gap-2"><span className="font-bold text-[#128C7E]">2.</span> Completa el pago de S/99 por Yape, Plin o transferencia</li>
              <li className="flex gap-2"><span className="font-bold text-[#128C7E]">3.</span> Recibe tu clave de activación</li>
              <li className="flex gap-2"><span className="font-bold text-[#128C7E]">4.</span> Ingresa la clave y listo</li>
            </ol>
          </CardContent>
        </Card>
      )}

      <LicenseActivationDialog
        open={showActivation}
        onOpenChange={setShowActivation}
      />
    </div>
  );
}
