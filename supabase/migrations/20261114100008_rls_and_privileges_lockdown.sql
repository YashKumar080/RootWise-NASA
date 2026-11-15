-- supabase/migrations/20261114300008_rls_and_privileges_lockdown.sql
-- Migration 08: Principle of Least Privilege Grants and Row Level Security Lockdown

-- 1. Revoke public defaults across all application tables
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public, anon;

-- 2. Reference Catalogs & Controlled Code Sets: Public Read
GRANT SELECT ON public.iso_countries TO authenticated, anon;
GRANT SELECT ON public.crop_species TO authenticated, anon;
GRANT SELECT ON public.crop_regional_profiles TO authenticated, anon;
GRANT SELECT ON public.data_sources TO authenticated, anon;

-- 3. Profiles: Read own, update own preferences (INSERT via trigger, DELETE via cascade)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- 4. User Farm Infrastructure: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fields TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soil_samples TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crop_history TO authenticated;

-- 5. Rotation Plans: Read own, delete own. Direct client INSERT is REVOKED.
-- Column-level UPDATE restricted strictly to adoption flags and user notes.
GRANT SELECT, DELETE ON public.rotation_plans TO authenticated;
GRANT UPDATE (is_adopted, user_notes) ON public.rotation_plans TO authenticated;

-- 6. Calculation Snapshots: Strictly Immutable (SELECT only for authenticated users)
-- Direct client INSERT, UPDATE, and DELETE are strictly REVOKED.
GRANT SELECT ON public.rotation_plan_seasons TO authenticated;
GRANT SELECT ON public.risk_assessments TO authenticated;

-- 7. Environmental Telemetry: Read-only for authenticated farm owners
GRANT SELECT ON public.environmental_observations TO authenticated;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ACROSS ALL APPLICATION & REFERENCE TABLES
-- Total tables: 12 application tables + 1 controlled reference table = 13 tables
-- ============================================================================
ALTER TABLE public.iso_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_regional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotation_plan_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_observations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Reference Tables: Public Read
CREATE POLICY iso_countries_public_select ON public.iso_countries FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY species_public_select ON public.crop_species FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY regional_public_select ON public.crop_regional_profiles FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY data_sources_public_select ON public.data_sources FOR SELECT TO authenticated, anon USING (true);

-- 1. PROFILES
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated 
    USING (id = (select auth.uid()));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated 
    USING (id = (select auth.uid())) WITH CHECK (id = (select auth.uid()));

-- 2. FARMS
CREATE POLICY farms_select ON public.farms FOR SELECT TO authenticated 
    USING (user_id = (select auth.uid()));
CREATE POLICY farms_insert ON public.farms FOR INSERT TO authenticated 
    WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY farms_update ON public.farms FOR UPDATE TO authenticated 
    USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY farms_delete ON public.farms FOR DELETE TO authenticated 
    USING (user_id = (select auth.uid()));

-- 3. FIELDS (via Farm ownership)
CREATE POLICY fields_select ON public.fields FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = fields.farm_id AND farms.user_id = (select auth.uid())));
CREATE POLICY fields_insert ON public.fields FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = fields.farm_id AND farms.user_id = (select auth.uid())));
CREATE POLICY fields_update ON public.fields FOR UPDATE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = fields.farm_id AND farms.user_id = (select auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = fields.farm_id AND farms.user_id = (select auth.uid())));
CREATE POLICY fields_delete ON public.fields FOR DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = fields.farm_id AND farms.user_id = (select auth.uid())));

-- 4. SOIL SAMPLES (via Field -> Farm ownership)
CREATE POLICY soil_samples_select ON public.soil_samples FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = soil_samples.field_id AND fm.user_id = (select auth.uid())));
CREATE POLICY soil_samples_insert ON public.soil_samples FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = soil_samples.field_id AND fm.user_id = (select auth.uid())));
CREATE POLICY soil_samples_update ON public.soil_samples FOR UPDATE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = soil_samples.field_id AND fm.user_id = (select auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = soil_samples.field_id AND fm.user_id = (select auth.uid())));
CREATE POLICY soil_samples_delete ON public.soil_samples FOR DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = soil_samples.field_id AND fm.user_id = (select auth.uid())));

-- 5. CROP HISTORY
CREATE POLICY crop_history_select ON public.crop_history FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = crop_history.field_id AND fm.user_id = (select auth.uid())));
CREATE POLICY crop_history_insert ON public.crop_history FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = crop_history.field_id AND fm.user_id = (select auth.uid())));
CREATE POLICY crop_history_update ON public.crop_history FOR UPDATE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = crop_history.field_id AND fm.user_id = (select auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = crop_history.field_id AND fm.user_id = (select auth.uid())));
CREATE POLICY crop_history_delete ON public.crop_history FOR DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = crop_history.field_id AND fm.user_id = (select auth.uid())));

-- 6. ROTATION PLANS
-- Note: NO INSERT POLICY for authenticated users. Plans are created atomically via create_rotation_plan() function.
CREATE POLICY rotation_plans_select ON public.rotation_plans FOR SELECT TO authenticated 
    USING (user_id = (select auth.uid()));
CREATE POLICY rotation_plans_update ON public.rotation_plans FOR UPDATE TO authenticated 
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY rotation_plans_delete ON public.rotation_plans FOR DELETE TO authenticated 
    USING (user_id = (select auth.uid()));

-- 7. ROTATION PLAN SEASONS & RISK ASSESSMENTS
-- Strictly read-only for authenticated users. Created atomically via create_rotation_plan().
CREATE POLICY seasons_select ON public.rotation_plan_seasons FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.rotation_plans rp WHERE rp.id = rotation_plan_seasons.rotation_plan_id AND rp.user_id = (select auth.uid())));

CREATE POLICY risks_select ON public.risk_assessments FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.rotation_plans rp WHERE rp.id = risk_assessments.rotation_plan_id AND rp.user_id = (select auth.uid())));

-- 8. ENVIRONMENTAL OBSERVATIONS (Read-only for farm owners)
CREATE POLICY env_obs_select ON public.environmental_observations FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.fields f JOIN public.farms fm ON fm.id = f.farm_id WHERE f.id = environmental_observations.field_id AND fm.user_id = (select auth.uid())));
