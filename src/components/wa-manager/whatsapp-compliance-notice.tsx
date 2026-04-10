"use client";

import { Shield } from "lucide-react";

export function WhatsAppComplianceNotice({ className }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg border border-[#25D366]/20 bg-[#25D366]/5 p-3 ${className || ""}`}>
      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#128C7E]" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-[#128C7E]">Modo Seguro:</span> Los mensajes se abren en WhatsApp para confirmación manual. Cumplimos con los Términos de Servicio de WhatsApp.
      </p>
    </div>
  );
}
