-- الدوال الداخلية لا يستدعيها العميل (تُستدعى فقط من الدوال العامة بصلاحية المالك)
revoke execute on function public._log(nominations, text, nom_status, text) from authenticated;
revoke execute on function public._committed(uuid, int, uuid) from authenticated;
revoke execute on function public._allocation(uuid, int) from authenticated;
revoke execute on function public.compute_allocations(int) from authenticated;
