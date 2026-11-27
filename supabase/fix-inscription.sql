-- =============================================================================
-- CORRECTION DU TRIGGER D'INSCRIPTION
-- À exécuter dans Supabase → SQL Editor → New query → Run.
--
-- Pourquoi : le trigger existant empêchait la création du compte
-- ("Database error saving new user"). Cette version :
--   - s'exécute après l'insertion dans auth.users (la clé étrangère est donc valide) ;
--   - est SECURITY DEFINER (les RLS ne bloquent pas l'insert dans profiles) ;
--   - lit le téléphone et le consentement envoyés par le formulaire ;
--   - remplit automatiquement les colonnes NOT NULL sans valeur par défaut.
--
-- Attention : cela remplace TOUS les déclencheurs personnalisés présents sur
-- auth.users. Vérifiez d'abord avec la requête ci-dessous s'il y en a d'autres.
-- =============================================================================

-- Lecture seule : déclencheurs existants
-- select tgname, pg_get_triggerdef(oid)
-- from pg_trigger
-- where tgrelid = 'auth.users'::regclass and not tgisinternal;

do $$
declare
  t record;
begin
  for t in
    select tgname
    from pg_trigger
    where tgrelid = 'auth.users'::regclass and not tgisinternal
  loop
    execute format('drop trigger %I on auth.users', t.tgname);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  valeurs jsonb;
  col record;
begin
  valeurs := jsonb_build_object(
    'id', new.id,
    'email', new.email,
    'prenom', coalesce(new.raw_user_meta_data ->> 'prenom', ''),
    'nom', coalesce(new.raw_user_meta_data ->> 'nom', ''),
    'media', coalesce(new.raw_user_meta_data ->> 'media', ''),
    'numero_carte', coalesce(new.raw_user_meta_data ->> 'numero_carte', ''),
    'telephone', nullif(new.raw_user_meta_data ->> 'telephone', ''),
    'carte_path', new.raw_user_meta_data ->> 'carte_path',
    'photo_path', new.raw_user_meta_data ->> 'photo_path',
    'statut', 'en_attente',
    'role', 'journaliste',
    'nouvelle_soumission', false,
    'demande_le', now(),
    'ville', '',
    'pays', ''
  );

  -- Renseigne une valeur neutre pour toute colonne obligatoire non prévue ci-dessus.
  for col in
    select c.column_name, c.data_type
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = 'profiles'
      and c.is_nullable = 'NO'
      and c.column_default is null
      and c.is_generated = 'NEVER'
      and not (valeurs ? c.column_name::text)
  loop
    valeurs := valeurs || jsonb_build_object(
      col.column_name::text,
      case
        when col.data_type = 'uuid' then new.id::text
        when col.data_type in ('timestamp without time zone', 'timestamp with time zone', 'date') then now()::text
        when col.data_type = 'boolean' then 'false'
        when col.data_type in ('smallint', 'integer', 'bigint', 'numeric', 'real', 'double precision') then '0'
        else ''
      end
    );
  end loop;

  insert into public.profiles
  select jsonb_populate_record(null::public.profiles, valeurs)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
