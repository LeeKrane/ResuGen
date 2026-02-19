import * as v from 'valibot'
import { PortfolioDataSchema } from './portfolio'

// ─── extract-requirements response ───

export const ExtractRequirementsResponseSchema = v.object({
  keywords: v.array(v.string()),
  responsibilities: v.array(v.string()),
  mustHaves: v.array(v.string()),
  niceToHaves: v.array(v.string()),
})

export type ExtractRequirementsResponse = v.InferOutput<typeof ExtractRequirementsResponseSchema>

// ─── generate-resume-draft response ───

export const GenerateResumeDraftResponseSchema = v.object({
  // Suggested resume field values (all optional — AI may not have data for every field)
  name: v.optional(v.string()),
  subtitle: v.optional(v.string()),
  summary: v.optional(v.string()),
  // Which portfolio item IDs each output field was derived from
  // Every non-null field MUST have at least one entry here (anti-fabrication)
  provenance: v.array(v.object({
    field: v.string(),
    sourceIds: v.array(v.string()),
  })),
  // Fields the AI could not populate due to missing portfolio data
  missing_info: v.array(v.string()),
})

export type GenerateResumeDraftResponse = v.InferOutput<typeof GenerateResumeDraftResponseSchema>

// ─── parse-import response ───

export const ParseImportResponseSchema = v.object({
  data: v.partial(PortfolioDataSchema),
  confidence: v.record(v.string(), v.number()),
  missing_fields: v.array(v.string()),
})

export type ParseImportResponse = v.InferOutput<typeof ParseImportResponseSchema>
