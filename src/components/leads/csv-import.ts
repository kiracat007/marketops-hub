import { leadSources, leadStatuses, type LeadDraft, type LeadSource, type LeadStatus } from "./types";

const requiredHeaders = [
  "name",
  "company",
  "email",
  "phone",
  "source",
  "campaign",
  "activity",
  "partner",
  "status",
  "potentialValue",
  "owner",
  "createdAt",
] as const;

const headerAliases: Record<string, (typeof requiredHeaders)[number]> = {
  name: "name",
  company: "company",
  email: "email",
  phone: "phone",
  source: "source",
  campaign: "campaign",
  activity: "activity",
  partner: "partner",
  status: "status",
  potentialvalue: "potentialValue",
  owner: "owner",
  createdat: "createdAt",
  createddate: "createdAt",
};

export type LeadImportRow = {
  rowNumber: number;
  lead: LeadDraft | null;
  values: Record<string, string>;
  errors: string[];
};

export type LeadImportPreview = {
  rows: LeadImportRow[];
  missingHeaders: string[];
};

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function localDate() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

function normalizeHeader(header: string) {
  const key = header.trim().toLocaleLowerCase().replace(/[\s_-]+/g, "");
  return headerAliases[key] ?? header.trim();
}

export function parseLeadsCsv(text: string): LeadImportPreview {
  const parsedRows = parseCsvRows(text.replace(/^\uFEFF/, ""));
  if (parsedRows.length === 0) return { rows: [], missingHeaders: [...requiredHeaders] };

  const headers = parsedRows[0].map(normalizeHeader);
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) return { rows: [], missingHeaders };

  const rows = parsedRows.slice(1).map((cells, index): LeadImportRow => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cells[column]?.trim() ?? ""]));
    const errors: string[] = [];
    const amountText = values.potentialValue;
    const amount = Number(amountText);

    if (!values.name) errors.push("Name is required");
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push("Email format is invalid");
    if (!amountText || !Number.isFinite(amount) || amount < 0) errors.push("Potential Value must be a non-negative number");
    if (!leadStatuses.includes(values.status as LeadStatus)) errors.push("Status is not supported");
    if (!leadSources.includes(values.source as LeadSource)) errors.push("Source is not supported");

    const lead: LeadDraft | null = errors.length === 0 ? {
      name: values.name,
      company: values.company,
      email: values.email,
      phone: values.phone,
      source: values.source as LeadSource,
      campaign: values.campaign || "未关联",
      activity: values.activity || "未关联",
      partner: values.partner || "未关联",
      status: values.status as LeadStatus,
      potentialValue: amount,
      owner: values.owner,
      createdAt: values.createdAt || localDate(),
    } : null;

    return { rowNumber: index + 2, lead, values, errors };
  });

  return { rows, missingHeaders: [] };
}

export const leadCsvTemplate = `${requiredHeaders.join(",")}\r\nJane Smith,Example Company,jane@example.com,+1 555 0100,Webinar,Industry Webinar,Product Demo,Northstar Creative,New,25000,Alex Morgan,2026-09-03`;

export function downloadLeadCsvTemplate() {
  const blob = new Blob(["\uFEFF", leadCsvTemplate], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "marketops-leads-template.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
