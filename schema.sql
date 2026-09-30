-- Ejecuta este archivo en Supabase > SQL Editor
create table products(id bigint generated always as identity primary key,name text not null,cat text,sub text,descr text,price numeric not null,old numeric default 0,img text,emo text,stock int default 0,status text default 'activo',feat boolean default false,offer boolean default false);
create table settings(id int primary key,data jsonb);
create table orders(id bigint generated always as identity primary key,created_at timestamptz default now(),items jsonb,total numeric,customer_name text,customer_phone text,status text default 'nuevo');
alter table products enable row level security;alter table settings enable row level security;alter table orders enable row level security;
-- Clientes: solo leen catálogo y configuración. Dueño (usuario autenticado): todo.
create policy pr on products for select using(true);create policy pw on products for all to authenticated using(true) with check(true);
create policy sr on settings for select using(true);create policy sw on settings for all to authenticated using(true) with check(true);
create policy ow on orders for all to authenticated using(true) with check(true);
-- Los clientes crean pedidos SOLO mediante esta función (valida stock y descuenta inventario)
create function place_order(p_items jsonb,p_name text,p_phone text) returns bigint language plpgsql security definer as $$
declare i jsonb;pr products;t numeric:=0;oid bigint;
begin for i in select * from jsonb_array_elements(p_items) loop
 select * into pr from products where id=(i->>'id')::bigint for update;
 if pr.stock<(i->>'q')::int or pr.status='agotado' then raise exception 'sin stock: %',pr.name;end if;
 update products set stock=stock-(i->>'q')::int where id=pr.id;t:=t+pr.price*(i->>'q')::int;end loop;
 insert into orders(items,total,customer_name,customer_phone) values(p_items,t,p_name,p_phone) returning id into oid;return oid;end $$;
grant execute on function place_order to anon,authenticated;
insert into settings values(1,'{}');
