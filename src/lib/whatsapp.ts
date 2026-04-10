export const generateWhatsAppLink = (phone: string, message?: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (!cleanPhone) return "#";
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || "")}`;
};

export const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");
  }
  if (clean.length === 9) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  }
  return phone;
};

export const TEMPLATE_VARIABLES = [
  { key: "{nombre}", label: "Nombre", example: "Juan" },
  { key: "{apellido}", label: "Apellido", example: "Pérez" },
  { key: "{nombre_completo}", label: "Nombre completo", example: "Juan Pérez" },
  { key: "{empresa}", label: "Empresa", example: "Mi Empresa" },
  { key: "{telefono}", label: "Teléfono", example: "933667414" },
  { key: "{email}", label: "Email", example: "juan@email.com" },
  { key: "{fecha}", label: "Fecha hoy", example: "09/04/2026" },
  { key: "{hora}", label: "Hora actual", example: "14:30" },
];

export function replaceTemplateVars(text: string, client: { name?: string; phone?: string; email?: string; company?: string }): string {
  if (!text) return "";
  let result = text;
  const nameParts = (client.name || "").split(" ");
  result = result.replace(/{nombre}/g, nameParts[0] || "Cliente");
  result = result.replace(/{apellido}/g, nameParts.slice(1).join(" ") || "");
  result = result.replace(/{nombre_completo}/g, client.name || "Cliente");
  result = result.replace(/{empresa}/g, client.company || "tu empresa");
  result = result.replace(/{telefono}/g, client.phone || "");
  result = result.replace(/{email}/g, client.email || "");
  const today = new Date();
  result = result.replace(/{fecha}/g, today.toLocaleDateString("es-PE"));
  result = result.replace(/{hora}/g, today.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }));
  return result;
}

export function parseTags(tagsStr: string): string[] {
  if (!tagsStr) return ["Nuevo"];
  try {
    const parsed = JSON.parse(tagsStr);
    return Array.isArray(parsed) ? parsed : [tagsStr];
  } catch {
    return tagsStr.split(",").map(t => t.trim()).filter(Boolean);
  }
}

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags);
}
