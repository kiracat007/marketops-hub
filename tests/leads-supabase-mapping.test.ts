import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapLeadRow, toLeadRow, type LeadRow } from "../src/components/leads/supabase-data";
import type { LeadDraft } from "../src/components/leads/types";

const draft: LeadDraft = {
  name: "Jane Smith",
  company: "Example Co",
  email: "jane@example.com",
  phone: "+1 555 0100",
  source: "Webinar",
  campaign: "Growth Webinar",
  campaignId: "campaign-id",
  activity: "Product Demo",
  activityId: "activity-id",
  partner: "Example Partner",
  partnerId: "partner-id",
  status: "Qualified",
  potentialValue: 25000,
  owner: "Alex Morgan",
  createdAt: "2026-09-04",
};

describe("Lead and Supabase row mapping", () => {
  it("maps a frontend Lead draft to Supabase column names", () => {
    assert.deepEqual(toLeadRow(draft), {
      name: "Jane Smith",
      company: "Example Co",
      email: "jane@example.com",
      phone: "+1 555 0100",
      source: "Webinar",
      campaign: "Growth Webinar",
      activity: "Product Demo",
      partner: "Example Partner",
      campaign_id: "campaign-id",
      activity_id: "activity-id",
      partner_id: "partner-id",
      status: "Qualified",
      potential_value: 25000,
      owner: "Alex Morgan",
      created_at: "2026-09-04",
    });
  });

  it("maps a Supabase row to the frontend Lead shape", () => {
    const row: LeadRow = {
      id: "c237e60a-2079-44a1-9d4e-b76ca6410c4a",
      name: "Jane Smith",
      company: "Example Co",
      email: "jane@example.com",
      phone: "+1 555 0100",
      source: "Webinar",
      campaign: "Growth Webinar",
      activity: "Product Demo",
      partner: "Example Partner",
      campaign_id: "campaign-id",
      activity_id: "activity-id",
      partner_id: "partner-id",
      status: "Qualified",
      potential_value: "25000",
      owner: "Alex Morgan",
      created_at: "2026-09-04T12:30:00+00:00",
    };

    assert.deepEqual(mapLeadRow(row), {
      id: row.id,
      ...draft,
    });
  });
});
