"use client";

import { useState, useMemo } from "react";
import { useClients, useTemplates, useMessages } from "@/hooks/use-data";
import { ClientFormSheet } from "./client-form-sheet";
import { SendMessageDialog } from "./send-message-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPhoneDisplay } from "@/lib/whatsapp";
import type { Client, Template } from "@/hooks/use-data";
import {
  Search,
  Plus,
  MessageCircle,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Building2,
  StickyNote,
  Users,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TAG_OPTIONS = ["Todos", "Nuevo", "Pendiente", "VIP"];

const TAG_COLORS: Record<string, string> = {
  Nuevo: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  VIP: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export function ClientsView() {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const { templates } = useTemplates();
  const { logMessage } = useMessages();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("Todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [sendClient, setSendClient] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchTag = filterTag === "Todos" || c.tags.includes(filterTag);
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q);
      return matchTag && matchSearch;
    });
  }, [clients, searchTerm, filterTag]);

  const handleSave = async (data: { name: string; phone: string; email: string; company: string; tags: string[]; notes: string }) => {
    if (editClient) {
      await updateClient(editClient.id, data);
      toast({ title: "Cliente actualizado", description: `${data.name || editClient.name} ha sido actualizado` });
    } else {
      await addClient(data as any);
      toast({ title: "Cliente agregado", description: `${data.name || "Nuevo cliente"} se ha agregado correctamente` });
    }
    setFormOpen(false);
    setEditClient(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este cliente?")) {
      const client = clients.find(c => c.id === id);
      await deleteClient(id);
      toast({ title: "Cliente eliminado", description: `${client?.name || "Cliente"} ha sido eliminado` });
    }
  };

  const handleSendMessage = async (clientId: string, templateId: string | null, content: string) => {
    await logMessage({
      clientId,
      templateId: templateId || undefined,
      content,
      type: "outgoing",
      userId: "",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 page-enter">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex gap-2"><Skeleton className="h-8 w-16 rounded-full" /><Skeleton className="h-8 w-20 rounded-full" /></div>
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-[#25D366]" /> Clientes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} de {clients.length} clientes</p>
        </div>
        <Button
          size="sm"
          className="bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm"
          onClick={() => { setEditClient(null); setFormOpen(true); }}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Nuevo
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono, email..."
          className="pl-9 rounded-xl h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tag Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {TAG_OPTIONS.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterTag === tag
                ? "bg-[#128C7E] text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tag === "Todos" ? "Todos" : tag}
            {tag !== "Todos" && (
              <span className="ml-1 text-[10px] opacity-70">
                ({clients.filter(c => c.tags.includes(tag)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {searchTerm || filterTag !== "Todos" ? "No se encontraron resultados" : "No hay clientes aún"}
          </p>
          {!searchTerm && filterTag === "Todos" && (
            <Button
              variant="link"
              className="text-[#25D366] mt-2"
              onClick={() => { setEditClient(null); setFormOpen(true); }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Agregar primer cliente
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-320px)]">
          <div className="space-y-2.5">
            {filtered.map((client) => (
              <Card key={client.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shrink-0 text-white font-bold text-sm">
                      {(client.name || client.phone || "?").charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-semibold text-sm truncate">{client.name || "Sin nombre"}</h3>
                        {client.tags.map((tag) => (
                          <Badge key={tag} className={`text-[9px] px-1.5 py-0 h-4 font-bold ${TAG_COLORS[tag] || "bg-muted"}`}>
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {formatPhoneDisplay(client.phone) || "—"}
                        </span>
                        {client.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </span>
                        )}
                      </div>

                      {client.company && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {client.company}
                        </p>
                      )}

                      {client.notes && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                          <StickyNote className="h-3 w-3 shrink-0" />
                          <span className="truncate">{client.notes}</span>
                        </p>
                      )}

                      {client.totalMessages > 0 && (
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {client.totalMessages} mensaje{client.totalMessages !== 1 ? "s" : ""} enviado{client.totalMessages !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#128C7E]"
                        onClick={() => setSendClient(client)}
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => { setEditClient(client); setFormOpen(true); }}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(client.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Client Form Sheet */}
      <ClientFormSheet
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditClient(null); }}
        client={editClient}
        onSave={handleSave}
      />

      {/* Send Message Dialog */}
      <SendMessageDialog
        open={!!sendClient}
        onOpenChange={(open) => { if (!open) setSendClient(null); }}
        client={sendClient}
        templates={templates}
        onSend={handleSendMessage}
      />
    </div>
  );
}
