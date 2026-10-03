create or replace function private.business_order_payment_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status in ('paid','in_progress','completed','delivered') and new.status is distinct from old.status
    and not exists(select 1 from public.business_invoices i where i.order_id=new.id and i.status='paid' and i.amount_paid=i.amount and i.amount>0)
 then raise exception 'Verified invoice payment is required before fulfilment'; end if;
 return new;
end $$;
drop policy if exists "business_quote_customer_response" on public.business_quotes;
create or replace function public.respond_business_quote(p_quote uuid,p_response text) returns void
language plpgsql security definer set search_path='' as $$
declare q public.business_quotes%rowtype;o public.business_orders%rowtype;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_response not in ('accepted','revision_requested','rejected') then raise exception 'Invalid quote response'; end if;
 select * into q from public.business_quotes where id=p_quote for update;
 if q.id is null or q.status<>'issued' then raise exception 'Issued quote unavailable'; end if;
 select * into o from public.business_orders where id=q.order_id for update;
 if o.user_id is distinct from auth.uid() then raise exception 'Quote does not belong to this customer'; end if;
 if q.valid_until is not null and q.valid_until<current_date then raise exception 'Quote has expired'; end if;
 update public.business_quotes set status=p_response,updated_at=now() where id=q.id;
 update public.business_orders set status=case p_response when 'accepted' then 'quoted' when 'revision_requested' then 'reviewing' else 'cancelled' end,updated_at=now() where id=o.id;
end $$;
revoke all on function public.respond_business_quote(uuid,text) from public,anon;
grant execute on function public.respond_business_quote(uuid,text) to authenticated,service_role;