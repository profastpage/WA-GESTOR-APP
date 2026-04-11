'use client';

import { useMemo } from 'react';
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
  FileText,
  LogIn,
  Download,
  Activity,
  Trash2,
  Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityType =
  | 'client_added'
  | 'message_sent'
  | 'followup_created'
  | 'followup_completed'
  | 'template_created'
  | 'login'
  | 'export';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  userName?: string;
}

export interface ActivityLogProps {
  activities: ActivityItem[];
  onClear?: () => void;
}

// ---------------------------------------------------------------------------
// Config: icon, color, label per activity type
// ---------------------------------------------------------------------------

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: typeof Users; color: string; bgClass: string; label: string }
> = {
  client_added: {
    icon: Users,
    color: '#25D366',
    bgClass: 'bg-[#25D366]/10',
    label: 'Cliente añadido',
  },
  message_sent: {
    icon: MessageSquare,
    color: '#128C7E',
    bgClass: 'bg-[#128C7E]/10',
    label: 'Mensaje enviado',
  },
  followup_created: {
    icon: Clock,
    color: '#f59e0b',
    bgClass: 'bg-[#f59e0b]/10',
    label: 'Seguimiento creado',
  },
  followup_completed: {
    icon: CheckCircle2,
    color: '#10b981',
    bgClass: 'bg-[#10b981]/10',
    label: 'Seguimiento completado',
  },
  template_created: {
    icon: FileText,
    color: '#8b5cf6',
    bgClass: 'bg-[#8b5cf6]/10',
    label: 'Plantilla creada',
  },
  login: {
    icon: LogIn,
    color: '#64748b',
    bgClass: 'bg-slate-500/10',
    label: 'Inicio de sesión',
  },
  export: {
    icon: Download,
    color: '#14b8a6',
    bgClass: 'bg-teal-500/10',
    label: 'Exportación',
  },
};

// ---------------------------------------------------------------------------
// Relative time helpers (Spanish locale)
// ---------------------------------------------------------------------------

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin}m`;
  if (diffHr < 24) return `Hace ${diffHr}h`;
  if (diffDay === 1) return 'Ayer';
  if (diffDay < 7) return `Hace ${diffDay}d`;
  if (diffDay < 30) return `Hace ${Math.floor(diffDay / 7)} sem`;

  // Fallback: format date
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityLog({ activities, onClear }: ActivityLogProps) {
  // Sorted newest-first (stable sort by timestamp)
  const sorted = useMemo(
    () =>
      [...activities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [activities]
  );

  const isEmpty = sorted.length === 0;

  return (
    <Card className="card-hover">
      {/* Header */}
      <CardHeader className="pb-0 pt-5 px-5 sm:px-6 gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-[#25D366]" />
          </div>
          <CardTitle className="text-sm">Actividad Reciente</CardTitle>
        </div>

        <CardAction>
          {!isEmpty && onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive press-effect"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar
            </Button>
          )}
          {!isEmpty && (
            <Badge variant="secondary" className="text-[10px] font-medium">
              {sorted.length} {sorted.length === 1 ? 'actividad' : 'actividades'}
            </Badge>
          )}
        </CardAction>
      </CardHeader>

      {/* Body */}
      <CardContent className="px-5 sm:px-6 pb-5 pt-4">
        {isEmpty ? (
          /* ---- Empty state ---- */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4 animate-float">
              <Inbox className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Sin actividad reciente
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-[220px]">
              Las acciones que realices aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
          /* ---- Timeline ---- */
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            <div className="timeline-line space-y-4">
              {sorted.map((item, idx) => {
                const cfg = ACTIVITY_CONFIG[item.type];
                const Icon = cfg.icon;

                return (
                  <div
                    key={item.id}
                    className="timeline-item stagger-item"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    {/* Dot */}
                    <div
                      className="timeline-dot"
                      style={{ borderColor: cfg.color }}
                    />

                    {/* Content */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Icon badge */}
                          <span
                            className={`inline-flex items-center justify-center h-6 w-6 rounded-md ${cfg.bgClass} shrink-0`}
                          >
                            <Icon
                              className="h-3.5 w-3.5"
                              style={{ color: cfg.color }}
                            />
                          </span>
                          <span className="text-xs font-semibold truncate">
                            {item.description}
                          </span>
                        </div>

                        {/* Meta line */}
                        <div className="flex items-center gap-2 pl-8">
                          {item.userName && (
                            <span className="text-[10px] text-muted-foreground/80 truncate">
                              {item.userName}
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className="text-[9px] font-medium h-4 px-1.5 leading-none"
                            style={{ borderColor: `${cfg.color}30`, color: cfg.color }}
                          >
                            {cfg.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Relative time */}
                      <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">
                        {getRelativeTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActivityLog;
