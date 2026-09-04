import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { markDuplicateLeadEmails, parseLeadsCsv } from "../src/components/leads/csv-import";

const internalHeader = "name,company,email,phone,source,campaign,activity,partner,status,potentialValue,owner,createdAt";

function csvRow(overrides: Partial<Record<string, string>> = {}) {
  const values = {
    name: "Jane Smith",
    company: "Example Co",
    email: "jane@example.com",
    phone: "+1 555 0100",
    source: "Campaign",
    campaign: "Launch Campaign",
    activity: "Launch Event",
    partner: "Example Partner",
    status: "New",
    potentialValue: "25000",
    owner: "Alex Morgan",
    createdAt: "2026-09-04",
    ...overrides,
  };

  return Object.values(values).join(",");
}

describe("Lead CSV parsing and validation", () => {
  it("normalizes friendly headers, case, whitespace, quotes, and a UTF-8 BOM", () => {
    const header = '\uFEFF" Name ",COMPANY,Email,Phone,Source,Campaign,Activity,Partner,Status,"Potential Value",Owner,"Created Date"';
    const preview = parseLeadsCsv(`${header}\r\n${csvRow()}`);

    assert.deepEqual(preview.missingHeaders, []);
    assert.equal(preview.rows[0].lead?.potentialValue, 25000);
    assert.equal(preview.rows[0].lead?.createdAt, "2026-09-04");
  });

  it("accepts an empty email and a valid email", () => {
    const preview = parseLeadsCsv(`${internalHeader}\n${csvRow()}\n${csvRow({ email: "" })}`);

    assert.equal(preview.rows.length, 2);
    assert.ok(preview.rows.every((row) => row.errors.length === 0));
  });

  it("rejects an invalid email", () => {
    const preview = parseLeadsCsv(`${internalHeader}\n${csvRow({ email: "not-an-email" })}`);

    assert.deepEqual(preview.rows[0].errors, ["Email format is invalid"]);
  });

  it("rejects a negative potential value", () => {
    const preview = parseLeadsCsv(`${internalHeader}\n${csvRow({ potentialValue: "-1" })}`);

    assert.deepEqual(preview.rows[0].errors, ["Potential Value must be a non-negative number"]);
  });

  it("rejects unsupported status and source values", () => {
    const preview = parseLeadsCsv(`${internalHeader}\n${csvRow({ status: "Archived", source: "Referral" })}`);

    assert.deepEqual(preview.rows[0].errors, ["Status is not supported", "Source is not supported"]);
  });
});

describe("Lead CSV duplicate email validation", () => {
  it("ignores case and surrounding whitespace when comparing emails", () => {
    const preview = parseLeadsCsv(`${internalHeader}\n${csvRow({ email: "  JANE@EXAMPLE.COM  " })}`);
    const checked = markDuplicateLeadEmails(preview, ["jane@example.com"]);

    assert.equal(checked.rows[0].lead, null);
    assert.deepEqual(checked.rows[0].errors, ["Duplicate email"]);
  });

  it("does not treat empty emails as duplicates", () => {
    const preview = parseLeadsCsv(`${internalHeader}\n${csvRow({ email: "" })}\n${csvRow({ email: "" })}`);
    const checked = markDuplicateLeadEmails(preview, [""]);

    assert.ok(checked.rows.every((row) => row.lead !== null));
  });
});
