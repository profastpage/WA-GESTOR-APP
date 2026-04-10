"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { LicenseActivationDialog } from "./license-activation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X, Zap, ShieldCheck, Headphones, RefreshCw } from "lucide-react";

const HOW_TO_STEPS = [
  "Haz clic en \"Pagar por WhatsApp\"",
  "Completa el pago de S/99 por Yape, Plin o transferencia",
  "Recibe tu clave de activación por WhatsApp",
  "Ingresa la clave en la app y listo",
];

export function PricingView() {
  const { user } = useAuthStore();
  const [showActivation, setShowActivation] = useState(false);
  const isPro = user?.isPro;

  return (
    <div className="space-y-5 page-enter">
      {/* Section Header with Gradient Icon */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Planes y Precios</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Elige el plan perfecto para tu negocio</p>
        </div>
      </div>

      {/* Pro Active Banner */}
      {isPro && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#25D366]/10 to-amber-500/10 border border-amber-500/20 p-4 stagger-item" style={{ animationDelay: "0.05s" }}>
          <Crown className="h-6 w-6 text-amber-500 shrink-0 animate-float" />
          <div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Tienes el Plan Pro</p>
            <p className="text-xs text-muted-foreground">Disfruta de todas las funciones sin límites</p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {/* Free Plan */}
        <Card
          className={`border-2 card-hover stagger-item ${!isPro ? "border-foreground/20" : "border-muted opacity-60"} relative`}
          style={{ animationDelay: "0.08s" }}
        >
          {!isPro && (
            <Badge className="absolute -top-2.5 left-4 bg-muted text-muted-foreground text-[10px] px-2.5 shadow-sm">
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
            <ul className="space-y-3">
              {[
                { text: "Hasta 30 clientes", ok: true },
                { text: "3 plantillas de mensajes", ok: true },
                { text: "Mensajes ilimitados", ok: true },
                { text: "Dashboard básico", ok: true },
                { text: "Estadísticas avanzadas", ok: false },
                { text: "Soporte prioritario", ok: false },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2.5 text-sm">
                  {item.ok ? (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#25D366]/10 shrink-0">
                      <Check className="h-3 w-3 text-[#25D366]" />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted shrink-0">
                      <X className="h-3 w-3 text-muted-foreground/40" />
                    </span>
                  )}
                  <span className={item.ok ? "text-foreground" : "text-muted-foreground/60"}>{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan with Gradient Border */}
        <Card
          className="border-2 border-transparent gradient-border card-hover stagger-item relative overflow-hidden bg-[#25D366]/[0.02] dark:bg-[#25D366]/[0.04]"
          style={{ animationDelay: "0.18s" }}
        >
          <div className="absolute top-0 right-0 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl animate-bounce-in shadow-sm">
            RECOMENDADO
          </div>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-1.5">
                  <span className="text-gradient-wa">Pro</span> <Crown className="h-4 w-4 text-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground">Para negocios serios</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#128C7E]">S/99</p>
                <p className="text-[10px] text-muted-foreground">Pago único</p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { text: "Clientes ilimitados", icon: Zap },
                { text: "Plantillas ilimitadas", icon: Zap },
                { text: "Mensajes ilimitados", icon: Zap },
                { text: "Estadísticas avanzadas", icon: ShieldCheck },
                { text: "Soporte prioritario", icon: Headphones },
                { text: "Actualizaciones incluidas", icon: RefreshCw },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2.5 text-sm">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#25D366]/10 status-glow-green shrink-0">
                    <Check className="h-3 w-3 text-[#25D366]" />
                  </span>
                  <span className="font-medium">{item.text}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="mt-5 rounded-xl bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500 animate-float" />
                  <p className="font-bold text-[#128C7E] text-sm">Plan Pro Activo</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Gracias por confiar en nosotros</p>
              </div>
            ) : (
              <div className="space-y-2.5 mt-5">
                <a
                  href="https://wa.me/51933667414?text=Hola,%20quiero%20activar%20mi%20licencia%20Pro%20de%20WA%20Manager"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] h-11 font-semibold text-sm shadow-sm btn-wa press-effect">
                    Pagar por WhatsApp
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E] hover:text-white h-10 text-xs font-semibold press-effect"
                  onClick={() => setShowActivation(true)}
                >
                  Ya tengo mi clave de activación
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How to activate — with Number Circles and Connecting Lines */}
      {!isPro && (
        <Card className="border-0 shadow-sm stagger-item" style={{ animationDelay: "0.28s" }}>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#128C7E]/10">
                <Zap className="h-3.5 w-3.5 text-[#128C7E]" />
              </div>
              ¿Cómo activar el Plan Pro?
            </h4>
            <ol className="space-y-0 text-xs">
              {HOW_TO_STEPS.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#128C7E] text-white flex items-center justify-center shrink-0 text-[10px] font-bold shadow-sm">
                      {i + 1}
                    </div>
                    {i < HOW_TO_STEPS.length - 1 && (
                      <div className="w-px h-6 bg-[#128C7E]/15 mt-1" />
                    )}
                  </div>
                  <p className="text-muted-foreground pt-0.5 leading-relaxed pb-3">{step}</p>
                </li>
              ))}
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
