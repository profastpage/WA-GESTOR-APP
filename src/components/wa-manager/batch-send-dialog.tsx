"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Check,
  Send,
  FileText,
  Edit3,
  Sparkles,
  Shield,
  Loader2,
  MessageSquare,
  X,
  CheckCircle2,
} from "lucide-react";
import { WhatsAppComplianceNotice } from "./whatsapp-compliance-notice";
import { generateWhatsAppLink, replaceTemplateVars, TEMPLATE_VARIABLES } from "@/lib/whatsapp";
import type { Client, Template } from "@/hooks/use-data";

interface BatchSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  templates: Template[];
  onSend: (clientId: string, templateId: string | null, content: string) => void;
}

export function BatchSendDialog({ open, onOpenChange, clients, templates, onSend }: BatchSendDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const [sendComplete, setSendComplete] = useState(false);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return clients.filter(c =>
      !q || c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.company?.toLowerCase().includes(q)
    );
  }, [clients, searchTerm]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const toggleClient = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const previewText = isCustom
    ? customMessage
    : selectedTemplate
      ? selectedTemplate.content
      : "";

  const handleSend = useCallback(async () => {
    if (selectedIds.size === 0 || !previewText.trim()) return;

    setSending(true);
    setSendProgress({ current: 0, total: selectedIds.size });
    setSendComplete(false);

    const clientList = clients.filter(c => selectedIds.has(c.id));

    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      const message = isCustom
        ? customMessage
        : replaceTemplateVars(selectedTemplate?.content || "", client);

      const link = generateWhatsAppLink(client.phone, message);
      window.open(link, "_blank");

      onSend(
        client.id,
        isCustom ? null : selectedTemplateId,
        message
      );

      setSendProgress({ current: i + 1, total: clientList.length });

      // Small delay between opens to prevent browser blocking
      if (i < clientList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setSending(false);
    setSendComplete(true);
  }, [selectedIds, previewText, clients, isCustom, customMessage, selectedTemplate, selectedTemplateId, onSend]);

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchTerm("");
    setIsCustom(false);
    setSelectedTemplateId("");
    setCustomMessage("");
    setSending(false);
    setSendProgress({ current: 0, total: 0 });
    setSendComplete(false);
    onOpenChange(false);
  };

  const selectedCount = selectedIds.size;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-[#25D366]" />
            Envío Masivo
          </DialogTitle>
          <DialogDescription>
            Selecciona múltiples clientes y envía un mensaje a todos
          </DialogDescription>
        </DialogHeader>

        <WhatsAppComplianceNotice className="mb-3" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-9 rounded-xl h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Select All */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              selectedCount === filtered.length && filtered.length > 0
                ? "bg-[#25D366] border-[#25D366] text-white"
                : "border-muted-foreground/30"
            }`}>
              {selectedCount === filtered.length && filtered.length > 0 && <Check className="h-3 w-3" />}
            </div>
            {selectedCount === filtered.length && filtered.length > 0 ? "Deseleccionar todos" : "Seleccionar todos"}
          </button>
          <Badge variant="secondary" className="text-[10px] font-semibold">
            {selectedCount} seleccionado{selectedCount !== 1 ? "s" : ""} de {clients.length}
          </Badge>
        </div>

        {/* Client List */}
        <ScrollArea className="flex-1 -mx-6 px-6 max-h-[200px]">
          <div className="space-y-1">
            {filtered.map((client) => {
              const isSelected = selectedIds.has(client.id);
              return (
                <button
                  key={client.id}
                  onClick={() => toggleClient(client.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                    isSelected
                      ? "bg-[#25D366]/5 border border-[#25D366]/20"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#25D366] border-[#25D366] text-white"
                      : "border-muted-foreground/30"
                  }`}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shrink-0 text-white font-bold text-[10px]">
                    {(client.name || client.phone || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{client.name || "Sin nombre"}</p>
                    <p className="text-[10px] text-muted-foreground">{client.phone}</p>
                  </div>
                  {client.company && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[80px] hidden sm:block">
                      {client.company}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <Separator className="my-2" />

        {/* Message Selection */}
        <div>
          <p className="text-xs font-semibold mb-2">Mensaje a enviar:</p>
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              variant={isCustom ? "outline" : "default"}
              className={!isCustom ? "bg-[#25D366] text-white hover:bg-[#128C7E]" : ""}
              onClick={() => setIsCustom(false)}
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Plantilla
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
            <div className="space-y-2">
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
              <div className="flex flex-wrap gap-1">
                {TEMPLATE_VARIABLES.map((v) => (
                  <Badge
                    key={v.key}
                    variant="outline"
                    className="cursor-pointer hover:bg-[#25D366]/10 hover:border-[#25D366]/30 transition-colors text-[10px]"
                    onClick={() => setCustomMessage(prev => prev + v.key)}
                  >
                    <Sparkles className="mr-1 h-2.5 w-2.5" />
                    {v.label}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Seleccionar plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{t.name}</span>
                      <Badge variant="secondary" className="text-[9px] px-1 ml-auto">{t.category}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Preview */}
        {previewText && !isCustom && selectedTemplate && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1">Vista previa:</p>
            <div className="wa-bubble-sent p-2.5 text-xs whitespace-pre-wrap rounded-lg">
              {previewText}
            </div>
            <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Las variables se reemplazarán para cada cliente
            </p>
          </div>
        )}

        {/* Sending Progress */}
        {sending && (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Enviando...</span>
              <span className="text-muted-foreground">{sendProgress.current} de {sendProgress.total}</span>
            </div>
            <Progress value={(sendProgress.current / sendProgress.total) * 100} className="h-2 [&>div]:bg-[#25D366]" />
          </div>
        )}

        {/* Send Complete */}
        {sendComplete && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20">
            <CheckCircle2 className="h-5 w-5 text-[#25D366] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#128C7E] dark:text-[#25D366]">Envío completado</p>
              <p className="text-[11px] text-muted-foreground">
                Se abrieron {sendProgress.total} ventana{sendProgress.total !== 1 ? "s" : ""} de WhatsApp
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          {sendComplete ? (
            <Button className="flex-1 bg-[#25D366] text-white hover:bg-[#128C7E]" onClick={handleClose}>
              Listo
            </Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#25D366] text-white hover:bg-[#128C7E] btn-wa"
                disabled={selectedCount === 0 || !previewText.trim() || sending}
                onClick={handleSend}
              >
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {sending
                  ? `Enviando ${sendProgress.current}/${sendProgress.total}`
                  : `Enviar a ${selectedCount}`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
