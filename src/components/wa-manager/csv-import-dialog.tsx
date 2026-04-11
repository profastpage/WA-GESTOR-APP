"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle2, X, Users } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface ImportedClient {
  name: string;
  phone: string;
  email: string;
  company: string;
  tags: string[];
}

interface RowError {
  row: number;
  message: string;
}

interface ColumnMapping {
  name: string;
  phone: string;
  email: string;
  company: string;
  tags: string;
}

type Step = "upload" | "mapping" | "preview" | "success";

// ── Constants ──────────────────────────────────────────────────────
const EXPECTED_FIELDS = [
  { key: "name" as const, label: "Nombre" },
  { key: "phone" as const, label: "Teléfono" },
  { key: "email" as const, label: "Email" },
  { key: "company" as const, label: "Empresa" },
  { key: "tags" as const, label: "Etiquetas" },
];

const KNOWN_HEADERS: Record<string, keyof ColumnMapping> = {
  // Name
  nombre: "name",
  name: "name",
  "full name": "name",
  "full_name": "name",
  "primer nombre": "name",
  "primer_nombre": "name",
  "nombre completo": "name",
  cliente: "name",
  // Phone
  "teléfono": "phone",
  telefono: "phone",
  phone: "phone",
  "número": "phone",
  numero: "phone",
  "tel": "phone",
  "celular": "phone",
  movil: "phone",
  "móvil": "phone",
  "número de teléfono": "phone",
  "telefono_cliente": "phone",
  // Email
  email: "email",
  "correo": "email",
  "correo electrónico": "email",
  "correo_electronico": "email",
  "e-mail": "email",
  mail: "email",
  // Company
  empresa: "company",
  company: "company",
  organización: "company",
  organizacion: "company",
  compañia: "company",
  compania: "company",
  empresa_: "company",
  // Tags
  etiquetas: "tags",
  tags: "tags",
  etiqueta: "tags",
  tag: "tags",
  labels: "tags",
  categorías: "tags",
  categorias: "tags",
};

const MAX_PREVIEW_ROWS = 5;

// ── CSV Parser ─────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        current.push(field.trim());
        field = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        current.push(field.trim());
        field = "";
        if (current.some((c) => c !== "")) {
          lines.push(current);
        }
        current = [];
        if (ch === "\r") i++;
      } else {
        field += ch;
      }
    }
  }

  // Last field / last line
  current.push(field.trim());
  if (current.some((c) => c !== "")) {
    lines.push(current);
  }

  return lines;
}

// ── Auto-detect column mapping ─────────────────────────────────────
function detectColumnMapping(headers: string[]): {
  mapping: ColumnMapping;
  unmapped: string[];
} {
  const mapping: ColumnMapping = {
    name: "",
    phone: "",
    email: "",
    company: "",
    tags: "",
  };
  const mappedHeaders = new Set<string>();

  for (const [rawHeader, field] of Object.entries(KNOWN_HEADERS)) {
    const normalizedHeader = rawHeader.toLowerCase();
    const idx = headers.findIndex(
      (h) => h.toLowerCase() === normalizedHeader
    );
    if (idx !== -1 && !mappedHeaders.has(headers[idx])) {
      mapping[field] = headers[idx];
      mappedHeaders.add(headers[idx]);
    }
  }

  const unmapped = headers.filter((h) => !mappedHeaders.has(h));
  return { mapping, unmapped };
}

// ── Component ──────────────────────────────────────────────────────
interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (
    clients: ImportedClient[]
  ) => void;
}

export function CsvImportDialog({
  open,
  onOpenChange,
  onImport,
}: CsvImportDialogProps) {
  // State
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: "",
    phone: "",
    email: "",
    company: "",
    tags: "",
  });
  const [importedClients, setImportedClients] = useState<ImportedClient[]>(
    []
  );
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state on open
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setStep("upload");
        setFileName("");
        setRawRows([]);
        setHeaders([]);
        setColumnMapping({
          name: "",
          phone: "",
          email: "",
          company: "",
          tags: "",
        });
        setImportedClients([]);
        setRowErrors([]);
        setError(null);
        setImporting(false);
        setDragOver(false);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  // ── File Processing ─────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    setError(null);
    setImportedClients([]);
    setRowErrors([]);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("El archivo debe ser un archivo .csv");
      return;
    }

    if (file.size === 0) {
      setError("El archivo está vacío");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        setError("No se pudo leer el archivo");
        return;
      }

      const rows = parseCSV(text);
      if (rows.length < 2) {
        setError("El archivo no contiene suficientes datos (necesita encabezado y al menos una fila)");
        return;
      }

      const fileHeaders = rows[0];
      const dataRows = rows.slice(1);

      setHeaders(fileHeaders);
      setRawRows(dataRows);

      const { mapping, unmapped } = detectColumnMapping(fileHeaders);
      setColumnMapping(mapping);

      if (!mapping.name && !mapping.phone) {
        // Could not detect any required fields, go to mapping
        setStep("mapping");
        return;
      }

      if (unmapped.length > 0 && (!mapping.name || !mapping.phone)) {
        // Some required fields are unmapped
        setStep("mapping");
        return;
      }

      // Auto-mapping succeeded, go straight to preview
      const clients = mapRowsToClients(dataRows, mapping);
      setImportedClients(clients);
      setStep("preview");
    };

    reader.onerror = () => {
      setError("Error al leer el archivo");
    };

    reader.readAsText(file);
  }, []);

  // ── Map Rows ────────────────────────────────────────────────────
  const mapRowsToClients = (
    rows: string[][],
    mapping: ColumnMapping
  ): ImportedClient[] => {
    const clients: ImportedClient[] = [];
    const errors: RowError[] = [];

    rows.forEach((row, idx) => {
      const getVal = (field: keyof ColumnMapping) => {
        const colIdx = mapping[field]
          ? headers.findIndex((h) => h === mapping[field])
          : -1;
        return colIdx >= 0 ? (row[colIdx] || "").trim() : "";
      };

      const name = getVal("name");
      const phone = getVal("phone");
      const email = getVal("email");
      const company = getVal("company");
      const rawTags = getVal("tags");

      const tags = rawTags
        ? rawTags
            .split(/[;,|]/)
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      if (!name && !phone) {
        // Skip completely empty rows
        return;
      }

      if (!name) {
        errors.push({
          row: idx + 2,
          message: `Fila ${idx + 2}: falta el nombre`,
        });
      }

      if (!phone) {
        errors.push({
          row: idx + 2,
          message: `Fila ${idx + 2}: falta el teléfono`,
        });
      }

      clients.push({
        name: name || "Sin nombre",
        phone: phone || "",
        email,
        company,
        tags,
      });
    });

    setRowErrors(errors);
    return clients;
  };

  // ── Handlers ────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUpdateMapping = (field: keyof ColumnMapping, value: string) => {
    const newMapping = { ...columnMapping, [field]: value };
    setColumnMapping(newMapping);
  };

  const handleMappingConfirm = () => {
    if (!columnMapping.name || !columnMapping.phone) {
      setError("Debes mapear al menos las columnas de Nombre y Teléfono");
      return;
    }
    setError(null);
    const clients = mapRowsToClients(rawRows, columnMapping);
    setImportedClients(clients);
    setStep("preview");
  };

  const handleBackToMapping = () => {
    setStep("mapping");
    setImportedClients([]);
    setRowErrors([]);
    setError(null);
  };

  const handleImport = async () => {
    const validClients = importedClients.filter(
      (c) => c.name && c.name !== "Sin nombre" && c.phone
    );

    if (validClients.length === 0) {
      setError("No hay clientes válidos para importar");
      return;
    }

    setImporting(true);
    try {
      await onImport(validClients);
      setStep("success");
    } finally {
      setImporting(false);
    }
  };

  // ── Render helpers ──────────────────────────────────────────────
  const validCount = importedClients.filter(
    (c) => c.name && c.name !== "Sin nombre" && c.phone
  ).length;

  const errorCount = rowErrors.length;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {/* ── Step: Upload ─────────────────────────────────────── */}
        {step === "upload" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#25D366]/10">
                  <Upload className="h-4 w-4 text-[#25D366]" />
                </div>
                Importar Clientes CSV
              </DialogTitle>
              <DialogDescription>
                Sube un archivo CSV con tus contactos para importarlos al CRM
              </DialogDescription>
            </DialogHeader>

            <div
              className={`
                relative mt-4 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                ${
                  dragOver
                    ? "border-[#25D366] bg-[#25D366]/5 scale-[1.01]"
                    : "border-muted-foreground/25 hover:border-[#25D366]/50 hover:bg-muted/50"
                }
                ${error ? "border-destructive/50 bg-destructive/5" : ""}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200 ${
                  dragOver
                    ? "bg-[#25D366]/15"
                    : error
                    ? "bg-destructive/10"
                    : "bg-muted"
                }`}
              >
                <FileText
                  className={`h-7 w-7 ${
                    dragOver
                      ? "text-[#25D366]"
                      : error
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
              </div>

              <p className="text-sm font-medium mb-1">
                Arrastra tu archivo CSV aquí
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                o haz clic para seleccionar
              </p>

              <Button
                type="button"
                variant="outline"
                className="press-effect"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar archivo
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Formato esperado del CSV
              </p>
              <div className="space-y-1.5">
                {EXPECTED_FIELDS.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center gap-2 text-xs stagger-item"
                    style={{ animationDelay: `${EXPECTED_FIELDS.indexOf(f) * 0.05}s` }}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        f.key === "name" || f.key === "phone"
                          ? "bg-[#25D366]"
                          : "bg-muted-foreground/40"
                      }`}
                    />
                    <span className="font-mono">{f.label}</span>
                    {f.key === "name" || f.key === "phone" ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Requerido
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">
                        Opcional
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Se aceptan encabezados en español e inglés (Nombre/Name, Teléfono/Phone, etc.)
              </p>
            </div>
          </>
        )}

        {/* ── Step: Column Mapping ─────────────────────────────── */}
        {step === "mapping" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#25D366]/10">
                  <Users className="h-4 w-4 text-[#25D366]" />
                </div>
                Mapear Columnas
              </DialogTitle>
              <DialogDescription>
                Asigna cada columna de tu archivo a los campos del CRM
              </DialogDescription>
            </DialogHeader>

            {fileName && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border animate-fade-in">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">{fileName}</span>
                <Badge variant="outline" className="badge-animated text-[10px] ml-auto shrink-0">
                  {headers.length} columnas · {rawRows.length} filas
                </Badge>
              </div>
            )}

            <div className="space-y-3 mt-4">
              {EXPECTED_FIELDS.map((field, idx) => (
                <div
                  key={field.key}
                  className="stagger-item flex items-center gap-3"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <label className="text-sm font-medium w-24 shrink-0 flex items-center gap-1.5">
                    {field.key === "name" || field.key === "phone" ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                    ) : null}
                    {field.label}
                  </label>
                  <Select
                    value={columnMapping[field.key] || "__none__"}
                    onValueChange={(val) =>
                      handleUpdateMapping(field.key, val === "__none__" ? "" : val)
                    }
                  >
                    <SelectTrigger className="flex-1 input-glow">
                      <SelectValue placeholder="No mapear" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">
                        <span className="text-muted-foreground italic">No mapear</span>
                      </SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                className="press-effect"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-[#25D366] text-white hover:bg-[#128C7E] press-effect"
                onClick={handleMappingConfirm}
              >
                <Users className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step: Preview ────────────────────────────────────── */}
        {step === "preview" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#25D366]/10">
                  <Users className="h-4 w-4 text-[#25D366]" />
                </div>
                Vista Previa de Importación
              </DialogTitle>
              <DialogDescription>
                Revisa los datos antes de confirmar la importación
              </DialogDescription>
            </DialogHeader>

            {/* Stats bar */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border animate-fade-in">
              {fileName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[140px]">{fileName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Badge
                  variant="secondary"
                  className="badge-animated bg-[#25D366]/10 text-[#128C7E] border-[#25D366]/20"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {validCount} válido{validCount !== 1 ? "s" : ""}
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errorCount} error{errorCount !== 1 ? "es" : ""}
                  </Badge>
                )}
              </div>
            </div>

            {/* Warnings */}
            {errorCount > 0 && (
              <div className="max-h-20 overflow-y-auto rounded-lg bg-destructive/5 border border-destructive/20 p-3 space-y-1 animate-fade-in">
                {rowErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{err.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Preview table */}
            <div className="rounded-lg border overflow-hidden card-hover">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/80 border-b sticky top-0 z-10">
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                        #
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                        Nombre
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                        Teléfono
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden sm:table-cell">
                        Email
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden md:table-cell">
                        Empresa
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden lg:table-cell">
                        Etiquetas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {importedClients.slice(0, MAX_PREVIEW_ROWS).map((client, idx) => {
                      const hasError =
                        !client.name ||
                        client.name === "Sin nombre" ||
                        !client.phone;
                      return (
                        <tr
                          key={idx}
                          className={`stagger-item ${
                            hasError
                              ? "bg-destructive/5"
                              : idx % 2 === 0
                              ? ""
                              : "bg-muted/30"
                          }`}
                          style={{ animationDelay: `${idx * 0.04}s` }}
                        >
                          <td className="px-3 py-2 text-muted-foreground font-mono">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              {hasError && (
                                <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
                              )}
                              <span
                                className={
                                  !client.name || client.name === "Sin nombre"
                                    ? "text-destructive italic"
                                    : "font-medium"
                                }
                              >
                                {client.name || "Sin nombre"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono">
                            <span className={!client.phone ? "text-destructive italic" : ""}>
                              {client.phone || "Faltante"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell max-w-[140px] truncate">
                            {client.email || "—"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground hidden md:table-cell max-w-[100px] truncate">
                            {client.company || "—"}
                          </td>
                          <td className="px-3 py-2 hidden lg:table-cell">
                            <div className="flex gap-1 flex-wrap">
                              {client.tags.map((tag, ti) => (
                                <Badge
                                  key={ti}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {client.tags.length === 0 && (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* "X más" message */}
              {importedClients.length > MAX_PREVIEW_ROWS && (
                <div className="px-3 py-2 bg-muted/50 border-t text-xs text-muted-foreground text-center">
                  y {importedClients.length - MAX_PREVIEW_ROWS} más...
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                className="press-effect"
                onClick={handleBackToMapping}
              >
                Mapear Columnas
              </Button>
              <Button
                type="button"
                className="bg-[#25D366] text-white hover:bg-[#128C7E] press-effect"
                onClick={handleImport}
                disabled={validCount === 0 || importing}
              >
                {importing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Importar {validCount} cliente{validCount !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step: Success ────────────────────────────────────── */}
        {step === "success" && (
          <>
            <DialogHeader>
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#25D366]/15 flex items-center justify-center animate-bounce-in">
                    <CheckCircle2 className="h-8 w-8 text-[#25D366]" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 rounded-full animate-ping bg-[#25D366]/10" />
                </div>

                <div>
                  <DialogTitle className="text-xl">
                    ¡Importación Exitosa!
                  </DialogTitle>
                  <DialogDescription className="mt-2">
                    Se han importado{" "}
                    <span className="font-semibold text-[#128C7E]">
                      {validCount} cliente{validCount !== 1 ? "s" : ""}
                    </span>{" "}
                    a tu CRM correctamente.
                  </DialogDescription>
                </div>

                {/* Summary card */}
                <div className="w-full max-w-xs p-4 rounded-xl bg-muted/50 border card-hover stagger-item">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-[#25D366]">
                        {validCount}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Importados
                      </div>
                    </div>
                    {errorCount > 0 && (
                      <div>
                        <div className="text-lg font-bold text-destructive">
                          {errorCount}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          Con errores
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-lg font-bold">
                        {importedClients.filter((c) => c.email).length}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Con email
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {importedClients.filter((c) => c.company).length}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Con empresa
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="press-effect"
                onClick={() => handleOpenChange(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
