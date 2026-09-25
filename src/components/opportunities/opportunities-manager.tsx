"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCampaigns } from "@/components/campaigns/supabase-data";
import type { Campaign } from "@/components/campaigns/types";
import { fetchLeadsFromSupabase, updateLeadStatusInSupabase } from "@/components/leads/supabase-data";
import type { LeadRecord } from "@/components/leads/types";
import { calculatePipelineSummary, leadStatusAfterOpportunityCreation, leadStatusAfterStageChange } from "./logic";
import { OpportunityDetailModal } from "./opportunity-detail-modal";
import { OpportunityFormModal } from "./opportunity-form-modal";
import { OpportunityStatusBadge } from "./status-badge";
import { OpportunityTable } from "./opportunity-table";
import { createOpportunity, deleteOpportunity, fetchOpportunities, updateOpportunity } from "./supabase-data";
import { opportunityStages, type Opportunity, type OpportunityDraft } from "./types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
type SortKey = "updated" | "value" | "close";

export function OpportunitiesManager() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]); const [leads, setLeads] = useState<LeadRecord[]>([]); const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [search, setSearch] = useState(""); const [stage, setStage] = useState("All"); const [campaign, setCampaign] = useState("All"); const [owner, setOwner] = useState("All"); const [sort, setSort] = useState<SortKey>("updated");
  const [editing, setEditing] = useState<Opportunity | null>(null); const [viewing, setViewing] = useState<Opportunity | null>(null); const [formOpen, setFormOpen] = useState(false); const [saveError, setSaveError] = useState("");
  useEffect(() => { let active = true; Promise.all([fetchOpportunities(), fetchLeadsFromSupabase(), fetchCampaigns()]).then(([o,l,c]) => { if(active){setOpportunities(o);setLeads(l);setCampaigns(c);} }).catch(() => { if(active)setError("Unable to load Opportunities from Supabase. Please check the connection and demo permissions."); }).finally(() => { if(active)setLoading(false); }); return()=>{active=false;}; },[]);
  const owners = [...new Set(opportunities.map((item) => item.owner).filter(Boolean))].sort();
  const filtered = useMemo(() => { const term=search.trim().toLowerCase(); return opportunities.filter((item)=>(item.name.toLowerCase().includes(term)||item.company.toLowerCase().includes(term))&&(stage==="All"||item.stage===stage)&&(campaign==="All"||item.campaignId===campaign)&&(owner==="All"||item.owner===owner)).sort((a,b)=>sort==="value"?b.value-a.value:sort==="close"?(a.expectedCloseDate||"9999").localeCompare(b.expectedCloseDate||"9999"):b.updatedAt.localeCompare(a.updatedAt)); },[opportunities,search,stage,campaign,owner,sort]);
  const summary=calculatePipelineSummary(opportunities);
  const stageSummary=opportunityStages.map((item)=>{const records=opportunities.filter((o)=>o.stage===item);return{stage:item,count:records.length,value:records.reduce((sum,o)=>sum+o.value,0)};});
  const maxStageValue=Math.max(...stageSummary.map((item)=>item.value),1);
  async function save(draft: OpportunityDraft) {
    setSaveError("");
    try {
      if (editing) {
        const updated = await updateOpportunity(editing.id, draft);
        const linkedLead = leads.find((lead) => String(lead.id) === updated.leadId);
        const nextStatus = linkedLead ? leadStatusAfterStageChange(updated.stage) : null;
        try {
          if (linkedLead && nextStatus) await updateLeadStatusInSupabase(String(linkedLead.id), nextStatus);
        } catch (syncError) {
          await updateOpportunity(editing.id, editing);
          throw syncError;
        }
        if (linkedLead && nextStatus) setLeads((current) => current.map((lead) => lead.id === linkedLead.id ? { ...lead, status: nextStatus } : lead));
        setOpportunities((current) => current.map((item) => item.id === updated.id ? updated : item));
      } else {
        const created = await createOpportunity(draft);
        const linkedLead = leads.find((lead) => String(lead.id) === created.leadId);
        const nextStatus = linkedLead ? leadStatusAfterOpportunityCreation(linkedLead.status) : null;
        try {
          if (linkedLead && nextStatus) await updateLeadStatusInSupabase(String(linkedLead.id), nextStatus);
        } catch (syncError) {
          await deleteOpportunity(created.id);
          throw syncError;
        }
        if (linkedLead && nextStatus) setLeads((current) => current.map((lead) => lead.id === linkedLead.id ? { ...lead, status: nextStatus } : lead));
        setOpportunities((current) => [created, ...current]);
      }
      setFormOpen(false); setEditing(null);
    } catch { setSaveError("Opportunity could not be saved consistently. Database changes were rolled back where possible; check Supabase permissions and try again."); }
  }
  async function remove(item:Opportunity){if(!window.confirm(`Delete “${item.name}”? This will not delete its Lead or Campaign.`))return;try{await deleteOpportunity(item.id);setOpportunities((current)=>current.filter((record)=>record.id!==item.id));}catch{setError("Opportunity could not be deleted. The record is still present.");}}
  const control="h-10 rounded-[10px] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-700 outline-none focus:border-[#9d88df]";
  if(loading)return <div className="rounded-[14px] border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">Loading Opportunities from Supabase...</div>;
  return <>{error&&<div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
    <section className="mb-8 grid gap-px overflow-hidden rounded-[16px] border border-zinc-200 bg-zinc-200 sm:grid-cols-2 xl:grid-cols-4">{[["Open Pipeline",currency.format(summary.openPipeline)],["Won Revenue",currency.format(summary.wonRevenue)],["Open Opportunities",String(summary.openOpportunities)],["Win Rate",`${summary.winRate}%`]].map(([label,value],index)=><div key={label} className={`${index===0?"bg-[#eeeafd]":"bg-[#fdfcf9]"} p-6`}><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p><p className="metric-value mt-5 text-[32px] text-zinc-950">{value}</p></div>)}</section>
    <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]"><div className="rounded-[14px] border border-zinc-200 bg-white p-6"><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Pipeline</p><h2 className="mt-3 text-xl font-semibold">Pipeline by Stage</h2><div className="mt-6 space-y-5">{stageSummary.map((item)=><div key={item.stage}><div className="flex items-center justify-between gap-4"><OpportunityStatusBadge stage={item.stage}/><p className="text-xs text-zinc-500">{item.count} · <span className="font-semibold text-zinc-800">{currency.format(item.value)}</span></p></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100"><div className="h-full bg-[#9378df]" style={{width:`${item.value/maxStageValue*100}%`}}/></div></div>)}</div></div><div className="rounded-[14px] border border-zinc-200 bg-[#fdfcf9] p-6"><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Workflow</p><h2 className="mt-3 text-xl font-semibold">From qualified Lead to revenue</h2><p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600">Create a commercial Opportunity when a Lead becomes qualified, then track it through Discovery, Proposal, Negotiation, Won, or Lost.</p></div></section>
    <section className="mb-5 flex flex-col gap-3 rounded-[14px] border border-zinc-200 bg-white p-3.5 xl:flex-row xl:items-center"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search name or company" className={`${control} min-w-0 flex-1`}/><select value={stage} onChange={(e)=>setStage(e.target.value)} className={control}><option>All</option>{opportunityStages.map((item)=><option key={item}>{item}</option>)}</select><select value={campaign} onChange={(e)=>setCampaign(e.target.value)} className={control}><option value="All">All campaigns</option>{campaigns.map((item)=><option key={item.id} value={String(item.id)}>{item.name}</option>)}</select>{owners.length>0&&<select value={owner} onChange={(e)=>setOwner(e.target.value)} className={control}><option value="All">All owners</option>{owners.map((item)=><option key={item}>{item}</option>)}</select>}<select value={sort} onChange={(e)=>setSort(e.target.value as SortKey)} className={control}><option value="updated">Sort: Updated</option><option value="value">Sort: Value</option><option value="close">Sort: Close Date</option></select><button onClick={()=>{setEditing(null);setFormOpen(true);}} className="h-10 shrink-0 rounded-[10px] bg-zinc-900 px-4 text-[13px] font-medium text-white">+ Create Opportunity</button></section>
    <div className="mb-3 px-1 text-sm text-zinc-500">Showing {filtered.length} / {opportunities.length} opportunities</div><OpportunityTable opportunities={filtered} leads={leads} campaigns={campaigns} onView={setViewing} onEdit={(item)=>{setEditing(item);setFormOpen(true);}} onDelete={remove}/>
    {formOpen&&<OpportunityFormModal opportunity={editing} leads={leads} campaigns={campaigns} error={saveError} onClose={()=>{setFormOpen(false);setEditing(null);setSaveError("");}} onSave={save}/>} {viewing&&<OpportunityDetailModal opportunity={viewing} leads={leads} campaigns={campaigns} onClose={()=>setViewing(null)} onEdit={()=>{setEditing(viewing);setViewing(null);setFormOpen(true);}}/>}
  </>;
}
