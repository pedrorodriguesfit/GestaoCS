-- =====================================================================
-- Gestão CS  ·  Estrutura do banco de dados (Supabase / PostgreSQL)
-- Rode este arquivo UMA vez, inteiro, no SQL Editor do Supabase.
-- Ele não contém dados de pessoas. Os dados iniciais ficam no arquivo
-- dados_iniciais.sql, que NÃO deve ser enviado ao GitHub.
-- =====================================================================

-- ---------- Tabelas ----------
create table if not exists public.perfis (
  id             bigint generated always as identity primary key,
  user_id        uuid unique references auth.users(id) on delete set null,
  email          text not null unique check (email = lower(email)),
  nome           text not null,
  papel          text not null check (papel in ('admin','supervisor')),
  funcionario_id bigint,                      -- linha do próprio gestor na tabela de funcionários
  criado_em      timestamptz not null default now()
);

create table if not exists public.funcionarios (
  id          bigint generated always as identity primary key,
  matricula   text,
  nome        text not null,
  cargo       text,
  subsetor    text,
  nivel       text,
  gestor_id   bigint references public.perfis(id) on delete set null,
  gestor_nome text                            -- gestor imediato em texto (para quem não usa o site)
);

alter table public.perfis
  drop constraint if exists perfis_funcionario_fk,
  add constraint perfis_funcionario_fk foreign key (funcionario_id)
      references public.funcionarios(id) on delete set null;

-- Convites de primeiro acesso: ninguém lê esta tabela pelo site
create table if not exists public.convites (
  perfil_id bigint primary key references public.perfis(id) on delete cascade,
  hash      text not null,
  expira    timestamptz not null
);

create table if not exists public.naturezas (
  id    bigint generated always as identity primary key,
  nome  text not null unique,
  ordem int  not null default 100
);

create table if not exists public.avisos (
  id               bigint generated always as identity primary key,
  funcionario_id   bigint references public.funcionarios(id) on delete set null,
  funcionario_nome text not null,
  setor            text,
  gestor_id        bigint references public.perfis(id) on delete set null,
  natureza         text not null,
  data_inicio      date not null,
  data_fim         date not null,
  observacao       text check (observacao is null or char_length(observacao) <= 1000),
  status           text not null default 'pendente' check (status in ('pendente','aprovado','recusado')),
  motivo_recusa    text,
  criado_por       bigint references public.perfis(id) on delete set null,
  criado_por_nome  text,
  criado_em        timestamptz not null default now(),
  decidido_por     bigint references public.perfis(id) on delete set null,
  decidido_em      timestamptz,
  check (data_fim >= data_inicio)
);

create table if not exists public.analises (
  id               bigint generated always as identity primary key,
  gestor_id        bigint references public.perfis(id) on delete set null,
  gestor_nome      text,
  id_atendimento   text not null,
  resumo           text not null,
  avaliacao        text not null,
  pontos_melhoria  text not null,
  canal            text not null check (canal in ('Hubspot','BlipDesk','3CX')),
  data_atendimento date not null,
  criado_em        timestamptz not null default now()
);

create index if not exists avisos_status_idx    on public.avisos (status, data_inicio, data_fim);
create index if not exists avisos_gestor_idx    on public.avisos (gestor_id);
create index if not exists analises_gestor_idx  on public.analises (gestor_id, data_atendimento);

-- ---------- Funções auxiliares (usadas nas regras de acesso) ----------
create or replace function public.meu_perfil_id() returns bigint
language sql stable security definer set search_path = public as
$$ select id from public.perfis where user_id = auth.uid() $$;

create or replace function public.sou_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.perfis where user_id = auth.uid() and papel = 'admin') $$;

create or replace function public.meu_funcionario_id() returns bigint
language sql stable security definer set search_path = public as
$$ select funcionario_id from public.perfis where user_id = auth.uid() $$;

-- Quem pode criar aviso para o funcionário f: admin (qualquer um) ou
-- supervisor (membros do próprio time e ele mesmo)
create or replace function public.pode_criar_para(f bigint) returns boolean
language sql stable security definer set search_path = public as
$$
  select public.sou_admin() or exists (
    select 1
      from public.perfis p
      join public.funcionarios fu on fu.id = f
     where p.user_id = auth.uid()
       and (fu.gestor_id = p.id or fu.id = p.funcionario_id)
  )
$$;

-- ---------- Gatilhos: quem manda não decide o status, o autor nem os dados copiados ----------
create or replace function public.avisos_antes_de_inserir() returns trigger
language plpgsql security definer set search_path = public as
$$
declare
  v_perfil public.perfis;
  v_func   public.funcionarios;
begin
  select * into v_perfil from public.perfis where user_id = auth.uid();
  if not found then raise exception 'Sem acesso'; end if;
  select * into v_func from public.funcionarios where id = new.funcionario_id;
  if not found then raise exception 'Funcionário não encontrado'; end if;

  new.funcionario_nome := v_func.nome;
  new.setor            := v_func.subsetor;
  new.criado_por       := v_perfil.id;
  new.criado_por_nome  := v_perfil.nome;
  new.criado_em        := now();
  new.motivo_recusa    := null;
  if v_perfil.papel = 'admin' then
    new.status       := 'aprovado';
    new.gestor_id    := v_func.gestor_id;
    new.decidido_por := v_perfil.id;
    new.decidido_em  := now();
  else
    new.status       := 'pendente';
    new.gestor_id    := v_perfil.id;
    new.decidido_por := null;
    new.decidido_em  := null;
  end if;
  return new;
end $$;

create or replace function public.avisos_antes_de_atualizar() returns trigger
language plpgsql security definer set search_path = public as
$$
begin
  if not public.sou_admin() then raise exception 'Somente o administrador pode alterar avisos'; end if;
  if new.status is distinct from old.status then
    new.decidido_por := public.meu_perfil_id();
    new.decidido_em  := now();
    if new.status <> 'recusado' then new.motivo_recusa := null; end if;
  end if;
  return new;
end $$;

create or replace function public.analises_antes_de_inserir() returns trigger
language plpgsql security definer set search_path = public as
$$
declare v_perfil public.perfis;
begin
  select * into v_perfil from public.perfis where user_id = auth.uid();
  if not found then raise exception 'Sem acesso'; end if;
  new.gestor_id   := v_perfil.id;
  new.gestor_nome := v_perfil.nome;
  new.criado_em   := now();
  return new;
end $$;

drop trigger if exists trg_avisos_ins on public.avisos;
create trigger trg_avisos_ins before insert on public.avisos
  for each row execute function public.avisos_antes_de_inserir();
drop trigger if exists trg_avisos_upd on public.avisos;
create trigger trg_avisos_upd before update on public.avisos
  for each row execute function public.avisos_antes_de_atualizar();
drop trigger if exists trg_analises_ins on public.analises;
create trigger trg_analises_ins before insert on public.analises
  for each row execute function public.analises_antes_de_inserir();

-- ---------- Regras de acesso (Row Level Security) ----------
alter table public.perfis       enable row level security;
alter table public.funcionarios enable row level security;
alter table public.convites     enable row level security;
alter table public.naturezas    enable row level security;
alter table public.avisos       enable row level security;
alter table public.analises     enable row level security;

revoke all on public.perfis, public.funcionarios, public.convites,
              public.naturezas, public.avisos, public.analises from anon, authenticated;

grant select                         on public.perfis       to authenticated;
grant select, insert, update, delete on public.funcionarios to authenticated;
grant select, insert, update, delete on public.naturezas    to authenticated;
grant select, insert, update, delete on public.avisos       to authenticated;
grant select, insert, delete         on public.analises     to authenticated;

-- perfis: todo gestor com acesso vê a lista; alterações só pelas funções abaixo
drop policy if exists perfis_ler on public.perfis;
create policy perfis_ler on public.perfis for select to authenticated
  using (public.meu_perfil_id() is not null);

-- funcionarios e naturezas: todos leem, só o admin altera
drop policy if exists func_ler on public.funcionarios;
create policy func_ler on public.funcionarios for select to authenticated
  using (public.meu_perfil_id() is not null);
drop policy if exists func_admin on public.funcionarios;
create policy func_admin on public.funcionarios for all to authenticated
  using (public.sou_admin()) with check (public.sou_admin());

drop policy if exists nat_ler on public.naturezas;
create policy nat_ler on public.naturezas for select to authenticated
  using (public.meu_perfil_id() is not null);
drop policy if exists nat_admin on public.naturezas;
create policy nat_admin on public.naturezas for all to authenticated
  using (public.sou_admin()) with check (public.sou_admin());

-- avisos
drop policy if exists avisos_ler on public.avisos;
create policy avisos_ler on public.avisos for select to authenticated
  using (
    public.sou_admin()
    or (public.meu_perfil_id() is not null
        and (status = 'aprovado' or criado_por = public.meu_perfil_id()))
  );
drop policy if exists avisos_criar on public.avisos;
create policy avisos_criar on public.avisos for insert to authenticated
  with check (public.meu_perfil_id() is not null and public.pode_criar_para(funcionario_id));
drop policy if exists avisos_alterar on public.avisos;
create policy avisos_alterar on public.avisos for update to authenticated
  using (public.sou_admin()) with check (public.sou_admin());
drop policy if exists avisos_excluir on public.avisos;
create policy avisos_excluir on public.avisos for delete to authenticated
  using (
    public.sou_admin()
    or (public.meu_perfil_id() is not null
        and gestor_id = public.meu_perfil_id()
        and funcionario_id is distinct from public.meu_funcionario_id())
  );

-- analises: cada gestor vê só as suas; admin vê todas; só o admin exclui; ninguém edita
drop policy if exists analises_ler on public.analises;
create policy analises_ler on public.analises for select to authenticated
  using (public.sou_admin() or (gestor_id is not null and gestor_id = public.meu_perfil_id()));
drop policy if exists analises_criar on public.analises;
create policy analises_criar on public.analises for insert to authenticated
  with check (public.meu_perfil_id() is not null);
drop policy if exists analises_excluir on public.analises;
create policy analises_excluir on public.analises for delete to authenticated
  using (public.sou_admin());

-- ---------- Gestores: criação, novo código e exclusão (somente admin) ----------
create or replace function public._novo_codigo() returns text
language sql volatile as
$$ select upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)) $$;

create or replace function public._hash_codigo(c text) returns text
language sql immutable as
$$ select encode(sha256(convert_to(upper(regexp_replace(coalesce(c,''),'[^A-Za-z0-9]','','g')),'UTF8')),'hex') $$;

create or replace function public.criar_gestor(
  p_nome text, p_email text, p_papel text, p_funcionario_id bigint default null
) returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  v_email text := lower(trim(p_email));
  v_id    bigint;
  v_uid   uuid;
  v_cod   text;
begin
  if not public.sou_admin() then raise exception 'Somente o administrador pode criar gestores'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'E-mail inválido'; end if;
  if coalesce(trim(p_nome),'') = '' then raise exception 'Informe o nome'; end if;
  if p_papel not in ('admin','supervisor') then raise exception 'Perfil inválido'; end if;
  if exists (select 1 from public.perfis where email = v_email) then
    raise exception 'Já existe um perfil com este e-mail';
  end if;

  select id into v_uid from auth.users where lower(email) = v_email;
  insert into public.perfis (user_id, email, nome, papel, funcionario_id)
  values (v_uid, v_email, trim(p_nome), p_papel, p_funcionario_id)
  returning id into v_id;

  if v_uid is not null then
    return jsonb_build_object('perfil_id', v_id, 'reativado', true, 'codigo', null);
  end if;
  v_cod := public._novo_codigo();
  insert into public.convites (perfil_id, hash, expira)
  values (v_id, public._hash_codigo(v_cod), now() + interval '7 days');
  return jsonb_build_object('perfil_id', v_id, 'reativado', false, 'codigo', v_cod);
end $$;

create or replace function public.novo_codigo_gestor(p_perfil_id bigint) returns text
language plpgsql security definer set search_path = public as
$$
declare v_cod text;
begin
  if not public.sou_admin() then raise exception 'Somente o administrador pode gerar códigos'; end if;
  if not exists (select 1 from public.perfis where id = p_perfil_id and user_id is null) then
    raise exception 'Este gestor já fez o primeiro acesso';
  end if;
  v_cod := public._novo_codigo();
  insert into public.convites (perfil_id, hash, expira)
  values (p_perfil_id, public._hash_codigo(v_cod), now() + interval '7 days')
  on conflict (perfil_id) do update set hash = excluded.hash, expira = excluded.expira;
  return v_cod;
end $$;

create or replace function public.excluir_gestor(p_perfil_id bigint) returns void
language plpgsql security definer set search_path = public as
$$
declare v_alvo public.perfis;
begin
  if not public.sou_admin() then raise exception 'Somente o administrador pode excluir gestores'; end if;
  select * into v_alvo from public.perfis where id = p_perfil_id;
  if not found then raise exception 'Gestor não encontrado'; end if;
  if v_alvo.id = public.meu_perfil_id() then raise exception 'Você não pode excluir o seu próprio perfil'; end if;
  if v_alvo.papel = 'admin' and (select count(*) from public.perfis where papel = 'admin') <= 1 then
    raise exception 'Não é possível excluir o único administrador';
  end if;
  delete from public.perfis where id = p_perfil_id;
end $$;

-- ---------- Primeiro acesso: só entra quem tem convite válido ----------
create or replace function public.validar_convite() returns trigger
language plpgsql security definer set search_path = public as
$$
declare
  v_perfil bigint;
  v_cod    text := coalesce(new.raw_user_meta_data->>'codigo','');
begin
  select p.id into v_perfil
    from public.perfis p
    join public.convites c on c.perfil_id = p.id
   where lower(p.email) = lower(new.email)
     and p.user_id is null
     and c.expira > now()
     and c.hash = public._hash_codigo(v_cod);
  if v_perfil is null then
    raise exception 'convite_invalido';
  end if;
  update public.perfis set user_id = new.id where id = v_perfil;
  delete from public.convites where perfil_id = v_perfil;
  return new;
end $$;

drop trigger if exists trg_validar_convite on auth.users;
create trigger trg_validar_convite after insert on auth.users
  for each row execute function public.validar_convite();

-- ---------- Permissões das funções ----------
revoke all on function public.meu_perfil_id(), public.sou_admin(), public.meu_funcionario_id(),
  public.pode_criar_para(bigint), public._novo_codigo(), public._hash_codigo(text),
  public.criar_gestor(text,text,text,bigint), public.novo_codigo_gestor(bigint),
  public.excluir_gestor(bigint) from public, anon, authenticated;

grant execute on function public.meu_perfil_id(), public.sou_admin(), public.meu_funcionario_id(),
  public.pode_criar_para(bigint) to authenticated;
grant execute on function public.criar_gestor(text,text,text,bigint),
  public.novo_codigo_gestor(bigint), public.excluir_gestor(bigint) to authenticated;

-- ---------- Opções iniciais da lista "Natureza" ----------
insert into public.naturezas (nome, ordem) values
  ('Férias',1), ('Atestado',2), ('Ausência Temporária',3), ('Folga',4), ('Day Off',5)
on conflict (nome) do nothing;
