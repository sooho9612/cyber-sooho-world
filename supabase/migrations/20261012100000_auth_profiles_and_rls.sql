-- Auth profiles + RLS hardening (NO deletes of guestbook/home_comments data)
-- Applied remotely as auth_profiles_and_rls_v2 (profiles created before is_owner)

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  nickname text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  avatar_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_format CHECK (username ~ '^[a-z0-9_]{3,32}$'),
  CONSTRAINT profiles_nickname_len CHECK (char_length(trim(nickname)) BETWEEN 1 AND 24)
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (username);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_nickname_unique ON public.profiles (lower(nickname));
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles (lower(email));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'owner'
  );
$$;

REVOKE ALL ON FUNCTION public.is_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner() TO anon, authenticated;

-- (remainder applied via remote migration auth_profiles_and_rls_v2)
