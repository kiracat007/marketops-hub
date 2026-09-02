import type { Lead } from "./types";

const headers = [
  "Name",
  "Company",
  "Email",
  "Phone",
  "Source",
  "Campaign",
  "Activity",
  "Partner",
  "Status",
  "Potential Value",
  "Owner",
  "Created Date",
];

function escapeCsvCell(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createLeadsCsv(leads: Lead[]) {
  const rows = leads.map((lead) => [
    lead.name,
    lead.company,
    lead.email,
    lead.phone,
    lead.source,
    lead.campaign,
    lead.activity,
    lead.partner,
    lead.status,
    lead.potentialValue,
    lead.owner,
    lead.createdAt,
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

export function exportLeadsCsv(leads: Lead[]) {
  const csv = createLeadsCsv(leads);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");

  link.href = url;
  link.download = `marketops-leads-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
