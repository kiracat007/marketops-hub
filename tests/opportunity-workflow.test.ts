import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculatePipelineSummary, leadStatusAfterOpportunityCreation, leadStatusAfterStageChange, prefillOpportunityFromLead } from "../src/components/opportunities/logic";
import { mapOpportunityRow, toOpportunityRow } from "../src/components/opportunities/supabase-data";
import type { Opportunity } from "../src/components/opportunities/types";

const timestamp = "2026-09-25T08:00:00Z";
const opportunities: Opportunity[] = [
  { id:"1",leadId:"l1",campaignId:"c1",name:"Discovery",company:"A",stage:"Discovery",value:100,owner:"Maya",expectedCloseDate:"2026-10-01",notes:"",createdAt:timestamp,updatedAt:timestamp },
  { id:"2",leadId:"l2",campaignId:"c1",name:"Proposal",company:"B",stage:"Proposal",value:250,owner:"Maya",expectedCloseDate:"2026-10-02",notes:"",createdAt:timestamp,updatedAt:timestamp },
  { id:"3",leadId:"l3",campaignId:"c1",name:"Won",company:"C",stage:"Won",value:400,owner:"Kai",expectedCloseDate:"2026-10-03",notes:"",createdAt:timestamp,updatedAt:timestamp },
  { id:"4",leadId:"l4",campaignId:"c1",name:"Lost",company:"D",stage:"Lost",value:500,owner:"Kai",expectedCloseDate:"2026-10-04",notes:"",createdAt:timestamp,updatedAt:timestamp },
];

describe("Opportunity mapping and pipeline workflow", () => {
  it("maps an Opportunity database row to frontend fields", () => {
    const result=mapOpportunityRow({id:"o1",lead_id:"l1",campaign_id:"c1",name:"Pilot",company:"Acme",stage:"Negotiation",value:"12000",owner:"Maya",expected_close_date:"2026-10-01",notes:null,created_at:timestamp,updated_at:timestamp});
    assert.equal(result.value,12000); assert.equal(result.leadId,"l1"); assert.equal(result.expectedCloseDate,"2026-10-01");
  });
  it("maps frontend Opportunity fields to Supabase columns", () => {
    const result=toOpportunityRow({leadId:"l1",campaignId:"c1",name:"Pilot",company:"Acme",stage:"Proposal",value:9000,owner:"Maya",expectedCloseDate:"2026-10-10",notes:"Review"});
    assert.deepEqual(result,{lead_id:"l1",campaign_id:"c1",name:"Pilot",company:"Acme",stage:"Proposal",value:9000,owner:"Maya",expected_close_date:"2026-10-10",notes:"Review"});
  });
  it("calculates Open Pipeline from open stages only", () => assert.equal(calculatePipelineSummary(opportunities).openPipeline,350));
  it("calculates Won Revenue from Won only", () => assert.equal(calculatePipelineSummary(opportunities).wonRevenue,400));
  it("calculates Win Rate from Won and Lost only", () => assert.equal(calculatePipelineSummary(opportunities).winRate,50));
  it("prefills an Opportunity from its Lead", () => {
    const result=prefillOpportunityFromLead({id:"l1",campaignId:"c1",name:"Ava",company:"Acme",email:"",phone:"",source:"Campaign",campaign:"Launch",activity:"",partner:"",status:"Qualified",potentialValue:12000,owner:"Maya",createdAt:"2026-09-01"});
    assert.equal(result.name,"Acme Opportunity"); assert.equal(result.campaignId,"c1"); assert.equal(result.owner,"Maya");
  });
  it("moves an eligible Lead to Opportunity after creation", () => assert.equal(leadStatusAfterOpportunityCreation("Qualified"),"Opportunity"));
  it("moves a linked Lead to Won", () => assert.equal(leadStatusAfterStageChange("Won"),"Won"));
  it("moves a linked Lead to Lost", () => assert.equal(leadStatusAfterStageChange("Lost"),"Lost"));
  it("does not downgrade a Lead when a closed Opportunity is reopened", () => { assert.equal(leadStatusAfterStageChange("Discovery"),null); assert.equal(leadStatusAfterStageChange("Proposal"),null); assert.equal(leadStatusAfterStageChange("Negotiation"),null); });
});
