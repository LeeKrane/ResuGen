import * as v from 'valibot'

//  extract-requirements response 

export const ExtractRequirementsResponseSchema = v.object({
  keywords: v.array(v.string()),
  responsibilities: v.array(v.string()),
  mustHaves: v.array(v.string()),
  niceToHaves: v.array(v.string()),
})

export type ExtractRequirementsResponse = v.InferOutput<typeof ExtractRequirementsResponseSchema>

//  generate-resume-draft response 

export const DraftExperienceSchema = v.object({
  position: v.string(),
  text: v.string(),
  technologies: v.array(v.string()),
})

export const DraftEducationSchema = v.object({
  degree: v.string(),
  text: v.string(),
})

export const DraftSkillCategorySchema = v.object({
  name: v.string(),
  skills: v.array(v.object({ name: v.string() })),
})

export const DraftProjectSchema = v.object({
  name: v.string(),
  description: v.string(),
})

export const DraftLanguageSchema = v.object({
  name: v.string(),
  level: v.picklist(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native']),
})

export const DraftCoverLetterSchema = v.object({
  content: v.string(),
  recipientName: v.nullable(v.string()),
  companyName: v.nullable(v.string()),
  position: v.nullable(v.string()),
})

export const GenerateResumeDraftResponseSchema = v.object({
  jobField: v.picklist(['IT', 'Other']),
  name: v.nullable(v.string()),
  subtitle: v.nullable(v.string()),
  summary: v.nullable(v.string()),
  experience: v.array(DraftExperienceSchema),
  education: v.array(DraftEducationSchema),
  skillCategories: v.array(DraftSkillCategorySchema),
  projects: v.array(DraftProjectSchema),
  languages: v.array(DraftLanguageSchema),
  coverLetter: DraftCoverLetterSchema,
  provenance: v.array(v.string()),
  missing_info: v.array(v.string()),
})

export type GenerateResumeDraftResponse = v.InferOutput<typeof GenerateResumeDraftResponseSchema>

//  parse-import response 
// Uses simplified sub-schemas since AI returns flat strings for technologies,
// not the full TechnologySchema objects used in the app's data model.

// Helper: accepts both undefined (key omitted) and null (key present but null),
// which LLMs frequently produce for absent fields.
const optNull = <T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(schema: T) =>
  v.optional(v.nullable(schema))

const ParsedProfileSchema = v.object({
  name: optNull(v.string()),
  subtitle: optNull(v.string()),
  email: optNull(v.string()),
  phone: optNull(v.string()),
  address: optNull(v.string()),
  summary: optNull(v.string()),
  hobbies: optNull(v.array(v.string())),
})

const ParsedDateSchema = v.object({
  year: optNull(v.number()),
  month: optNull(v.number()),
})

const ParsedEducationSchema = v.object({
  degree: v.string(),
  institution: optNull(v.string()),
  institutionUrl: optNull(v.string()),
  text: optNull(v.string()),
  start: optNull(ParsedDateSchema),
  end: optNull(ParsedDateSchema),
  active: optNull(v.boolean()),
})

const ParsedExperienceSchema = v.object({
  position: v.string(),
  institution: optNull(v.string()),
  institutionUrl: optNull(v.string()),
  text: optNull(v.string()),
  technologies: optNull(v.array(v.string())),
  start: optNull(ParsedDateSchema),
  end: optNull(ParsedDateSchema),
  active: optNull(v.boolean()),
  internship: optNull(v.boolean()),
})

const ParsedProjectSchema = v.object({
  name: v.string(),
  description: v.string(),
  url: optNull(v.string()),
  repoUrl: optNull(v.string()),
  repoPlatform: optNull(v.string()),
  openSource: optNull(v.boolean()),
  start: optNull(ParsedDateSchema),
  end: optNull(ParsedDateSchema),
  technologies: optNull(v.array(v.string())),
})

const ParsedCertificationSchema = v.object({
  name: v.string(),
  issuer: optNull(v.string()),
})

const ParsedLinkSchema = v.object({
  name: v.string(),
  url: v.string(),
})

const ParsedLanguageSchema = v.object({
  name: v.string(),
  level: optNull(v.picklist(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'])),
})

const ParsedSkillSchema = v.object({
  name: v.string(),
  technologyValue: optNull(v.string()), // matched value from the known tech list like "python"
  level: optNull(v.picklist(['Basic', 'Decent', 'Good', 'Proficient', 'Expert'])),
})

const ParsedSkillCategorySchema = v.object({
  name: v.string(),
  skills: v.array(ParsedSkillSchema),
})

const ParsedDataSchema = v.object({
  profile: v.optional(ParsedProfileSchema),
  links: v.optional(v.array(ParsedLinkSchema)),
  languages: v.optional(v.array(ParsedLanguageSchema)),
  skillCategories: v.optional(v.array(ParsedSkillCategorySchema)),
  education: v.optional(v.array(ParsedEducationSchema)),
  experience: v.optional(v.array(ParsedExperienceSchema)),
  projects: v.optional(v.array(ParsedProjectSchema)),
  certifications: v.optional(v.array(ParsedCertificationSchema)),
})

export const ParseImportResponseSchema = v.object({
  data: ParsedDataSchema,
  confidence: v.record(v.string(), v.nullable(v.number())),
  missing_fields: v.array(v.string()),
})

export type ParseImportResponse = v.InferOutput<typeof ParseImportResponseSchema>
