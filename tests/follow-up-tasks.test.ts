import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { canMarkLeadAsContacted, getFollowUpTiming, markAsContactedChanges, matchesLeadQuickFilter } from "../src/components/leads/follow-up";
import { LeadDetailModal } from "../src/components/leads/lead-detail-modal";
import { mapLeadRow } from "../src/components/leads/supabase-data";
import type { LeadRecord } from "../src/components/leads/types";
import { compareTaskPriority, getTaskDueCategory, leadChangesForCompletedTask, prefillFollowUpTask } from "../src/components/tasks/logic";
import { mapTaskRow, toTaskRow } from "../src/components/tasks/supabase-data";
import type { Task } from "../src/components/tasks/types";

const now = new Date(2026, 8, 25, 12, 0, 0);
const lead: LeadRecord = { id:"l1",name:"Dao Mali",company:"Siam",email:"dao@example.com",phone:"",source:"Campaign",campaign:"Thailand Q4",campaignId:"c1",activity:"Demo",activityId:"a1",partner:"Agency",status:"Qualified",potentialValue:10000,owner:"Maya",createdAt:"2026-09-01",nextFollowUpAt:new Date(2026,8,26,10).toISOString(),followUpStatus:"In Progress",lastContactedAt:"",notes:"Call before demo" };
const baseTask: Task={id:"t1",title:"Follow up",description:"",type:"Follow-up",status:"Open",priority:"Medium",owner:"Maya",dueAt:new Date(2026,8,25,10).toISOString(),leadId:"l1",opportunityId:"",campaignId:"c1",activityId:"",createdAt:now.toISOString(),updatedAt:now.toISOString(),completedAt:""};

describe("Lead follow-up and Task logic",()=>{
  it("maps Lead follow-up database fields",()=>{const result=mapLeadRow({id:"l1",name:"Dao",company:null,email:null,phone:null,source:"Campaign",campaign:null,activity:null,partner:null,status:"Contacted",potential_value:0,owner:null,created_at:now.toISOString(),last_contacted_at:"2026-09-24T02:00:00Z",next_follow_up_at:"2026-09-26T02:00:00Z",follow_up_status:"Waiting",notes:"Reply pending"});assert.equal(result.followUpStatus,"Waiting");assert.equal(result.notes,"Reply pending");});
  it("marks a Lead as contacted with an active follow-up",()=>{const result=markAsContactedChanges({status:"New",followUpStatus:"Not Started"},now);assert.equal(result.lastContactedAt,now.toISOString());assert.equal(result.followUpStatus,"In Progress");});
  it("moves New to Contacted",()=>assert.equal(markAsContactedChanges({status:"New",followUpStatus:""},now).status,"Contacted"));
  it("does not move Qualified backward",()=>assert.equal(markAsContactedChanges({status:"Qualified",followUpStatus:"Waiting"},now).status,"Qualified"));
  it("detects overdue follow-up",()=>assert.equal(getFollowUpTiming(new Date(2026,8,24,10).toISOString(),"In Progress",now),"overdue"));
  it("detects due-today follow-up",()=>assert.equal(getFollowUpTiming(new Date(2026,8,25,18).toISOString(),"Waiting",now),"today"));
  it("does not count a completed follow-up as overdue",()=>assert.equal(getFollowUpTiming(new Date(2026,8,24,10).toISOString(),"Completed",now),"completed"));
  it("maps Task fields in both directions",()=>{const row={id:"t1",title:"Call",description:null,type:"Call" as const,status:"Open" as const,priority:"High" as const,owner:null,due_at:null,lead_id:"l1",opportunity_id:null,campaign_id:null,activity_id:null,created_at:now.toISOString(),updated_at:now.toISOString(),completed_at:null};const mapped=mapTaskRow(row);assert.equal(mapped.leadId,"l1");assert.equal(toTaskRow(mapped).lead_id,"l1");});
  it("sorts High priority before Medium and Low",()=>{const high={...baseTask,id:"h",priority:"High" as const};const low={...baseTask,id:"l",priority:"Low" as const};assert.ok(compareTaskPriority(high,low)<0);});
  it("prefills a Follow-up Task from a Lead",()=>{const result=prefillFollowUpTask(lead);assert.equal(result.title,"Follow up with Dao Mali");assert.equal(result.owner,"Maya");assert.equal(result.dueAt,lead.nextFollowUpAt);});
  it("completing a Follow-up Task produces last-contacted changes",()=>assert.deepEqual(leadChangesForCompletedTask(baseTask,now),{lastContactedAt:now.toISOString()}));
  it("filters Leads by follow-up timing",()=>{assert.equal(matchesLeadQuickFilter({...lead,nextFollowUpAt:new Date(2026,8,24,10).toISOString()},"overdue",now),true);assert.equal(matchesLeadQuickFilter({...lead,nextFollowUpAt:"",status:"New"},"none",now),true);});
  it("detects Task due categories",()=>{assert.equal(getTaskDueCategory(baseTask,now),"today");assert.equal(getTaskDueCategory({...baseTask,dueAt:new Date(2026,8,24,10).toISOString()},now),"overdue");assert.equal(getTaskDueCategory({...baseTask,status:"Completed"},now),"completed");});
  it("shows Mark as Contacted for active Lead statuses",()=>{for(const status of ["New","Contacted","Qualified","Opportunity"] as const){assert.equal(canMarkLeadAsContacted(status),true);const markup=renderToStaticMarkup(createElement(LeadDetailModal,{lead:{...lead,status},contactPending:false,contactFeedback:null,onClose:()=>{},onEdit:()=>{},onCreateOpportunity:()=>{},onMarkContacted:()=>{},onCreateTask:()=>{}}));assert.match(markup,/标记为已联系/);}});
  it("hides Mark as Contacted for Won and Lost Leads",()=>{for(const status of ["Won","Lost"] as const){assert.equal(canMarkLeadAsContacted(status),false);const markup=renderToStaticMarkup(createElement(LeadDetailModal,{lead:{...lead,status},contactPending:false,contactFeedback:null,onClose:()=>{},onEdit:()=>{},onCreateOpportunity:()=>{},onMarkContacted:()=>{},onCreateTask:()=>{}}));assert.doesNotMatch(markup,/标记为已联系/);assert.match(markup,/创建跟进任务/);}});
  it("disables the Mark as Contacted button while saving",()=>{const markup=renderToStaticMarkup(createElement(LeadDetailModal,{lead,contactPending:true,contactFeedback:null,onClose:()=>{},onEdit:()=>{},onCreateOpportunity:()=>{},onMarkContacted:()=>{},onCreateTask:()=>{}}));assert.match(markup,/disabled=""/);assert.match(markup,/记录中\.\.\./);});
  it("renders the successful contacted state",()=>{const updated={...lead,...markAsContactedChanges({status:"New",followUpStatus:"Not Started"},now)};const markup=renderToStaticMarkup(createElement(LeadDetailModal,{lead:updated,contactPending:false,contactFeedback:{type:"success",message:"已记录本次联系"},onClose:()=>{},onEdit:()=>{},onCreateOpportunity:()=>{},onMarkContacted:()=>{},onCreateTask:()=>{}}));assert.match(markup,/已记录本次联系/);assert.equal(updated.status,"Contacted");assert.equal(updated.followUpStatus,"In Progress");});
});
