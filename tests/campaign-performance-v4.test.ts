import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateActivityPerformance, calculateMarketingFunnel, calculatePerformance, calculateSourcePerformance, generateCampaignReportSummary, selectBestActivity } from "../src/components/campaigns/performance";
import type { Activity } from "../src/components/activities/types";
import type { Campaign } from "../src/components/campaigns/types";
import type { LeadRecord } from "../src/components/leads/types";
import type { Opportunity } from "../src/components/opportunities/types";

const leads: LeadRecord[] = [
  { id:"l1",name:"A",company:"Acme",email:"a@example.com",phone:"",source:"Event",campaign:"Campaign",campaignId:"c1",activity:"Event A",activityId:"a1",partner:"",status:"Qualified",potentialValue:100,owner:"Maya",createdAt:"2026-09-01" },
  { id:"l2",name:"B",company:"Beta",email:"b@example.com",phone:"",source:"Webinar",campaign:"Campaign",campaignId:"c1",activity:"Webinar B",activityId:"a2",partner:"",status:"Opportunity",potentialValue:200,owner:"Maya",createdAt:"2026-09-02" },
  { id:"l3",name:"C",company:"Core",email:"c@example.com",phone:"",source:"Event",campaign:"Campaign",campaignId:"c1",activity:"Event A",activityId:"a1",partner:"",status:"Won",potentialValue:300,owner:"Maya",createdAt:"2026-09-03" },
  { id:"l4",name:"D",company:"Delta",email:"d@example.com",phone:"",source:"Organic",campaign:"Campaign",campaignId:"c1",activity:"",activityId:"",partner:"",status:"New",potentialValue:50,owner:"Maya",createdAt:"2026-09-04" },
];
const opportunities: Opportunity[] = [
  { id:"o1",leadId:"l1",campaignId:"c1",name:"Open",company:"Acme",stage:"Discovery",value:500,owner:"Maya",expectedCloseDate:"",notes:"",createdAt:"",updatedAt:"" },
  { id:"o2",leadId:"l2",campaignId:"c1",name:"Won",company:"Beta",stage:"Won",value:1000,owner:"Maya",expectedCloseDate:"",notes:"",createdAt:"",updatedAt:"" },
  { id:"o3",leadId:"l3",campaignId:"c1",name:"Lost",company:"Core",stage:"Lost",value:800,owner:"Maya",expectedCloseDate:"",notes:"",createdAt:"",updatedAt:"" },
];
const activities: Activity[] = [
  { id:"a1",name:"Event A",type:"Event",campaign:"Campaign",campaignId:"c1",partner:"",owner:"Maya",location:"HK",startDate:"2026-09-01",endDate:"2026-09-01",status:"Completed",budget:500,spend:200,targetLeads:2 },
  { id:"a2",name:"Webinar B",type:"Webinar",campaign:"Campaign",campaignId:"c1",partner:"",owner:"Maya",location:"Online",startDate:"2026-09-02",endDate:"2026-09-02",status:"Completed",budget:300,spend:100,targetLeads:2 },
];
const campaign: Campaign = { id:"c1",name:"Campaign",channel:"Event",owner:"Maya",budget:1000,spend:400,startDate:"2026-09-01",endDate:"2026-09-30",status:"Completed",targetLeads:8,actualLeads:4 };

describe("V4 marketing attribution and campaign performance", () => {
  const metrics = calculatePerformance(leads, opportunities, 400, 8);
  it("calculates CPL", () => assert.equal(metrics.cpl, 100));
  it("calculates CPQL", () => assert.equal(metrics.cpql, 400 / 3));
  it("calculates Lead to Opportunity rate", () => assert.equal(metrics.leadToOpportunityRate, 75));
  it("calculates Win Rate from Won and Lost only", () => assert.equal(metrics.winRate, 50));
  it("calculates ROAS", () => assert.equal(metrics.roas, 2.5));
  it("calculates ROI", () => assert.equal(metrics.roi, 150));
  it("returns null instead of Infinity or NaN for zero divisors", () => { const empty=calculatePerformance([],[],0,0); assert.equal(empty.cpl,null); assert.equal(empty.cpql,null); assert.equal(empty.roas,null); assert.equal(empty.roi,null); assert.equal(empty.targetLeadAttainment,null); });
  it("defines Qualified Leads as Qualified, Opportunity, and Won", () => assert.equal(metrics.qualifiedLeads, 3));
  it("excludes Won and Lost from Open Pipeline", () => assert.equal(metrics.openPipeline, 500));
  it("counts only Won Opportunity value as Won Revenue", () => assert.equal(metrics.wonRevenue, 1000));
  it("attributes Activity outcomes through Opportunity lead_id to Lead activity_id", () => { const rows=calculateActivityPerformance(activities,leads,opportunities); assert.equal(rows[0].metrics.opportunities,2); assert.equal(rows[0].metrics.openPipeline,500); assert.equal(rows[1].metrics.wonRevenue,1000); });
  it("attributes Source outcomes through the linked Lead", () => { const rows=calculateSourcePerformance(leads,opportunities); const event=rows.find((row)=>row.source==="Event"); assert.equal(event?.opportunities,2); assert.equal(event?.wonRevenue,0); const webinar=rows.find((row)=>row.source==="Webinar"); assert.equal(webinar?.wonRevenue,1000); });
  it("calculates the real four-stage funnel and stage conversion", () => { const funnel=calculateMarketingFunnel(leads,opportunities); assert.deepEqual(funnel.map((stage)=>stage.count),[4,3,3,1]); assert.equal(funnel[1].conversionFromPrevious,75); assert.ok(Math.abs((funnel[3].conversionFromPrevious ?? 0)-(100/3))<0.000001); });
  it("calculates Target Lead Attainment", () => assert.equal(metrics.targetLeadAttainment,50));
  it("selects the best Activity using ROI before volume", () => { const best=selectBestActivity(calculateActivityPerformance(activities,leads,opportunities)); assert.equal(best?.activity.id,"a2"); });
  it("generates a factual Campaign report summary", () => { const summary=generateCampaignReportSummary(campaign,metrics,calculateActivityPerformance(activities,leads,opportunities)); assert.match(summary,/4 条 Leads/); assert.match(summary,/3 条达到 Qualified/); assert.match(summary,/ROI 为 150\.0%/); assert.match(summary,/Webinar B/); });
});
