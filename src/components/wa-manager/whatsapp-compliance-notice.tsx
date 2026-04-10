"use client";

import { ShieldCheck } from "lucide-react";

export function WhatsAppComplianceNotice({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-lg border-0 bg-gradient-to-r from-[#25D366]/8 via-[#25D366]/5 to-transparent p-2.5 border-l-[3px] border-l-[#25D366] ${className || ""}`}>
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#25D366]/12 shrink-0">
        <ShieldCheck className="h-4 w-4 text-[#128C7E]" />
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-[#128C7E]">Modo Seguro:</span> Los mensajes se abren en WhatsApp para confirmación manual. Cumplimos con los Términos de Servicio.
      </p>
    </div>
  );
}
