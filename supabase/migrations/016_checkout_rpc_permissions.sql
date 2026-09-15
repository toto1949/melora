-- These privileged payment RPCs are called by the server with the service role.
-- Earlier migrations revoked PUBLIC but left explicit anon/authenticated grants in place.
revoke execute on function public.create_paid_order(uuid,uuid,text,text,uuid),
  public.bind_checkout(uuid,integer,text,text),
  public.rotate_checkout(uuid,text),
  public.apply_stripe_event(text,text,uuid,text,text,text,text,integer,integer,integer,text)
  from anon, authenticated;

grant execute on function public.create_paid_order(uuid,uuid,text,text,uuid),
  public.bind_checkout(uuid,integer,text,text),
  public.rotate_checkout(uuid,text),
  public.apply_stripe_event(text,text,uuid,text,text,text,text,integer,integer,integer,text)
  to service_role;
