import assert from "node:assert/strict";import{describe,it}from"node:test";
import{calculateCampaignComparison,calculateDataQuality,calculateFollowUpEffectiveness,calculateFollowUpSpeed,calculateFunnelBreakdown,calculateFunnelDiagnostics,calculateOverdueFollowUps,calculateOwnerAnalysis,calculateSegmentMetrics,calculateSourceAnalysis,classifySourceQuality,comparePeriods,firstContactHours,followUpSpeedBucket,groupByDimension,medianFirstContactHours,weeklyTrend}from"../src/components/analytics/analytics";
import type{Campaign}from"../src/components/campaigns/types";import type{Activity}from"../src/components/activities/types";import type{LeadRecord}from"../src/components/leads/types";import type{Opportunity}from"../src/components/opportunities/types";import type{Task}from"../src/components/tasks/types";
const now=new Date("2026-09-26T12:00:00Z");
const campaigns:Campaign[]=[{id:"c1",name:"A",channel:"Event",owner:"Maya",budget:1000,spend:500,startDate:"2026-08-01",endDate:"2026-10-01",status:"Active",targetLeads:10,actualLeads:3},{id:"c2",name:"B",channel:"Webinar",owner:"Lee",budget:0,spend:0,startDate:"2026-08-01",endDate:"2026-10-01",status:"Active",targetLeads:0,actualLeads:1}];
const activities:Activity[]=[{id:"a1",campaignId:"c1",name:"Event",type:"Event",campaign:"A",partner:"",owner:"Maya",location:"HK",startDate:"2026-09-01",endDate:"2026-09-01",status:"Completed",budget:100,spend:50}];
const leads:LeadRecord[]=[
{id:"l1",name:"One",company:"A",email:"",phone:"",source:"Event",campaign:"A",campaignId:"c1",activity:"Event",activityId:"a1",partner:"",status:"Qualified",potentialValue:10,owner:"Maya",createdAt:"2026-09-25T08:00:00Z",lastContactedAt:"2026-09-25T12:00:00Z",nextFollowUpAt:"2026-09-20T00:00:00Z",followUpStatus:"In Progress"},
{id:"l2",name:"Two",company:"B",email:"",phone:"",source:"Event",campaign:"A",campaignId:"c1",activity:"Event",activityId:"a1",partner:"",status:"New",potentialValue:10,owner:"Maya",createdAt:"2026-09-18T08:00:00Z"},
{id:"l3",name:"Three",company:"C",email:"",phone:"",source:"Organic",campaign:"B",campaignId:"c2",activity:"",partner:"",status:"Won",potentialValue:10,owner:"Lee",createdAt:"2026-09-10T08:00:00Z",lastContactedAt:"2026-09-19T08:00:00Z"},
];
const opportunities:Opportunity[]=[{id:"o1",leadId:"l1",campaignId:"c1",name:"Deal",company:"A",stage:"Proposal",value:100,owner:"Maya",expectedCloseDate:"",notes:"",createdAt:"2026-09-25T00:00:00Z",updatedAt:""},{id:"o2",leadId:"l3",campaignId:"c2",name:"Won",company:"C",stage:"Won",value:500,owner:"Lee",expectedCloseDate:"",notes:"",createdAt:"2026-09-11T00:00:00Z",updatedAt:""},{id:"o3",leadId:"",campaignId:"c1",name:"Unlinked",company:"",stage:"Discovery",value:50,owner:"",expectedCloseDate:"",notes:"",createdAt:"2026-09-20T00:00:00Z",updatedAt:""}];
const tasks:Task[]=[{id:"t1",title:"Call",description:"",type:"Call",status:"Open",priority:"High",owner:"Maya",dueAt:"2026-09-20T00:00:00Z",leadId:"l1",opportunityId:"",campaignId:"c1",activityId:"",createdAt:"2026-09-20T00:00:00Z",updatedAt:"",completedAt:""},{id:"t2",title:"Done",description:"",type:"Email",status:"Completed",priority:"Low",owner:"Lee",dueAt:"2026-09-21T00:00:00Z",leadId:"l3",opportunityId:"",campaignId:"c2",activityId:"",createdAt:"2026-09-10T00:00:00Z",updatedAt:"",completedAt:"2026-09-12T00:00:00Z"}];
describe("V6 analytics pure functions",()=>{
it("calculates Campaign comparison metrics",()=>{const r=calculateCampaignComparison(campaigns,leads,opportunities)[0];assert.equal(r.metrics.leads,2);assert.equal(r.budgetUtilization,50);});
it("handles zero denominators in Campaign comparison",()=>{const r=calculateCampaignComparison(campaigns,leads,opportunities)[1];assert.equal(r.budgetUtilization,null);assert.equal(r.metrics.cpl,0);assert.equal(r.metrics.targetLeadAttainment,null);});
it("aggregates Sources",()=>{const r=calculateSourceAnalysis(leads,opportunities);assert.equal(r.rows.find(x=>x.source==="Event")?.leads,2);});
it("reports unattributed Opportunities",()=>assert.equal(calculateSourceAnalysis(leads,opportunities).unattributedOpportunities,1));
it("classifies Source quality relative to medians",()=>assert.match(classifySourceQuality(calculateSourceAnalysis(leads,opportunities).rows)[0].classification,/Volume.*Quality/));
it("calculates funnel drop-off",()=>{const r=calculateFunnelDiagnostics(leads,opportunities);assert.equal(r.rows[1].dropOffCount,1);});
it("finds largest funnel drop-off",()=>assert.equal(calculateFunnelDiagnostics(leads,opportunities).largestDropOff,"Leads → Qualified Leads"));
it("breaks Funnel down by Source",()=>assert.equal(calculateFunnelBreakdown(leads,opportunities,activities,"Source").find(x=>x.segment==="Event")?.funnel[0].count,2));
it("segments contacted versus uncontacted Leads",()=>{const r=calculateFollowUpEffectiveness(leads,opportunities);assert.equal(r.find(x=>x.label==="Contacted")?.leads,2);assert.equal(r.find(x=>x.label==="Not Contacted")?.leads,1);});
it("buckets follow-up speed",()=>{assert.equal(followUpSpeedBucket(4),"Same day");assert.equal(followUpSpeedBucket(48),"1–3 days");assert.equal(followUpSpeedBucket(null),"No contact");});
it("calculates first-contact hours",()=>assert.equal(firstContactHours(leads[0]),4));
it("calculates median first-contact time",()=>assert.equal(medianFirstContactHours(leads),110));
it("calculates follow-up speed segment metrics",()=>assert.equal(calculateFollowUpSpeed(leads,opportunities).reduce((sum,row)=>sum+row.leads,0),3));
it("analyzes overdue follow-ups by status",()=>{const r=calculateOverdueFollowUps(leads,now);assert.equal(r.count,1);assert.equal(r.byStatus[0].status,"Qualified");assert.equal(r.noNextFollowUp,1);});
it("aggregates Owner workload without rating",()=>{const r=calculateOwnerAnalysis(leads,opportunities,tasks,now).find(x=>x.owner==="Maya");assert.equal(r?.assignedLeads,2);assert.equal(r?.overdueTasks,1);});
it("calculates weekly Lead trend from createdAt",()=>assert.equal(weeklyTrend(leads,x=>x.createdAt,now).reduce((s,x)=>s+x.count,0),3));
it("calculates weekly Opportunity trend from createdAt",()=>assert.equal(weeklyTrend(opportunities,x=>x.createdAt,now).reduce((s,x)=>s+x.count,0),3));
it("does not produce Infinity when previous period is zero",()=>assert.equal(comparePeriods(4,0).percentageChange,null));
it("groups by a declared dimension",()=>assert.equal(groupByDimension(leads,x=>x.owner).Maya.length,2));
it("calculates shared segment metrics",()=>assert.equal(calculateSegmentMetrics(leads.slice(0,2),opportunities).leadsWithOpportunity,1));
it("calculates data completeness indicators",()=>{const r=calculateDataQuality(campaigns,leads,opportunities,tasks);assert.equal(r.campaignAttribution.coverage,100);assert.equal(r.opportunityLeadCoverage.complete,2);});
it("reports incomplete data without inventing a score",()=>{const r=calculateDataQuality(campaigns,[{...leads[0],owner:"",campaignId:""}],opportunities,tasks);assert.equal(r.ownerCoverage.coverage,0);assert.equal("score" in r,false);});
it("flags small Source samples",()=>assert.equal(calculateSourceAnalysis(leads,opportunities).rows.every(x=>x.smallSample),true));
it("handles no-data state",()=>{assert.deepEqual(calculateSourceAnalysis([],[]),{rows:[],unattributedOpportunities:0});assert.equal(medianFirstContactHours([]),null);});
});
