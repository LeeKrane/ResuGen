import * as v from 'valibot'

// ─── Shared primitives ───

export const EmploymentDateSchema = v.object({
  year: v.optional(v.number()),
  month: v.optional(v.number()),
  day: v.optional(v.number()),
})

export const IconSchema = v.object({
  label: v.string(),
  value: v.string(),
  icon: v.optional(v.string()),
})

export const LinkSchema = v.object({
  name: v.string(),
  url: v.string(),
  icon: v.optional(IconSchema),
})

export const TechnologySchema = v.object({
  label: v.string(),
  value: v.string(),
  icon: v.string(),
  url: v.string(),
})

export const InstitutionSchema = v.object({
  uuid: v.optional(v.string()),
  name: v.string(),
  url: v.optional(v.string()),
})

export const LanguageSchema = v.object({
  name: v.string(),
  level: v.optional(v.picklist(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'])),
})

export const SkillSchema = v.object({
  technology: v.optional(IconSchema),
  name: v.string(),
  displayType: v.optional(IconSchema),
  level: v.optional(v.picklist(['Basic', 'Decent', 'Good', 'Proficient', 'Expert'])),
})

export const SkillCategorySchema = v.object({
  name: v.string(),
  skills: v.array(SkillSchema),
})

export const EmploymentSchema = v.object({
  institution: v.optional(InstitutionSchema),
  start: v.optional(EmploymentDateSchema),
  end: v.optional(EmploymentDateSchema),
  text: v.string(),
  active: v.optional(v.boolean()),
  collapsibleOpen: v.optional(v.boolean()),
})

export const EducationSchema = v.object({
  ...EmploymentSchema.entries,
  degree: v.string(),
})

export const ExperienceSchema = v.object({
  ...EmploymentSchema.entries,
  position: v.string(),
  technologies: v.array(TechnologySchema),
  internship: v.optional(v.boolean()),
})

export const ProjectSchema = v.object({
  name: v.string(),
  description: v.string(),
  url: v.optional(v.string()),
  repoLink: v.optional(LinkSchema),
  technologies: v.array(TechnologySchema),
  openSource: v.optional(v.boolean()),
  collapsibleOpen: v.optional(v.boolean()),
  start: v.optional(EmploymentDateSchema),
  end: v.optional(EmploymentDateSchema),
})

export const QualificationSchema = v.object({
  name: v.string(),
  issuer: v.optional(v.string()),
  date: v.optional(EmploymentDateSchema),
  description: v.optional(v.string()),
})

export const CoverLetterSchema = v.object({
  content: v.string(),
  recipientName: v.optional(v.string()),
  companyName: v.optional(v.string()),
  position: v.optional(v.string()),
})

// ─── ResumeData ───

export const ResumeDataSchema = v.object({
  name: v.string(),
  subtitle: v.string(),
  email: v.string(),
  birthdate: v.optional(EmploymentDateSchema),
  phone: v.string(),
  address: v.string(),
  summary: v.string(),
  hobbies: v.array(v.string()),
  languages: v.array(LanguageSchema),
  skillCategories: v.array(SkillCategorySchema),
  links: v.array(LinkSchema),
  educationInstitutions: v.array(InstitutionSchema),
  experienceInstitutions: v.array(InstitutionSchema),
  education: v.array(EducationSchema),
  experience: v.array(ExperienceSchema),
  projects: v.array(ProjectSchema),
  jobField: v.picklist(['IT', 'Other']),
  qualifications: v.optional(v.array(QualificationSchema)),
  coverLetter: v.optional(CoverLetterSchema),
})

// ─── ResumeStyle ───

export const SectionStateSchema = v.object({
  enabled: v.boolean(),
  order: v.number(),
})

export const ResumeStyleSchema = v.object({
  font: v.object({
    family: v.string(),
    size: v.number(),
    titleSizes: v.object({
      h1: v.number(),
      h2: v.number(),
      h3: v.number(),
    }),
    lineHeight: v.number(),
  }),
  colors: v.object({
    bg: v.optional(v.string()),
    bgElevated: v.optional(v.string()),
    text: v.object({
      title: v.string(),
      subtitle: v.string(),
      sectionTitle: v.string(),
      sectionTitleElevated: v.string(),
      base: v.string(),
      baseElevated: v.string(),
    }),
    skillLevels: v.object({
      basic: v.string(),
      decent: v.string(),
      good: v.string(),
      proficient: v.string(),
      expert: v.string(),
    }),
    languageBadges: v.string(),
    active: v.string(),
    techLogos: v.string(),
    internship: v.string(),
    openSource: v.string(),
  }),
  effects: v.object({
    useShades: v.boolean(),
    useAvatarShade: v.optional(v.boolean()),
    useGradients: v.boolean(),
    projectGradientColor: v.optional(v.string()),
    useBorders: v.boolean(),
    borderWidth: v.number(),
    borderColor: v.optional(v.string()),
    fillSkillIcon: v.boolean(),
  }),
  layout: v.object({
    type: v.picklist(['single-column', 'two-column', 'compact']),
    style: v.picklist(['fancy', 'simple']),
    showBackground: v.boolean(),
    sizeRatio: v.number(),
    sectionSpacing: v.number(),
    margin: v.number(),
  }),
  sections: v.object({
    minor: v.object({
      avatar: SectionStateSchema,
      personal: SectionStateSchema,
      languages: SectionStateSchema,
      hobbies: SectionStateSchema,
      skills: SectionStateSchema,
    }),
    major: v.object({
      summary: SectionStateSchema,
      education: SectionStateSchema,
      experience: SectionStateSchema,
      projects: SectionStateSchema,
      certifications: SectionStateSchema,
    }),
  }),
})

// ─── ResumeSummary (for list view) ───

export const ResumeSummarySchema = v.object({
  id: v.string(),
  title: v.string(),
  kind: v.picklist(['it', 'other']),
  updatedAt: v.string(),
  createdAt: v.string(),
  duplicatedFrom: v.optional(v.string()),
})
