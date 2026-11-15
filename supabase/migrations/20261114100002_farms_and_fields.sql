-- supabase/migrations/20261114300002_farms_and_fields.sql
-- Migration 02: ISO country reference, farms and fields hierarchy with global administrative and soil taxonomy support

-- 1. ISO 3166-1 Alpha-2 Controlled Reference Table
CREATE TABLE public.iso_countries (
    code CHAR(2) PRIMARY KEY,
    name TEXT NOT NULL
);

-- Seed comprehensive ISO 3166-1 alpha-2 sovereign and agricultural jurisdictions
INSERT INTO public.iso_countries (code, name) VALUES
    ('AF', 'Afghanistan'), ('AL', 'Albania'), ('DZ', 'Algeria'), ('AO', 'Angola'), ('AR', 'Argentina'),
    ('AM', 'Armenia'), ('AU', 'Australia'), ('AT', 'Austria'), ('AZ', 'Azerbaijan'), ('BD', 'Bangladesh'),
    ('BE', 'Belgium'), ('BJ', 'Benin'), ('BO', 'Bolivia'), ('BA', 'Bosnia and Herzegovina'), ('BW', 'Botswana'),
    ('BR', 'Brazil'), ('BG', 'Bulgaria'), ('BF', 'Burkina Faso'), ('BI', 'Burundi'), ('KH', 'Cambodia'),
    ('CM', 'Cameroon'), ('CA', 'Canada'), ('CF', 'Central African Republic'), ('TD', 'Chad'), ('CL', 'Chile'),
    ('CN', 'China'), ('CO', 'Colombia'), ('CD', 'Congo (DRC)'), ('CG', 'Congo (Republic)'), ('CR', 'Costa Rica'),
    ('CI', 'Cote d''Ivoire'), ('HR', 'Croatia'), ('CU', 'Cuba'), ('CY', 'Cyprus'), ('CZ', 'Czechia'),
    ('DK', 'Denmark'), ('DO', 'Dominican Republic'), ('EC', 'Ecuador'), ('EG', 'Egypt'), ('SV', 'El Salvador'),
    ('ET', 'Ethiopia'), ('FI', 'Finland'), ('FR', 'France'), ('DE', 'Germany'), ('GH', 'Ghana'),
    ('GR', 'Greece'), ('GT', 'Guatemala'), ('GN', 'Guinea'), ('HT', 'Haiti'), ('HN', 'Honduras'),
    ('HU', 'Hungary'), ('IN', 'India'), ('ID', 'Indonesia'), ('IR', 'Iran'), ('IQ', 'Iraq'),
    ('IE', 'Ireland'), ('IL', 'Israel'), ('IT', 'Italy'), ('JM', 'Jamaica'), ('JP', 'Japan'),
    ('JO', 'Jordan'), ('KZ', 'Kazakhstan'), ('KE', 'Kenya'), ('KR', 'Korea (South)'), ('KW', 'Kuwait'),
    ('KG', 'Kyrgyzstan'), ('LA', 'Laos'), ('LV', 'Latvia'), ('LB', 'Lebanon'), ('LR', 'Liberia'),
    ('LY', 'Libya'), ('LT', 'Lithuania'), ('MG', 'Madagascar'), ('MW', 'Malawi'), ('MY', 'Malaysia'),
    ('ML', 'Mali'), ('MX', 'Mexico'), ('MD', 'Moldova'), ('MN', 'Mongolia'), ('MA', 'Morocco'),
    ('MZ', 'Mozambique'), ('MM', 'Myanmar'), ('NA', 'Namibia'), ('NP', 'Nepal'), ('NL', 'Netherlands'),
    ('NZ', 'New Zealand'), ('NI', 'Nicaragua'), ('NE', 'Niger'), ('NG', 'Nigeria'), ('NO', 'Norway'),
    ('OM', 'Oman'), ('PK', 'Pakistan'), ('PA', 'Panama'), ('PY', 'Paraguay'), ('PE', 'Peru'),
    ('PH', 'Philippines'), ('PL', 'Poland'), ('PT', 'Portugal'), ('QA', 'Qatar'), ('RO', 'Romania'),
    ('RU', 'Russia'), ('RW', 'Rwanda'), ('SA', 'Saudi Arabia'), ('SN', 'Senegal'), ('RS', 'Serbia'),
    ('SL', 'Sierra Leone'), ('SG', 'Singapore'), ('SK', 'Slovakia'), ('SI', 'Slovenia'), ('SO', 'Somalia'),
    ('ZA', 'South Africa'), ('ES', 'Spain'), ('LK', 'Sri Lanka'), ('SD', 'Sudan'), ('SE', 'Sweden'),
    ('CH', 'Switzerland'), ('SY', 'Syria'), ('TW', 'Taiwan'), ('TJ', 'Tajikistan'), ('TZ', 'Tanzania'),
    ('TH', 'Thailand'), ('TG', 'Togo'), ('TN', 'Tunisia'), ('TR', 'Turkey'), ('TM', 'Turkmenistan'),
    ('UG', 'Uganda'), ('UA', 'Ukraine'), ('AE', 'United Arab Emirates'), ('GB', 'United Kingdom'), ('US', 'United States'),
    ('UY', 'Uruguay'), ('UZ', 'Uzbekistan'), ('VE', 'Venezuela'), ('VN', 'Vietnam'), ('YE', 'Yemen'),
    ('ZM', 'Zambia'), ('ZW', 'Zimbabwe')
ON CONFLICT (code) DO NOTHING;

-- 2. Farms Table
CREATE TABLE public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country_code CHAR(2) NOT NULL REFERENCES public.iso_countries(code),
    admin_area_level_1 TEXT,       -- State, Province, Canton, Department
    admin_area_level_2 TEXT,       -- District, County, Municipality
    locality TEXT,                 -- Village, Town, Settlement
    postal_code TEXT,
    total_area_hectares NUMERIC(10, 2) CHECK (total_area_hectares > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX idx_farms_user_id ON public.farms(user_id);
CREATE INDEX idx_farms_country ON public.farms(country_code);

CREATE TRIGGER trg_farms_updated_at
    BEFORE UPDATE ON public.farms
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 3. Fields Table
CREATE TABLE public.fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude NUMERIC(9, 6) CHECK (latitude BETWEEN -90.0 AND 90.0),
    longitude NUMERIC(9, 6) CHECK (longitude BETWEEN -180.0 AND 180.0),
    area_hectares NUMERIC(8, 2) CHECK (area_hectares > 0),
    
    -- Disentangled Physical Texture vs. Genetic Soil Classification (All Nullable)
    soil_texture_class TEXT CHECK (soil_texture_class IS NULL OR soil_texture_class IN (
        'clay', 'sandy_clay', 'silty_clay', 'clay_loam', 'sandy_clay_loam', 
        'silty_clay_loam', 'loam', 'sandy_loam', 'silt_loam', 'silt', 'loamy_sand', 'sand'
    )),
    soil_classification_group TEXT, -- e.g., 'Vertisol', 'Mollisol', 'Regur', 'Kastanozem', 'Alfisols'
    soil_classification_system TEXT CHECK (soil_classification_system IS NULL OR soil_classification_system IN (
        'usda_soil_taxonomy', 'wrb_fao', 'national_regional', 'farmer_local'
    )),
    soil_classification_source TEXT,
    
    irrigation_infrastructure TEXT CHECK (irrigation_infrastructure IS NULL OR irrigation_infrastructure IN (
        'rainfed', 'drip', 'center_pivot', 'furrow', 'flood', 'sprinkler', 'subsurface', 'mixed'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    
    -- Strict Coordinate Completeness: both NULL or both present
    CONSTRAINT chk_coordinates_complete CHECK (
        (latitude IS NULL AND longitude IS NULL) OR 
        (latitude IS NOT NULL AND longitude IS NOT NULL)
    )
);

CREATE INDEX idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX idx_fields_coords ON public.fields(latitude, longitude) WHERE latitude IS NOT NULL;

CREATE TRIGGER trg_fields_updated_at
    BEFORE UPDATE ON public.fields
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
