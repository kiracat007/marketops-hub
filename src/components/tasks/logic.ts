import type { LeadRecord } from "@/components/leads/types";
import type { Task, TaskDraft, TaskPriority } from "./types";

export type DueCategory="overdue"|"today"|"upcoming"|"none"|"completed";
const priorityRank:Record<TaskPriority,number>={High:0,Medium:1,Low:2};
function localDay(value:Date){return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`;}
export function getTaskDueCategory(task:Pick<Task,"dueAt"|"status">,now=new Date()):DueCategory{if(task.status==="Completed"||task.status==="Cancelled")return"completed";if(!task.dueAt)return"none";const due=new Date(task.dueAt);if(Number.isNaN(due.getTime()))return"none";if(localDay(due)===localDay(now))return"today";return due<now?"overdue":"upcoming";}
export function compareTasksByAttention(a:Task,b:Task,now=new Date()){const rank:Record<DueCategory,number>={overdue:0,today:1,upcoming:2,none:3,completed:4};const category=rank[getTaskDueCategory(a,now)]-rank[getTaskDueCategory(b,now)];if(category)return category;return(a.dueAt||"9999").localeCompare(b.dueAt||"9999")||priorityRank[a.priority]-priorityRank[b.priority];}
export function compareTaskPriority(a:Pick<Task,"priority">,b:Pick<Task,"priority">){return priorityRank[a.priority]-priorityRank[b.priority];}
export function prefillFollowUpTask(lead:LeadRecord):TaskDraft{return{title:`Follow up with ${lead.name}`,description:"",type:"Follow-up",status:"Open",priority:"Medium",owner:lead.owner,dueAt:lead.nextFollowUpAt??"",leadId:typeof lead.id==="string"?lead.id:"",opportunityId:"",campaignId:lead.campaignId??"",activityId:lead.activityId??""};}
export function shouldUpdateLeadWhenTaskCompletes(task:Pick<Task,"type"|"leadId">){return task.type==="Follow-up"&&Boolean(task.leadId);}
export function leadChangesForCompletedTask(task:Pick<Task,"type"|"leadId">,now=new Date()){return shouldUpdateLeadWhenTaskCompletes(task)?{lastContactedAt:now.toISOString()}:null;}
