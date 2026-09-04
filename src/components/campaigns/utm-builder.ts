export type UtmFields = {
  landingPageUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
};

export type UtmBuildResult = {
  url: string;
  error: string;
};

export function buildUtmLink(fields: UtmFields): UtmBuildResult {
  const landingPageUrl = fields.landingPageUrl.trim();
  if (!landingPageUrl) return { url: "", error: "Landing Page URL is required." };

  let url: URL;
  try {
    url = new URL(landingPageUrl);
  } catch {
    return { url: "", error: "Enter a valid http or https URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { url: "", error: "Enter a valid http or https URL." };
  }

  if (!fields.source.trim() || !fields.medium.trim() || !fields.campaign.trim()) {
    return { url: "", error: "Source, Medium, and Campaign are required." };
  }

  url.searchParams.set("utm_source", fields.source.trim());
  url.searchParams.set("utm_medium", fields.medium.trim());
  url.searchParams.set("utm_campaign", fields.campaign.trim());

  if (fields.content.trim()) url.searchParams.set("utm_content", fields.content.trim());
  else url.searchParams.delete("utm_content");

  if (fields.term.trim()) url.searchParams.set("utm_term", fields.term.trim());
  else url.searchParams.delete("utm_term");

  return { url: url.toString(), error: "" };
}
