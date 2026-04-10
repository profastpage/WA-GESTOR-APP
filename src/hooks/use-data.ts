"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  tags: string[];
  notes: string;
  totalMessages: number;
  lastContact: string | null;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  usageCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  clientId: string;
  templateId?: string;
  content: string;
  type: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  clientId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "baja" | "media" | "alta";
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface Stats {
  totalClients: number;
  messagesToday: number;
  totalTemplates: number;
  pendingFollowUps: number;
  tagDistribution: { tag: string; count: number }[];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

function setLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function parseTags(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return raw.split(",").map(s => s.trim()).filter(Boolean); } }
  return ["Nuevo"];
}

function parseNotes(raw: any): string {
  if (!raw) return "";
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((n: any) => typeof n === "string" ? n : n.text || "").join("\n");
      }
      return parsed;
    } catch { return raw; }
  }
  if (Array.isArray(raw)) return raw.map((n: any) => typeof n === "string" ? n : n.text || "").join("\n");
  return "";
}

export function useClients() {
  const { isAuthenticated } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const res = await fetch("/api/clients");
        const data = await res.json();
        const arr = data.clients || data.data || data || [];
        setClients(arr.map((c: any) => ({ ...c, tags: parseTags(c.tags), notes: parseNotes(c.notes) })));
      } catch { /* silent */ }
    } else {
      setClients(getLS<Client[]>("wa_demo_clients", []));
    }
    setLoading(false);
  }, [isAuthenticated]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchClients(); }, [fetchClients]);

  const addClient = useCallback(async (client: any) => {
    const newClient: Client = { ...client, id: generateId(), totalMessages: 0, lastContact: null, createdAt: new Date().toISOString() };
    if (isAuthenticated) {
      await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newClient, userId: useAuthStore.getState().user?.id, tags: JSON.stringify(newClient.tags) }) });
      await fetchClients();
    } else {
      const current = getLS<Client[]>("wa_demo_clients", []);
      setLS("wa_demo_clients", [...current, newClient]);
      setClients([...current, newClient]);
    }
  }, [isAuthenticated, fetchClients]);

  const updateClient = useCallback(async (id: string, updates: any) => {
    if (isAuthenticated) {
      const payload: any = { ...updates };
      if (payload.tags) payload.tags = JSON.stringify(payload.tags);
      await fetch(`/api/clients/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      await fetchClients();
    } else {
      const current = getLS<Client[]>("wa_demo_clients", []);
      const updated = current.map(c => c.id === id ? { ...c, ...updates } : c);
      setLS("wa_demo_clients", updated);
      setClients(updated);
    }
  }, [isAuthenticated, fetchClients]);

  const deleteClient = useCallback(async (id: string) => {
    if (isAuthenticated) {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      await fetchClients();
    } else {
      const current = getLS<Client[]>("wa_demo_clients", []);
      const filtered = current.filter(c => c.id !== id);
      setLS("wa_demo_clients", filtered);
      setClients(filtered);
    }
  }, [isAuthenticated, fetchClients]);

  return { clients, loading, addClient, updateClient, deleteClient, refetch: fetchClients };
}

export function useTemplates() {
  const { isAuthenticated } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();
        setTemplates(data.templates || data.data || data || []);
      } catch { /* silent */ }
    } else {
      setTemplates(getLS<Template[]>("wa_demo_templates", []));
    }
    setLoading(false);
  }, [isAuthenticated]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const addTemplate = useCallback(async (template: any) => {
    const newTmpl: Template = { ...template, id: generateId(), usageCount: 0, createdAt: new Date().toISOString() };
    if (isAuthenticated) {
      await fetch("/api/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newTmpl, userId: useAuthStore.getState().user?.id }) });
      await fetchTemplates();
    } else {
      const current = getLS<Template[]>("wa_demo_templates", []);
      setLS("wa_demo_templates", [...current, newTmpl]);
      setTemplates([...current, newTmpl]);
    }
  }, [isAuthenticated, fetchTemplates]);

  const updateTemplate = useCallback(async (id: string, updates: any) => {
    if (isAuthenticated) {
      await fetch(`/api/templates/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
      await fetchTemplates();
    } else {
      const current = getLS<Template[]>("wa_demo_templates", []);
      setLS("wa_demo_templates", current.map(t => t.id === id ? { ...t, ...updates } : t));
      setTemplates(current.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  }, [isAuthenticated, fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    if (isAuthenticated) {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      await fetchTemplates();
    } else {
      const current = getLS<Template[]>("wa_demo_templates", []);
      const filtered = current.filter(t => t.id !== id);
      setLS("wa_demo_templates", filtered);
      setTemplates(filtered);
    }
  }, [isAuthenticated, fetchTemplates]);

  return { templates, loading, addTemplate, updateTemplate, deleteTemplate, refetch: fetchTemplates };
}

export function useMessages() {
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/messages?userId=${useAuthStore.getState().user?.id}`);
        const data = await res.json();
        setMessages(data.messages || data.data || []);
      } catch { /* silent */ }
    } else {
      setMessages(getLS<Message[]>("wa_demo_messages", []));
    }
  }, [isAuthenticated]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const logMessage = useCallback(async (msg: any) => {
    const newMsg: Message = { clientId: msg.clientId, templateId: msg.templateId, content: msg.content, type: "outgoing", id: generateId(), createdAt: new Date().toISOString() };
    if (isAuthenticated) {
      await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newMsg, userId: useAuthStore.getState().user?.id }) });
      await fetchMessages();
    } else {
      const current = getLS<Message[]>("wa_demo_messages", []);
      setLS("wa_demo_messages", [...current, newMsg]);
      setMessages([...current, newMsg]);
    }
  }, [isAuthenticated, fetchMessages]);

  const messagesToday = messages.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length;

  return { messages, logMessage, messagesToday, refetch: fetchMessages };
}

export function useFollowUps() {
  const { isAuthenticated } = useAuthStore();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowUps = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/follow-ups?userId=${useAuthStore.getState().user?.id}`);
        const data = await res.json();
        setFollowUps(data.followUps || data.data || data || []);
      } catch { /* silent */ }
    } else {
      setFollowUps(getLS<FollowUp[]>("wa_demo_followups", []));
    }
    setLoading(false);
  }, [isAuthenticated]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

  const addFollowUp = useCallback(async (fu: any) => {
    const newFu: FollowUp = { ...fu, id: generateId(), completed: false, completedAt: null, createdAt: new Date().toISOString() };
    if (isAuthenticated) {
      await fetch("/api/follow-ups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newFu, userId: useAuthStore.getState().user?.id }) });
      await fetchFollowUps();
    } else {
      const current = getLS<FollowUp[]>("wa_demo_followups", []);
      setLS("wa_demo_followups", [...current, newFu]);
      setFollowUps([...current, newFu]);
    }
  }, [isAuthenticated, fetchFollowUps]);

  const completeFollowUp = useCallback(async (id: string) => {
    if (isAuthenticated) {
      await fetch(`/api/follow-ups/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: true }) });
      await fetchFollowUps();
    } else {
      const current = getLS<FollowUp[]>("wa_demo_followups", []);
      const updated = current.map(f => f.id === id ? { ...f, completed: true, completedAt: new Date().toISOString() } : f);
      setLS("wa_demo_followups", updated);
      setFollowUps(updated);
    }
  }, [isAuthenticated, fetchFollowUps]);

  const deleteFollowUp = useCallback(async (id: string) => {
    if (isAuthenticated) {
      await fetch(`/api/follow-ups/${id}`, { method: "DELETE" });
      await fetchFollowUps();
    } else {
      const current = getLS<FollowUp[]>("wa_demo_followups", []);
      const filtered = current.filter(f => f.id !== id);
      setLS("wa_demo_followups", filtered);
      setFollowUps(filtered);
    }
  }, [isAuthenticated, fetchFollowUps]);

  return { followUps, loading, addFollowUp, completeFollowUp, deleteFollowUp, refetch: fetchFollowUps };
}

export function useStats() {
  const { clients, loading: clLoading } = useClients();
  const { messagesToday } = useMessages();
  const { templates, loading: tmLoading } = useTemplates();
  const { followUps, loading: fuLoading } = useFollowUps();

  const tagDistribution = clients.reduce<Record<string, number>>((acc, c) => {
    (c.tags || []).forEach((tag: string) => { acc[tag] = (acc[tag] || 0) + 1; });
    return acc;
  }, {});

  const stats: Stats = {
    totalClients: clients.length,
    messagesToday,
    totalTemplates: templates.length,
    pendingFollowUps: followUps.filter(f => !f.completed).length,
    tagDistribution: Object.entries(tagDistribution).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count),
  };

  return { stats, loading: clLoading || tmLoading || fuLoading };
}
