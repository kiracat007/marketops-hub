import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildUtmLink, type UtmFields } from "../src/components/campaigns/utm-builder";

const fields: UtmFields = {
  landingPageUrl: "https://example.com/demo",
  source: "linkedin",
  medium: "social",
  campaign: "fall_product_launch",
  content: "",
  term: "",
};

describe("UTM link generation", () => {
  it("builds a basic UTM link with encoded parameters", () => {
    const result = buildUtmLink({ ...fields, campaign: "fall product launch" });

    assert.equal(result.error, "");
    assert.equal(result.url, "https://example.com/demo?utm_source=linkedin&utm_medium=social&utm_campaign=fall+product+launch");
  });

  it("preserves existing query parameters", () => {
    const result = buildUtmLink({ ...fields, landingPageUrl: "https://example.com/demo?ref=homepage" });
    const url = new URL(result.url);

    assert.equal(url.searchParams.get("ref"), "homepage");
    assert.equal(url.searchParams.get("utm_source"), "linkedin");
  });

  it("omits optional content and term parameters when empty", () => {
    const result = buildUtmLink(fields);
    const url = new URL(result.url);

    assert.equal(url.searchParams.has("utm_content"), false);
    assert.equal(url.searchParams.has("utm_term"), false);
  });

  it("rejects an invalid or non-http URL", () => {
    assert.equal(buildUtmLink({ ...fields, landingPageUrl: "not a url" }).url, "");
    assert.equal(buildUtmLink({ ...fields, landingPageUrl: "ftp://example.com" }).error, "Enter a valid http or https URL.");
  });
});
