"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Client } from "@/hooks/use-data";

interface FollowUp {
  clientId: string;
  clientName?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "baja" | "media" | "alta";
}

interface FollowUpFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onSave: (data: FollowUp) => Promise<void>;
}

export function FollowUpFormSheet({ open, onOpenChange, clients, onSave }: FollowUpFormSheetProps) {
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"baja" | "media" | "alta">("media");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setClientId("");
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("media");
    }
  }, [open]);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title || !dueDate) return;

    setSaving(true);
    try {
      const client = clients.find(c => c.id === clientId);
      await onSave({
        clientId,
        clientName: client?.name,
        title,
        description,
        dueDate,
        priority,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg slide-in-bottom">
        <SheetHeader>
          <SheetTitle>Nuevo Seguimiento</SheetTitle>
          <SheetDescription>
            Programa un seguimiento para un cliente
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2 stagger-item" style={{ animationDelay: "0.05s" }}>
            <Label>Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger className="input-glow">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} · {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 stagger-item" style={{ animationDelay: "0.1s" }}>
            <Label htmlFor="fu-title">Título *</Label>
            <Input
              id="fu-title"
              placeholder="Ej: Llamar para confirmar pedido"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-glow"
            />
          </div>

          <div className="space-y-2 stagger-item" style={{ animationDelay: "0.15s" }}>
            <Label htmlFor="fu-desc">Descripción</Label>
            <Textarea
              id="fu-desc"
              placeholder="Detalles del seguimiento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-glow"
            />
          </div>

          <div className="space-y-2 stagger-item" style={{ animationDelay: "0.2s" }}>
            <Label htmlFor="fu-date">Fecha y hora *</Label>
            <Input
              id="fu-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={getMinDateTime()}
              required
              className="input-glow"
            />
          </div>

          <hr className="divider-gradient my-2" />
          <div className="space-y-2 stagger-item" style={{ animationDelay: "0.25s" }}>
            <Label>Prioridad</Label>
            <div className="flex gap-2">
              {([
                { value: "baja" as const, label: "Baja", color: "bg-green-500", active: "bg-green-500/15 border-green-500/40 text-green-700 dark:text-green-400", dot: "bg-green-500" },
                { value: "media" as const, label: "Media", color: "bg-amber-500", active: "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
                { value: "alta" as const, label: "Alta", color: "bg-red-500", active: "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400", dot: "bg-red-500" },
              ] as const).map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all-300 press-effect ${
                    priority === p.value
                      ? `${p.active} border`
                      : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setPriority(p.value)}
                >
                  <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#25D366] text-white hover:bg-[#128C7E] press-effect" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
