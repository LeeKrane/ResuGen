import * as v from 'valibot'
import {
  EmploymentDateSchema,
  LinkSchema,
  LanguageSchema,
  SkillCategorySchema,
  EducationSchema,
  ExperienceSchema,
  ProjectSchema,
  QualificationSchema,
  InstitutionSchema,
} from './resume'

// ─── PortfolioData ───

export const PortfolioProfileSchema = v.object({
  subtitle: v.string(),
  email: v.string(),
  phone: v.string(),
  address: v.string(),
  summary: v.string(),
  birthdate: v.optional(EmploymentDateSchema),
  hobbies: v.array(v.string()),
  avatarData: v.optional(v.string()),
  avatarFilename: v.optional(v.string()),
  avatarContentType: v.optional(v.string()),
})

export const PortfolioDataSchema = v.object({
  profile: PortfolioProfileSchema,
  links: v.array(LinkSchema),
  languages: v.array(LanguageSchema),
  skillCategories: v.array(SkillCategorySchema),
  education: v.array(EducationSchema),
  experience: v.array(ExperienceSchema),
  projects: v.array(ProjectSchema),
  certifications: v.array(QualificationSchema),
  institutions: v.array(InstitutionSchema),
})
