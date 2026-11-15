-- supabase/migrations/20261114300001_core_functions_and_profiles.sql
-- Migration 01: Core functions, profiles table, and auth registration triggers

-- 1. Shared Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := pg_catalog.now();
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_current_timestamp_updated_at() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() TO postgres, service_role;

-- 2. User Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    organization_name TEXT,
    phone_number TEXT,
    preferred_unit_system TEXT NOT NULL DEFAULT 'metric' 
        CHECK (preferred_unit_system IN ('metric', 'imperial')),
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 3. Automatic Profile Creation Trigger Function for Auth Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        preferred_unit_system, 
        preferred_language
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Farmer'),
        COALESCE(NEW.raw_user_meta_data->>'preferred_unit_system', 'metric'),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Fatal escalation: abort auth user creation if profile creation fails
        RAISE EXCEPTION 'CRITICAL: Failed to create user profile for auth.uid %: %', NEW.id, SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
