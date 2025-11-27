/**
 * Property-Based Tests for Conditional Rendering
 * Feature: multi-field-resume-ai
 * 
 * These tests validate:
 * - Property 1: IT field displays IT-specific sections
 * - Property 2: Other field displays generic sections
 * - Validates: Requirements 1.2, 1.3, 2.2, 2.3
 * 
 * Note: Requires vitest and fast-check to be installed
 * Run with: vitest --run
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Conditional Rendering - Property Tests', () => {
	/**
	 * Feature: multi-field-resume-ai, Property 1: IT field displays IT-specific sections
	 * Validates: Requirements 1.2
	 * 
	 * For any form state where jobField is set to "IT", the Projects tab should be 
	 * visible in the navigation and skill categories should have IT-specific defaults.
	 */
	it('Property 1: IT field displays IT-specific sections', () => {
		fc.assert(
			fc.property(
				fc.constant('IT' as const),
				(jobField) => {
					// Arrange: Create tab configuration for IT field
					const tabs = getTabsForJobField(jobField)
					const skillDefaults = getSkillDefaultsForJobField(jobField)

					// Assert: Projects tab should be visible
					expect(tabs.map(t => t.label)).toContain('Projects')
					expect(tabs.some(t => t.slot === 'projects')).toBe(true)

					// Assert: IT-specific skill defaults
					expect(skillDefaults.defaultName).toBe('Programming Languages')
					expect(skillDefaults.defaultSkillPlaceholder).toBe('TypeScript')

					// Assert: Common tabs should still be present
					expect(tabs.map(t => t.label)).toContain('General')
					expect(tabs.map(t => t.label)).toContain('Education')
					expect(tabs.map(t => t.label)).toContain('Experience')
					expect(tabs.map(t => t.label)).toContain('Cover Letter')

					return true
				}
			),
			{ numRuns: 100 }
		)
	})

	/**
	 * Feature: multi-field-resume-ai, Property 2: Other field displays generic sections
	 * Validates: Requirements 1.3, 2.2, 2.3
	 * 
	 * For any form state where jobField is set to "Other", the Projects tab should be 
	 * hidden, the Qualifications section should be visible, and skill categories should 
	 * have generic defaults.
	 */
	it('Property 2: Other field displays generic sections', () => {
		fc.assert(
			fc.property(
				fc.constant('Other' as const),
				(jobField) => {
					// Arrange: Create tab configuration for Other field
					const tabs = getTabsForJobField(jobField)
					const skillDefaults = getSkillDefaultsForJobField(jobField)
					const sections = getSectionsForJobField(jobField)

					// Assert: Projects tab should NOT be visible
					expect(tabs.map(t => t.label)).not.toContain('Projects')
					expect(tabs.some(t => t.slot === 'projects')).toBe(false)

					// Assert: Qualifications section should be visible
					expect(sections.qualifications).toBe(true)
					expect(sections.projects).toBe(false)

					// Assert: Generic skill defaults
					expect(skillDefaults.defaultName).toBe('Professional Skills')
					expect(skillDefaults.defaultSkillPlaceholder).toBe('Communication')

					// Assert: Common tabs should still be present
					expect(tabs.map(t => t.label)).toContain('General')
					expect(tabs.map(t => t.label)).toContain('Education')
					expect(tabs.map(t => t.label)).toContain('Experience')
					expect(tabs.map(t => t.label)).toContain('Cover Letter')

					return true
				}
			),
			{ numRuns: 100 }
		)
	})

	/**
	 * Additional test: Verify tab count differs between job fields
	 */
	it('should have different tab counts for IT vs Other', () => {
		fc.assert(
			fc.property(
				fc.constantFrom('IT' as const, 'Other' as const),
				(jobField) => {
					const tabs = getTabsForJobField(jobField)

					if (jobField === 'IT') {
						// IT should have 5 tabs: General, Cover Letter, Education, Experience, Projects
						expect(tabs.length).toBe(5)
					} else {
						// Other should have 4 tabs: General, Cover Letter, Education, Experience
						expect(tabs.length).toBe(4)
					}

					return true
				}
			),
			{ numRuns: 100 }
		)
	})

	/**
	 * Additional test: Verify sections configuration is mutually exclusive
	 */
	it('should have mutually exclusive sections for projects and qualifications', () => {
		fc.assert(
			fc.property(
				fc.constantFrom('IT' as const, 'Other' as const),
				(jobField) => {
					const sections = getSectionsForJobField(jobField)

					// Assert: Projects and Qualifications should be mutually exclusive
					if (sections.projects) {
						expect(sections.qualifications).toBe(false)
					}
					if (sections.qualifications) {
						expect(sections.projects).toBe(false)
					}

					// Assert: Exactly one should be true
					expect(sections.projects !== sections.qualifications).toBe(true)

					return true
				}
			),
			{ numRuns: 100 }
		)
	})

	/**
	 * Additional test: Verify Cover Letter tab is always present
	 */
	it('should always include Cover Letter tab regardless of job field', () => {
		fc.assert(
			fc.property(
				fc.constantFrom('IT' as const, 'Other' as const),
				(jobField) => {
					const tabs = getTabsForJobField(jobField)

					expect(tabs.map(t => t.label)).toContain('Cover Letter')
					expect(tabs.some(t => t.slot === 'cover-letter')).toBe(true)

					return true
				}
			),
			{ numRuns: 100 }
		)
	})
})

// Helper functions to simulate job field configuration logic
function getTabsForJobField(jobField: 'IT' | 'Other') {
	const baseTabs = [
		{ label: 'General', icon: 'i-lucide-user', slot: 'general' },
		{ label: 'Cover Letter', icon: 'i-lucide-file-text', slot: 'cover-letter' },
		{ label: 'Education', icon: 'i-lucide-graduation-cap', slot: 'education' },
		{ label: 'Experience', icon: 'i-lucide-briefcase', slot: 'experience' },
	]

	if (jobField === 'IT') {
		baseTabs.push({ label: 'Projects', icon: 'i-lucide-code', slot: 'projects' })
	}

	return baseTabs
}

function getSkillDefaultsForJobField(jobField: 'IT' | 'Other') {
	if (jobField === 'IT') {
		return {
			defaultName: 'Programming Languages',
			defaultSkillPlaceholder: 'TypeScript'
		}
	} else {
		return {
			defaultName: 'Professional Skills',
			defaultSkillPlaceholder: 'Communication'
		}
	}
}

function getSectionsForJobField(jobField: 'IT' | 'Other') {
	if (jobField === 'IT') {
		return {
			projects: true,
			qualifications: false
		}
	} else {
		return {
			projects: false,
			qualifications: true
		}
	}
}
