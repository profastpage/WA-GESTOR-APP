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
import { Loader2, AlertCircle } from "lucide-react";
import type { Client } from "@/hooks/use-data";

const TAG_OPTIONS = [
  { value: "Nuevo", label: "Nuevo", color: "bg-blue-500" },
  { value: "Pendiente", label: "Pendiente", color: "bg-amber-500" },
  { value: "VIP", label: "VIP", color: "bg-purple-500" },
];

interface ClientFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  existingClients?: Client[];
  onSave: (data: {
    name: string;
    phone: string;
    email: string;
    company: string;
    tags: string[];
    notes: string;
  }) => Promise<void>;
}

export function ClientFormSheet({ open, onOpenChange, client, existingClients = [], onSave }: ClientFormSheetProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [tag, setTag] = useState<string>("Nuevo");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const isEditing = !!client;

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone);
      setEmail(client.email);
      setCompany(client.company);
      setTag(client.tags[0] || "Nuevo");
      setNotes(client.notes);
      setDuplicateWarning(null);
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setCompany("");
      setTag("Nuevo");
      setNotes("");
      setDuplicateWarning(null);
    }
  }, [client, open]);

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/[^0-9+]/g, "");
    setPhone(cleaned);
    if (cleaned.length > 0) {
      const duplicate = existingClients.find(
        (c) => c.phone === cleaned && c.id !== client?.id
      );
      if (duplicate) {
        setDuplicateWarning(`Este teléfono ya está registrado para ${duplicate.name || duplicate.phone}`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, phone, email, company, tags: [tag], notes });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Modifica los datos del cliente" : "Agrega un nuevo cliente a tu CRM"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Nombre</Label>
            <Input
              id="client-name"
              placeholder="Nombre del cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-phone">Teléfono *</Label>
            <Input
              id="client-phone"
              placeholder="51933667414"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              required
              className={duplicateWarning ? "border-amber-500 focus-visible:ring-amber-500" : ""}
            />
            {duplicateWarning && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{duplicateWarning}</span>
              </div>
            )}
            {!duplicateWarning && (
              <p className="text-xs text-muted-foreground">Incluir código de país sin +</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="cliente@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-company">Empresa</Label>
            <Input
              id="client-company"
              placeholder="Nombre de la empresa"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Etiqueta</Label>
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAG_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${t.color}`} />
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-notes">Notas</Label>
            <Textarea
              id="client-notes"
              placeholder="Notas sobre el cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#25D366] text-white hover:bg-[#128C7E]" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar" : "Agregar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
