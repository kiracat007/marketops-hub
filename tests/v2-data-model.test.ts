import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapCampaignRow } from "../src/components/campaigns/supabase-data";
import { mapActivityRow } from "../src/components/activities/supabase-data";
import { mapPartnerRow } from "../src/components/partners/supabase-data";
import { mapOpportunityRow } from "../src/components/opportunities/supabase-data";
import { calculateCampaignPerformance } from "../src/components/campaigns/performance";

const created = "2026-09-01T00:00:00Z";

describe("V2 relational data mapping", () => {
  it("maps Campaign database fields", () => {
    const result = mapCampaignRow({ id:"c1",name:"Thailand Q4",description:null,goal:"Pipeline",status:"Active",owner:"Maya",channel:"Event",start_date:"2026-10-01",end_date:"2026-12-20",budget:"180000",spend:"82000",target_leads:120,created_at:created,updated_at:created });
    assert.equal(result.startDate, "2026-10-01"); assert.equal(result.spend, 82000);
  });
  it("maps Activity foreign keys and joined names", () => {
    const result = mapActivityRow({ id:"a1",campaign_id:"c1",partner_id:"p1",name:"Expo",type:"Exhibition",status:"Completed",owner:null,start_date:null,end_date:null,budget:10,spend:5,target_leads:2,attendees:20,location:null,notes:null,created_at:created,updated_at:created,campaigns:{name:"Thailand Q4"},partners:{name:"Agency"} });
    assert.equal(result.campaignId, "c1"); assert.equal(result.partner, "Agency");
  });
  it("maps Partner fields", () => {
    const result = mapPartnerRow({ id:"p1",name:"Agency",company:null,type:"Agency",status:"Active",region:null,email:null,phone:null,notes:null,created_at:created,updated_at:created });
    assert.equal(result.type, "Agency"); assert.equal(result.email, "");
  });
  it("maps Opportunity relationships and numeric value", () => {
    const result = mapOpportunityRow({ id:"o1",lead_id:"l1",campaign_id:"c1",name:"Pilot",company:"Siam",stage:"Proposal",value:"85000",owner:null,expected_close_date:null,notes:null,created_at:created,updated_at:created });
    assert.equal(result.leadId, "l1"); assert.equal(result.value, 85000);
  });
  it("calculates campaign performance from Leads and Opportunities", () => {
    const leads = [
      { id:"l1",name:"A",company:"A",email:"",phone:"",source:"Event" as const,campaign:"C",activity:"A",partner:"P",status:"Qualified" as const,potentialValue:10,owner:"",createdAt:"2026-01-01" },
      { id:"l2",name:"B",company:"B",email:"",phone:"",source:"Event" as const,campaign:"C",activity:"A",partner:"P",status:"Won" as const,potentialValue:20,owner:"",createdAt:"2026-01-01" },
    ];
    const opportunities = [
      { id:"o1",leadId:"l1",campaignId:"c1",name:"One",company:"A",stage:"Proposal" as const,value:50,owner:"",expectedCloseDate:"",notes:"",createdAt:created,updatedAt:created },
      { id:"o2",leadId:"l2",campaignId:"c1",name:"Two",company:"B",stage:"Lost" as const,value:90,owner:"",expectedCloseDate:"",notes:"",createdAt:created,updatedAt:created },
    ];
    assert.deepEqual(calculateCampaignPerformance(leads, opportunities), { totalLeads:2,qualifiedLeads:2,opportunities:2,wonLeads:1,pipelineValue:50,wonRevenue:0 });
  });
});
