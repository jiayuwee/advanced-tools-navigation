-- 防止重复收藏同一工具
create unique index if not exists favorites_user_tool_unique
on public.favorites (user_id, tool_id)
where tool_id is not null;

-- 防止重复收藏同一产品
create unique index if not exists favorites_user_product_unique
on public.favorites (user_id, product_id)
where product_id is not null;
