\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email) values('11111111-1111-4111-8111-111111111111','owner@example.test');
insert into profiles(id,email) values('11111111-1111-4111-8111-111111111111','owner@example.test');
insert into packages(id,slug,name,description,price_cents) values('22222222-2222-4222-8222-222222222222','essential-song','Personalized AI Song','Test',1999);
insert into projects(id,user_id) values('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111');
insert into recipients(project_id,name) values('33333333-3333-4333-8333-333333333333','Recipient');
insert into story_answers(project_id,favorite_memory,what_makes_special) values('33333333-3333-4333-8333-333333333333','Favorite test memory','A special test person');
insert into song_preferences(project_id,genre,mood) values('33333333-3333-4333-8333-333333333333','pop','happy');
do $$
declare oid uuid; again uuid; j generation_jobs; claimed generation_jobs; changed boolean;
begin
 oid:=create_paid_order('33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222','buyer@customer.test',null,'11111111-1111-4111-8111-111111111111');
 again:=create_paid_order('33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222','buyer@customer.test',null,'11111111-1111-4111-8111-111111111111');
 assert oid=again,'Repeated checkout created a second order';
 assert (select total_cents=1999 and tax_cents=0 from orders where id=oid),'Hardcoded tax';
 begin
  insert into generation_jobs(order_id,job_type,idempotency_key) values(oid,'creative_brief',oid||':creative_brief');
  raise exception 'Unpaid order enqueued';
 exception when others then if sqlerrm='Unpaid order enqueued' then raise; end if; end;
 perform bind_checkout(oid,1,'cs_test','price_test');
 begin
  perform apply_stripe_event('evt_bad','checkout.session.completed',oid,'paid','cs_test','pi_test','price_other',1999,0,0,'Customer');
  raise exception 'Price mismatch was accepted';
 exception when others then
  if sqlerrm='Price mismatch was accepted' then raise; end if;
 end;
 assert not exists(select 1 from stripe_events where id='evt_bad'),'Rejected event was committed';
 changed:=apply_stripe_event('evt_paid','checkout.session.completed',oid,'paid','cs_test','pi_test','price_test',2159,160,0,'Customer');
 assert changed,'Valid event not applied';
 assert (select payment_status='paid' and total_cents=2159 from orders where id=oid),'Order not paid';
 assert (select count(*)=1 from payments where order_id=oid),'Payment not persisted';
 assert (select count(*)=8 from generation_jobs where order_id=oid),'Pipeline incomplete';
 assert (select count(*)=1 from analytics_events where order_id=oid and event_name='purchase_completed'),'Webhook purchase analytics missing';
 assert (select count(*)=1 from email_outbox where order_id=oid),'Confirmation missing';
 assert not has_column_privilege('authenticated','public.profiles','role','UPDATE'),'Customer can escalate role';
 begin
  update story_answers set favorite_memory='Changed after checkout' where project_id='33333333-3333-4333-8333-333333333333';
  raise exception 'Checkout story was mutable';
 exception when others then if sqlerrm='Checkout story was mutable' then raise; end if; end;
 perform claim_email('order-confirmation-'||oid,'{"subject":"Stable email payload"}');
 assert (select claim_email('order-confirmation-'||oid,'{}') is null),'Email lease duplicated send';
 update email_outbox set status='sent',leased_until=null where order_id=oid;
 assert (select claim_email('order-confirmation-'||oid,'{}') is null),'Sent email retried';
 update email_outbox set status='failed',leased_until=null,first_attempt_at=now()-interval '25 hours' where order_id=oid;
 perform claim_email('order-confirmation-'||oid,'{}');
 assert (select status='review' from email_outbox where order_id=oid),'Expired email idempotency window was replayed';
 changed:=apply_stripe_event('evt_paid','checkout.session.completed',oid,'paid','cs_test','pi_test','price_test',2159,160,0,'Customer'); assert not changed,'Duplicate event processed';
 perform apply_stripe_event('evt_other','checkout.session.async_payment_succeeded',oid,'paid','cs_test','pi_test','price_test',2159,160,0,'Customer');
 assert (select count(*)=8 from generation_jobs where order_id=oid),'Duplicate generation';
 assert (select count(*)=1 from email_outbox where order_id=oid),'Duplicate confirmation';
 assert (select count(*)=1 from analytics_events where order_id=oid and event_name='purchase_completed'),'Duplicate purchase analytics';
 select * into j from generation_jobs where order_id=oid and job_type='creative_brief';
 claimed:=claim_generation_job(j.id,now()); assert claimed.id=j.id,'Paid job not claimed';
 claimed:=claim_generation_job(j.id,now()-interval '15 minutes'); assert claimed.id is null,'Concurrent worker claim';
 select * into claimed from generation_jobs where order_id=oid and job_type='music';
 claimed:=claim_generation_job(claimed.id,now()); assert claimed.id is null,'Prerequisites bypassed';
 update generation_jobs set status='failed',next_retry_at=now()-interval '1 minute' where id=j.id;
 claimed:=claim_generation_job(j.id,now()); assert claimed.attempt=2,'Paid retry failed';
 assert (select count(*)=1 from payments where order_id=oid),'Retry charged again';
 perform apply_stripe_event('evt_refund','charge.refunded',oid,'refunded','cs_test','pi_test','price_test',2159,160,2159,null);
 assert (select payment_status='refunded' from orders where id=oid),'Refund not applied';
 claimed:=claim_generation_job(j.id,now()); assert claimed.id is null,'Refunded order claimed';
 perform apply_stripe_event('evt_late','checkout.session.completed',oid,'paid','cs_test','pi_test','price_test',2159,160,0,null);
 assert (select payment_status='refunded' from orders where id=oid),'Late paid event reversed refund';
 assert (select count(*)=8 from generation_jobs where order_id=oid),'Late event duplicated generation';
 raise notice 'PASS: atomic order, price validation, rollback, paid gate, event replay, queue uniqueness, claims, prerequisites, retry, refund, out-of-order delivery, email outbox';
end $$;
rollback;
