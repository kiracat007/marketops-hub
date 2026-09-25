-- MarketOps Hub V2 relational demo seed. Fixed UUIDs make this script rerunnable.
begin;

-- Stop instead of overwriting an unrelated UUID or creating a same-name business duplicate.
do $$
declare
  seed_record record;
  record_at_seed_uuid text;
  conflicting_id uuid;
begin
  for seed_record in
    select * from (values
      ('campaigns','10000000-0000-4000-8000-000000000001'::uuid,'Thailand Q4 Market Expansion'),
      ('partners','20000000-0000-4000-8000-000000000001'::uuid,'Thailand PR Agency'),
      ('partners','20000000-0000-4000-8000-000000000002'::uuid,'Bangkok Distributor'),
      ('partners','20000000-0000-4000-8000-000000000003'::uuid,'Tech Media Partner'),
      ('activities','30000000-0000-4000-8000-000000000001'::uuid,'Techsauce Expo'),
      ('activities','30000000-0000-4000-8000-000000000002'::uuid,'Thailand Partner Webinar'),
      ('activities','30000000-0000-4000-8000-000000000003'::uuid,'Bangkok Dealer Demo'),
      ('leads','40000000-0000-4000-8000-000000000001'::uuid,'Anan Chai'),
      ('leads','40000000-0000-4000-8000-000000000002'::uuid,'Pim Suda'),
      ('leads','40000000-0000-4000-8000-000000000003'::uuid,'Nok Kanya'),
      ('leads','40000000-0000-4000-8000-000000000004'::uuid,'Beam Viroj'),
      ('leads','40000000-0000-4000-8000-000000000005'::uuid,'Krit Som'),
      ('leads','40000000-0000-4000-8000-000000000006'::uuid,'Dao Mali'),
      ('leads','40000000-0000-4000-8000-000000000007'::uuid,'Mew Araya'),
      ('leads','40000000-0000-4000-8000-000000000008'::uuid,'Ton Niran'),
      ('opportunities','50000000-0000-4000-8000-000000000001'::uuid,'Siam Robotics Expansion'),
      ('opportunities','50000000-0000-4000-8000-000000000002'::uuid,'Eastern Manufacturing Rollout'),
      ('opportunities','50000000-0000-4000-8000-000000000003'::uuid,'Bangkok Components Pilot'),
      ('opportunities','50000000-0000-4000-8000-000000000004'::uuid,'CPS Platform Upgrade')
    ) as expected(table_name, seed_id, expected_name)
  loop
    record_at_seed_uuid := null;
    execute format('select name from public.%I where id = $1', seed_record.table_name)
      into record_at_seed_uuid using seed_record.seed_id;
    if record_at_seed_uuid is not null and record_at_seed_uuid <> seed_record.expected_name then
      raise exception 'Seed stopped: %.id % belongs to "%", expected "%".',
        seed_record.table_name, seed_record.seed_id, record_at_seed_uuid, seed_record.expected_name;
    end if;

    conflicting_id := null;
    execute format('select id from public.%I where name = $1 and id <> $2 limit 1', seed_record.table_name)
      into conflicting_id using seed_record.expected_name, seed_record.seed_id;
    if conflicting_id is not null then
      raise exception 'Seed stopped: %.name "%" already exists with a different UUID (%). Resolve manually.',
        seed_record.table_name, seed_record.expected_name, conflicting_id;
    end if;
  end loop;
end $$;

insert into public.campaigns (id,name,description,goal,status,owner,channel,start_date,end_date,budget,spend,target_leads) values
('10000000-0000-4000-8000-000000000001','Thailand Q4 Market Expansion','Integrated Thailand market-entry program.','Generate qualified pipeline through events, partners, and field activation.','Active','Maya Chen','Event','2026-10-01','2026-12-20',180000,82000,120)
on conflict (id) do update set name=excluded.name,description=excluded.description,goal=excluded.goal,status=excluded.status,owner=excluded.owner,channel=excluded.channel,start_date=excluded.start_date,end_date=excluded.end_date,budget=excluded.budget,spend=excluded.spend,target_leads=excluded.target_leads;

insert into public.partners (id,name,company,type,status,region,email,phone,notes) values
('20000000-0000-4000-8000-000000000001','Thailand PR Agency','Siam Growth Communications','Agency','Active','Thailand','hello@siamgrowth.example','+66 2 555 0101','PR and event support'),
('20000000-0000-4000-8000-000000000002','Bangkok Distributor','Bangkok Industrial Distribution','Distributor','Active','Thailand','sales@bid.example','+66 2 555 0102','Dealer and field-demo partner'),
('20000000-0000-4000-8000-000000000003','Tech Media Partner','ASEAN Tech Review','Media','Active','Southeast Asia','editor@aseantech.example','+65 6555 0103','Media and webinar partner')
on conflict (id) do update set name=excluded.name,company=excluded.company,type=excluded.type,status=excluded.status,region=excluded.region,email=excluded.email,phone=excluded.phone,notes=excluded.notes;

insert into public.activities (id,campaign_id,partner_id,name,type,status,owner,start_date,end_date,budget,spend,target_leads,attendees,location,notes) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Techsauce Expo','Exhibition','Completed','Maya Chen','2026-10-06','2026-10-08',65000,63200,55,480,'Bangkok','Primary launch exhibition'),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','Thailand Partner Webinar','Webinar','Completed','Nina Lee','2026-10-22','2026-10-22',12000,10800,35,210,'Online','Partner enablement webinar'),
('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','Bangkok Dealer Demo','Field Demo','Upcoming','Arun Patel','2026-11-18','2026-11-18',28000,8000,30,75,'Bangkok','Dealer product demonstration')
on conflict (id) do update set campaign_id=excluded.campaign_id,partner_id=excluded.partner_id,name=excluded.name,type=excluded.type,status=excluded.status,owner=excluded.owner,start_date=excluded.start_date,end_date=excluded.end_date,budget=excluded.budget,spend=excluded.spend,target_leads=excluded.target_leads,attendees=excluded.attendees,location=excluded.location,notes=excluded.notes;

insert into public.leads (id,name,company,email,phone,source,campaign,activity,partner,campaign_id,activity_id,partner_id,status,potential_value,owner,created_at) values
('40000000-0000-4000-8000-000000000001','Anan Chai','Siam Robotics','anan@siamrobotics.example','+66 81 555 1001','Event','Thailand Q4 Market Expansion','Techsauce Expo','Thailand PR Agency','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Opportunity',85000,'Maya Chen','2026-10-07'),
('40000000-0000-4000-8000-000000000002','Pim Suda','Thai Logistics Cloud','pim@tlc.example','+66 81 555 1002','Event','Thailand Q4 Market Expansion','Techsauce Expo','Thailand PR Agency','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Qualified',42000,'Maya Chen','2026-10-08'),
('40000000-0000-4000-8000-000000000003','Nok Kanya','Eastern Manufacturing','nok@eastern.example','+66 81 555 1003','Webinar','Thailand Q4 Market Expansion','Thailand Partner Webinar','Tech Media Partner','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','Won',120000,'Nina Lee','2026-10-23'),
('40000000-0000-4000-8000-000000000004','Beam Viroj','Metro Foods','beam@metrofoods.example','+66 81 555 1004','Webinar','Thailand Q4 Market Expansion','Thailand Partner Webinar','Tech Media Partner','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','Contacted',24000,'Nina Lee','2026-10-23'),
('40000000-0000-4000-8000-000000000005','Krit Som','Bangkok Components','krit@components.example','+66 81 555 1005','Field Demo','Thailand Q4 Market Expansion','Bangkok Dealer Demo','Bangkok Distributor','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','Qualified',68000,'Arun Patel','2026-11-18'),
('40000000-0000-4000-8000-000000000006','Dao Mali','Future Retail Thailand','dao@future-retail.example','+66 81 555 1006','Field Demo','Thailand Q4 Market Expansion','Bangkok Dealer Demo','Bangkok Distributor','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','New',31000,'Arun Patel','2026-11-18'),
('40000000-0000-4000-8000-000000000007','Mew Araya','Green Energy Asia','mew@greenenergy.example','+66 81 555 1007','Event','Thailand Q4 Market Expansion','Techsauce Expo','Thailand PR Agency','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Lost',54000,'Maya Chen','2026-10-08'),
('40000000-0000-4000-8000-000000000008','Ton Niran','Chao Phraya Systems','ton@cps.example','+66 81 555 1008','Webinar','Thailand Q4 Market Expansion','Thailand Partner Webinar','Tech Media Partner','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','Opportunity',96000,'Nina Lee','2026-10-24')
on conflict (id) do update set name=excluded.name,company=excluded.company,email=excluded.email,phone=excluded.phone,source=excluded.source,campaign=excluded.campaign,activity=excluded.activity,partner=excluded.partner,campaign_id=excluded.campaign_id,activity_id=excluded.activity_id,partner_id=excluded.partner_id,status=excluded.status,potential_value=excluded.potential_value,owner=excluded.owner,created_at=excluded.created_at;

insert into public.opportunities (id,lead_id,campaign_id,name,company,stage,value,owner,expected_close_date,notes) values
('50000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Siam Robotics Expansion','Siam Robotics','Proposal',85000,'Maya Chen','2026-12-05','Originated at Techsauce Expo'),
('50000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Eastern Manufacturing Rollout','Eastern Manufacturing','Won',120000,'Nina Lee','2026-11-15','Converted from webinar'),
('50000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','Bangkok Components Pilot','Bangkok Components','Discovery',68000,'Arun Patel','2026-12-12','Field demo follow-up'),
('50000000-0000-4000-8000-000000000004','40000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000001','CPS Platform Upgrade','Chao Phraya Systems','Negotiation',96000,'Nina Lee','2026-12-18','Partner webinar opportunity')
on conflict (id) do update set lead_id=excluded.lead_id,campaign_id=excluded.campaign_id,name=excluded.name,company=excluded.company,stage=excluded.stage,value=excluded.value,owner=excluded.owner,expected_close_date=excluded.expected_close_date,notes=excluded.notes;

commit;
