-- =============================================================================
-- RESUGEN - DB Upgrade Migration
-- =============================================================================
-- 0) EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1) RESUME KIND ENUM + METADATA COLUMNS
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resume_kind') THEN
    CREATE TYPE public.resume_kind AS ENUM ('it', 'other');
  END IF;
END $$;

ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS kind public.resume_kind NOT NULL DEFAULT 'it';

ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS duplicated_from uuid;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resumes_duplicated_from_fkey') THEN
    ALTER TABLE public.resumes
      ADD CONSTRAINT resumes_duplicated_from_fkey
      FOREIGN KEY (duplicated_from) REFERENCES public.resumes(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_kind_idx ON public.resumes(kind);

-- =============================================================================
-- 2) NEW TABLE: CERTIFICATIONS (resume-scoped)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  resume_id uuid NOT NULL,
  name_encrypted text NOT NULL,
  issuer_encrypted text,
  description_encrypted text,
  url_encrypted text,
  date_year_encrypted text,
  date_month_encrypted text,
  date_day_encrypted text,
  is_active boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  collapsible_open boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT certifications_pkey PRIMARY KEY (id),
  CONSTRAINT certifications_resume_id_fkey FOREIGN KEY (resume_id)
    REFERENCES public.resumes(id)
);

CREATE INDEX IF NOT EXISTS certifications_resume_id_idx ON public.certifications(resume_id);

-- =============================================================================
-- 3) NEW TABLE: COVER LETTERS (resume-scoped, 1:1)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cover_letters (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  resume_id uuid NOT NULL,
  recipient_name_encrypted text,
  company_name_encrypted text,
  position_encrypted text,
  content_encrypted text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cover_letters_pkey PRIMARY KEY (id),
  CONSTRAINT cover_letters_resume_id_fkey FOREIGN KEY (resume_id)
    REFERENCES public.resumes(id),
  CONSTRAINT cover_letters_resume_id_unique UNIQUE (resume_id)
);

CREATE INDEX IF NOT EXISTS cover_letters_resume_id_idx ON public.cover_letters(resume_id);

-- =============================================================================
-- 4) CASCADE DELETES + STYLE SAFETY
-- =============================================================================

-- education -> resumes (CASCADE), institution_id -> SET NULL
ALTER TABLE public.education DROP CONSTRAINT IF EXISTS education_resume_id_fkey;
ALTER TABLE public.education
  ADD CONSTRAINT education_resume_id_fkey
  FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;

ALTER TABLE public.education DROP CONSTRAINT IF EXISTS education_institution_id_fkey;
ALTER TABLE public.education
  ADD CONSTRAINT education_institution_id_fkey
  FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;

-- experience -> resumes (CASCADE), institution_id -> SET NULL
ALTER TABLE public.experience DROP CONSTRAINT IF EXISTS experience_resume_id_fkey;
ALTER TABLE public.experience
  ADD CONSTRAINT experience_resume_id_fkey
  FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;

ALTER TABLE public.experience DROP CONSTRAINT IF EXISTS experience_institution_id_fkey;
ALTER TABLE public.experience
  ADD CONSTRAINT experience_institution_id_fkey
  FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;

-- projects -> resumes (CASCADE)
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_resume_id_fkey;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_resume_id_fkey
  FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;

-- resume_links -> resumes (CASCADE)
ALTER TABLE public.resume_links DROP CONSTRAINT IF EXISTS resume_links_resume_id_fkey;
ALTER TABLE public.resume_links
  ADD CONSTRAINT resume_links_resume_id_fkey
  FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;

-- resume_languages -> resumes (CASCADE)
ALTER TABLE public.resume_languages DROP CONSTRAINT IF EXISTS resume_languages_resume_id_fkey;
ALTER TABLE public.resume_languages
  ADD CONSTRAINT resume_languages_resume_id_fkey
  FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;

-- skill_categories -> resumes (CASCADE)
ALTER TABLE public.skill_categories DROP CONSTRAINT IF EXISTS skill_categories_resume_id_fkey;
ALTER TABLE public.skill_categories
  ADD CONSTRAINT skill_categories_resume_id_fkey
  FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;

-- skills -> skill_categories (CASCADE)
ALTER TABLE public.skills DROP CONSTRAINT IF EXISTS skills_category_id_fkey;
ALTER TABLE public.skills
  ADD CONSTRAINT skills_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.skill_categories(id) ON DELETE CASCADE;

-- experience_technologies -> experience (CASCADE)
ALTER TABLE public.experience_technologies DROP CONSTRAINT IF EXISTS experience_technologies_experience_id_fkey;
ALTER TABLE public.experience_technologies
  ADD CONSTRAINT experience_technologies_experience_id_fkey
  FOREIGN KEY (experience_id) REFERENCES public.experience(id) ON DELETE CASCADE;

-- project_technologies -> projects (CASCADE)
ALTER TABLE public.project_technologies DROP CONSTRAINT IF EXISTS project_technologies_project_id_fkey;
ALTER TABLE public.project_technologies
  ADD CONSTRAINT project_technologies_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- certifications -> resumes (CASCADE)
ALTER TABLE public.certifications DROP CONSTRAINT IF EXISTS certifications_resume_id_fkey;
ALTER TABLE public.certifications
  ADD CONSTRAINT certifications_resume_id_fkey
  FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;

-- cover_letters -> resumes (CASCADE)
ALTER TABLE public.cover_letters DROP CONSTRAINT IF EXISTS cover_letters_resume_id_fkey;
ALTER TABLE public.cover_letters
  ADD CONSTRAINT cover_letters_resume_id_fkey
  FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;

-- STYLE SAFETY: resumes.style_id -> ON DELETE SET NULL (NOT CASCADE)
-- Styles are user-scoped and may be shared across resumes.
-- Deleting a resume must NOT delete the style.
ALTER TABLE public.resumes DROP CONSTRAINT IF EXISTS resumes_style_id_fkey;
ALTER TABLE public.resumes
  ADD CONSTRAINT resumes_style_id_fkey
  FOREIGN KEY (style_id) REFERENCES public.resume_styles(id) ON DELETE SET NULL;

-- =============================================================================
-- 5) INDEXES ON FK COLUMNS
-- =============================================================================
CREATE INDEX IF NOT EXISTS education_resume_id_idx ON public.education(resume_id);
CREATE INDEX IF NOT EXISTS experience_resume_id_idx ON public.experience(resume_id);
CREATE INDEX IF NOT EXISTS projects_resume_id_idx ON public.projects(resume_id);
CREATE INDEX IF NOT EXISTS resume_links_resume_id_idx ON public.resume_links(resume_id);
CREATE INDEX IF NOT EXISTS resume_languages_resume_id_idx ON public.resume_languages(resume_id);
CREATE INDEX IF NOT EXISTS skill_categories_resume_id_idx ON public.skill_categories(resume_id);
CREATE INDEX IF NOT EXISTS skills_category_id_idx ON public.skills(category_id);

-- =============================================================================
-- 6) PORTFOLIO TABLES (user-scoped, for AI + source-of-truth)
-- =============================================================================

-- 6.1 Applicant profile
CREATE TABLE IF NOT EXISTS public.applicant_profile (
  user_id uuid NOT NULL,
  subtitle_encrypted text,
  email_encrypted text,
  phone_encrypted text,
  address_encrypted text,
  summary_encrypted text,
  birth_year_encrypted text,
  birth_month_encrypted text,
  birth_day_encrypted text,
  avatar_data_encrypted text,
  avatar_filename_encrypted text,
  avatar_content_type_encrypted text,
  hobbies_encrypted text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT applicant_profile_pkey PRIMARY KEY (user_id),
  CONSTRAINT applicant_profile_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 6.2 Portfolio links
CREATE TABLE IF NOT EXISTS public.applicant_links (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name_encrypted text NOT NULL,
  url_encrypted text NOT NULL,
  icon_label_encrypted text,
  icon_value_encrypted text,
  icon_icon text,
  sort_order integer DEFAULT 0,
  CONSTRAINT applicant_links_pkey PRIMARY KEY (id),
  CONSTRAINT applicant_links_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS applicant_links_user_id_idx ON public.applicant_links(user_id);

-- 6.3 Portfolio languages
CREATE TABLE IF NOT EXISTS public.applicant_languages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name_encrypted text NOT NULL,
  level_encrypted text,
  sort_order integer DEFAULT 0,
  CONSTRAINT applicant_languages_pkey PRIMARY KEY (id),
  CONSTRAINT applicant_languages_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS applicant_languages_user_id_idx ON public.applicant_languages(user_id);

-- 6.4 Portfolio skill categories + skills
CREATE TABLE IF NOT EXISTS public.applicant_skill_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name_encrypted text NOT NULL,
  sort_order integer DEFAULT 0,
  CONSTRAINT applicant_skill_categories_pkey PRIMARY KEY (id),
  CONSTRAINT applicant_skill_categories_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS applicant_skill_categories_user_id_idx ON public.applicant_skill_categories(user_id);

CREATE TABLE IF NOT EXISTS public.applicant_skills (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL,
  name_encrypted text NOT NULL,
  level_encrypted text,
  technology_label_encrypted text,
  technology_value_encrypted text,
  technology_icon text,
  display_type_label_encrypted text,
  display_type_value_encrypted text,
  display_type_icon text,
  sort_order integer DEFAULT 0,
  CONSTRAINT applicant_skills_pkey PRIMARY KEY (id),
  CONSTRAINT applicant_skills_category_id_fkey FOREIGN KEY (category_id)
    REFERENCES public.applicant_skill_categories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS applicant_skills_category_id_idx ON public.applicant_skills(category_id);

-- 6.5 Portfolio education
CREATE TABLE IF NOT EXISTS public.applicant_education (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  institution_id uuid,
  institution_name_encrypted text,
  institution_url_encrypted text,
  degree_encrypted text NOT NULL,
  description_encrypted text,
  start_year_encrypted text,
  start_month_encrypted text,
  start_day_encrypted text,
  end_year_encrypted text,
  end_month_encrypted text,
  end_day_encrypted text,
  is_active boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  collapsible_open boolean DEFAULT true,
  CONSTRAINT applicant_education_pkey PRIMARY KEY (id),
  CONSTRAINT applicant_education_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT applicant_education_institution_id_fkey FOREIGN KEY (institution_id)
    REFERENCES public.institutions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS applicant_education_user_id_idx ON public.applicant_education(user_id);

-- 6.6 Portfolio experience
CREATE TABLE IF NOT EXISTS public.applicant_experience (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  institution_id uuid,
  institution_name_encrypted text,
  institution_url_encrypted text,
  position_encrypted text NOT NULL,
  description_encrypted text,
  is_internship boolean DEFAULT false,
  start_year_encrypted text,
  start_month_encrypted text,
  start_day_encrypted text,
  end_year_encrypted text,
  end_month_encrypted text,
  end_day_encrypted text,
  is_active boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  collapsible_open boolean DEFAULT true,
  CONSTRAINT applicant_experience_pkey PRIMARY KEY (id),
  CONSTRAINT applicant_experience_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT applicant_experience_institution_id_fkey FOREIGN KEY (institution_id)
    REFERENCES public.institutions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS applicant_experience_user_id_idx ON public.applicant_experience(user_id);

-- Portfolio experience technologies
CREATE TABLE IF NOT EXISTS public.applicant_experience_technologies (
  experience_id uuid NOT NULL,
  technology_id uuid NOT NULL,
  CONSTRAINT applicant_experience_technologies_pkey PRIMARY KEY (experience_id, technology_id),
  CONSTRAINT applicant_experience_technologies_experience_id_fkey FOREIGN KEY (experience_id)
    REFERENCES public.applicant_experience(id) ON DELETE CASCADE,
  CONSTRAINT applicant_experience_technologies_technology_id_fkey FOREIGN KEY (technology_id)
    REFERENCES public.technologies(id) ON DELETE RESTRICT
);

-- 6.7 Portfolio projects
CREATE TABLE IF NOT EXISTS public.applicant_projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name_encrypted text NOT NULL,
  description_encrypted text,
  url_encrypted text,
  repo_link_name_encrypted text,
  repo_link_url_encrypted text,
  repo_link_icon_label_encrypted text,
  repo_link_icon_value_encrypted text,
  repo_link_icon_icon text,
  is_open_source boolean DEFAULT false,
  start_year_encrypted text,
  start_month_encrypted text,
  start_day_encrypted text,
  end_year_encrypted text,
  end_month_encrypted text,
  end_day_encrypted text,
  sort_order integer DEFAULT 0,
  collapsible_open boolean DEFAULT true,
  CONSTRAINT applicant_projects_pkey PRIMARY KEY (id),
  CONSTRAINT applicant_projects_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS applicant_projects_user_id_idx ON public.applicant_projects(user_id);

-- Portfolio project technologies
CREATE TABLE IF NOT EXISTS public.applicant_project_technologies (
  project_id uuid NOT NULL,
  technology_id uuid NOT NULL,
  CONSTRAINT applicant_project_technologies_pkey PRIMARY KEY (project_id, technology_id),
  CONSTRAINT applicant_project_technologies_project_id_fkey FOREIGN KEY (project_id)
    REFERENCES public.applicant_projects(id) ON DELETE CASCADE,
  CONSTRAINT applicant_project_technologies_technology_id_fkey FOREIGN KEY (technology_id)
    REFERENCES public.technologies(id) ON DELETE RESTRICT
);

-- 6.8 Portfolio certifications
CREATE TABLE IF NOT EXISTS public.applicant_certifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name_encrypted text NOT NULL,
  issuer_encrypted text,
  description_encrypted text,
  url_encrypted text,
  date_year_encrypted text,
  date_month_encrypted text,
  date_day_encrypted text,
  is_active boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  collapsible_open boolean DEFAULT true,
  CONSTRAINT applicant_certifications_pkey PRIMARY KEY (id),
  CONSTRAINT applicant_certifications_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS applicant_certifications_user_id_idx ON public.applicant_certifications(user_id);

-- =============================================================================
-- 7) RLS POLICIES FOR NEW TABLES
-- =============================================================================
-- Existing tables already have RLS enabled with proper policies.
-- We add RLS to the NEW tables created above.

-- certifications (resume-scoped)
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage certifications" ON public.certifications
  FOR ALL USING (
    resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
  ) WITH CHECK (
    resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
  );

-- cover_letters (resume-scoped)
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage cover letters" ON public.cover_letters
  FOR ALL USING (
    resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
  ) WITH CHECK (
    resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
  );

-- applicant_profile (user-scoped)
ALTER TABLE public.applicant_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant profile" ON public.applicant_profile
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- applicant_links (user-scoped)
ALTER TABLE public.applicant_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant links" ON public.applicant_links
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- applicant_languages (user-scoped)
ALTER TABLE public.applicant_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant languages" ON public.applicant_languages
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- applicant_skill_categories (user-scoped)
ALTER TABLE public.applicant_skill_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant skill categories" ON public.applicant_skill_categories
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- applicant_skills (category-scoped, chain through category -> user)
ALTER TABLE public.applicant_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant skills" ON public.applicant_skills
  FOR ALL USING (
    category_id IN (SELECT id FROM public.applicant_skill_categories WHERE user_id = auth.uid())
  ) WITH CHECK (
    category_id IN (SELECT id FROM public.applicant_skill_categories WHERE user_id = auth.uid())
  );

-- applicant_education (user-scoped)
ALTER TABLE public.applicant_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant education" ON public.applicant_education
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- applicant_experience (user-scoped)
ALTER TABLE public.applicant_experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant experience" ON public.applicant_experience
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- applicant_experience_technologies (join, chain through experience -> user)
ALTER TABLE public.applicant_experience_technologies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant experience technologies" ON public.applicant_experience_technologies
  FOR ALL USING (
    experience_id IN (SELECT id FROM public.applicant_experience WHERE user_id = auth.uid())
  ) WITH CHECK (
    experience_id IN (SELECT id FROM public.applicant_experience WHERE user_id = auth.uid())
  );

-- applicant_projects (user-scoped)
ALTER TABLE public.applicant_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant projects" ON public.applicant_projects
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- applicant_project_technologies (join, chain through project -> user)
ALTER TABLE public.applicant_project_technologies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant project technologies" ON public.applicant_project_technologies
  FOR ALL USING (
    project_id IN (SELECT id FROM public.applicant_projects WHERE user_id = auth.uid())
  ) WITH CHECK (
    project_id IN (SELECT id FROM public.applicant_projects WHERE user_id = auth.uid())
  );

-- applicant_certifications (user-scoped)
ALTER TABLE public.applicant_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own applicant certifications" ON public.applicant_certifications
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- 8) HELPER FUNCTION: get_my_applicant_data()
-- =============================================================================
-- Returns all portfolio data as a single JSON payload for the AI feature.
-- Uses auth.uid() so the caller only gets their own data.

CREATE OR REPLACE FUNCTION public.get_my_applicant_data()
RETURNS jsonb
LANGUAGE sql
AS $$
SELECT jsonb_build_object(
  'profile', (
    SELECT to_jsonb(ap)
    FROM public.applicant_profile ap
    WHERE ap.user_id = auth.uid()
  ),
  'links', (
    SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY l.sort_order), '[]'::jsonb)
    FROM public.applicant_links l
    WHERE l.user_id = auth.uid()
  ),
  'languages', (
    SELECT coalesce(jsonb_agg(to_jsonb(lang) ORDER BY lang.sort_order), '[]'::jsonb)
    FROM public.applicant_languages lang
    WHERE lang.user_id = auth.uid()
  ),
  'education', (
    SELECT coalesce(jsonb_agg(to_jsonb(e) ORDER BY e.sort_order), '[]'::jsonb)
    FROM public.applicant_education e
    WHERE e.user_id = auth.uid()
  ),
  'experience', (
    SELECT coalesce(jsonb_agg(
      jsonb_build_object(
        'item', to_jsonb(x),
        'technologies', (
          SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
          FROM public.applicant_experience_technologies xt
          JOIN public.technologies t ON t.id = xt.technology_id
          WHERE xt.experience_id = x.id
        )
      ) ORDER BY x.sort_order
    ), '[]'::jsonb)
    FROM public.applicant_experience x
    WHERE x.user_id = auth.uid()
  ),
  'projects', (
    SELECT coalesce(jsonb_agg(
      jsonb_build_object(
        'item', to_jsonb(p),
        'technologies', (
          SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
          FROM public.applicant_project_technologies pt
          JOIN public.technologies t ON t.id = pt.technology_id
          WHERE pt.project_id = p.id
        )
      ) ORDER BY p.sort_order
    ), '[]'::jsonb)
    FROM public.applicant_projects p
    WHERE p.user_id = auth.uid()
  ),
  'skillCategories', (
    SELECT coalesce(jsonb_agg(
      jsonb_build_object(
        'category', to_jsonb(c),
        'skills', (
          SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY s.sort_order), '[]'::jsonb)
          FROM public.applicant_skills s
          WHERE s.category_id = c.id
        )
      ) ORDER BY c.sort_order
    ), '[]'::jsonb)
    FROM public.applicant_skill_categories c
    WHERE c.user_id = auth.uid()
  ),
  'certifications', (
    SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.sort_order), '[]'::jsonb)
    FROM public.applicant_certifications c
    WHERE c.user_id = auth.uid()
  ),
  'institutions', (
    SELECT coalesce(jsonb_agg(to_jsonb(i)), '[]'::jsonb)
    FROM public.institutions i
    WHERE i.user_id = auth.uid()
  ),
  'technologies', (
    SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
    FROM public.technologies t
    WHERE t.user_id = auth.uid()
  )
);
$$;

-- =============================================================================

--  Institution UUID reference columns 
-- Stores the encrypted local UUID of the selected institution on each entry.
-- This replaces the name→UUID lookup that was unreliable on reload.

ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS institution_uuid_encrypted TEXT;

ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS institution_uuid_encrypted TEXT;

ALTER TABLE public.applicant_education
  ADD COLUMN IF NOT EXISTS institution_uuid_encrypted TEXT;

ALTER TABLE public.applicant_experience
  ADD COLUMN IF NOT EXISTS institution_uuid_encrypted TEXT;

--  Technologies encrypted columns 
-- Stores technologies as encrypted JSON directly on each entry row.
-- Avoids the complexity of UUID lookups into the shared technologies table.

ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS technologies_encrypted TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS technologies_encrypted TEXT;

ALTER TABLE public.applicant_experience
  ADD COLUMN IF NOT EXISTS technologies_encrypted TEXT;

ALTER TABLE public.applicant_projects
  ADD COLUMN IF NOT EXISTS technologies_encrypted TEXT;
