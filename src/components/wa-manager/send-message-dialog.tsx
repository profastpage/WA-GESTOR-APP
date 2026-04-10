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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { WhatsAppComplianceNotice } from "./whatsapp-compliance-notice";
import { generateWhatsAppLink, replaceTemplateVars, TEMPLATE_VARIABLES } from "@/lib/whatsapp";
import type { Client, Template } from "@/hooks/use-data";
import { MessageSquare, Send, Sparkles, FileText, Edit3 } from "lucide-react";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  templates: Template[];
  onSend: (clientId: string, templateId: string | null, content: string) => void;
}

export function SendMessageDialog({ open, onOpenChange, client, templates, onSend }: SendMessageDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  if (!client) return null;

  const previewText = isCustom
    ? customMessage
    : selectedTemplate
      ? replaceTemplateVars(selectedTemplate.content, client)
      : "";

  const handleSend = () => {
    if (!previewText.trim()) return;

    const link = generateWhatsAppLink(client.phone, previewText);
    window.open(link, "_blank");

    onSend(
      client.id,
      isCustom ? null : (selectedTemplate?.id || null),
      previewText
    );

    onOpenChange(false);
    setSelectedTemplate(null);
    setCustomMessage("");
    setIsCustom(false);
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setCustomMessage("");
    setIsCustom(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#25D366]" />
            Enviar Mensaje
          </DialogTitle>
          <DialogDescription>
            A <span className="font-medium text-foreground">{client.name}</span> · {client.phone}
          </DialogDescription>
        </DialogHeader>

        <WhatsAppComplianceNotice className="mb-4" />

        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={isCustom ? "outline" : "default"}
            className={!isCustom ? "bg-[#25D366] text-white hover:bg-[#128C7E]" : ""}
            onClick={() => setIsCustom(false)}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Plantillas
          </Button>
          <Button
            size="sm"
            variant={isCustom ? "default" : "outline"}
            className={isCustom ? "bg-[#25D366] text-white hover:bg-[#128C7E]" : ""}
            onClick={() => setIsCustom(true)}
          >
            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
            Personalizado
          </Button>
        </div>

        {isCustom ? (
          <div className="space-y-3 flex-1 overflow-auto">
            <div className="space-y-1.5">
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={5}
                className="resize-none input-glow"
              />
              <div className="flex justify-end">
                <span className="text-[10px] text-muted-foreground">{customMessage.length} caracteres</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_VARIABLES.map((v) => (
                <Badge
                  key={v.key}
                  variant="outline"
                  className="cursor-pointer hover:bg-[#25D366]/10 hover:border-[#25D366]/30 transition-colors text-xs"
                  onClick={() => setCustomMessage(prev => prev + v.key)}
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {v.label}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-2">
              {templates.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay plantillas. Crea una desde la sección Plantillas.
                </div>
              ) : (
                templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(selectedTemplate?.id === t.id ? null : t)}
                    className={`w-full text-left rounded-lg border p-3 transition-all ${
                      selectedTemplate?.id === t.id
                        ? "border-[#25D366] bg-[#25D366]/5 ring-1 ring-[#25D366]/20"
                        : "hover:border-muted-foreground/20 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{t.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {t.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.content}</p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {previewText && (
          <>
            <Separator className="my-3" />
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#25D366]" /> Vista previa:
              </p>
              <div className="wa-bubble-sent p-3 text-sm whitespace-pre-wrap stagger-item">
                {previewText}
              </div>
            </div>
          </>
        )}

        <Button
          className="w-full mt-3 bg-[#25D366] text-white hover:bg-[#128C7E] h-11 font-semibold btn-wa press-effect"
          disabled={!previewText.trim()}
          onClick={handleSend}
        >
          <Send className="mr-2 h-4 w-4" />
          Abrir en WhatsApp
        </Button>
      </DialogContent>
    </Dialog>
  );
}
