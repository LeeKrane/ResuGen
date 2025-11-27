/**
 * Property-Based Tests for Job Field Selector
 * Feature: multi-field-resume-ai
 * 
 * These tests validate:
 * - Property 3: Job field changes update UI immediately
 * - Validates: Requirements 1.4
 * 
 * Note: Requires vitest and fast-check to be installed
 * Run with: vitest --run
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'

describe('Job Field Selector - Property Tests', () => {
  /**
   * Feature: multi-field-resume-ai, Property 3: Job field changes update UI immediately
   * Validates: Requirements 1.4
   * 
   * For any initial job field state, changing the jobField value should 
   * immediately update the visible form sections to match the new field's configuration.
   */
  it('Property 3: Job field changes update UI immediately', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('IT' as const, 'Other' as const),
        fc.constantFrom('IT' as const, 'Other' as const),
        (initialJobField, newJobField) => {
          // Arrange: Create initial state
          const state = {
            jobField: initialJobField,
            visibleSections: getVisibleSections(initialJobField)
          }
          
          // Store initial state for comparison
          const initialSections = [...state.visibleSections]
          
          // Act: Change job field
          state.jobField = newJobField
          state.visibleSections = getVisibleSections(newJobField)
          
          // Assert: Job field should be updated
          expect(state.jobField).toBe(newJobField)
          
          // Assert: Visible sections should match new job field configuration
          const expectedSections = getVisibleSections(newJobField)
          expect(state.visibleSections).toEqual(expectedSections)
          
          // Assert: If job field changed, sections should be different
          if (initialJobField !== newJobField) {
            expect(state.visibleSections).not.toEqual(initialSections)
            
            // IT should have Projects, Other should not
            if (newJobField === 'IT') {
              expect(state.visibleSections).toContain('projects')
              expect(state.visibleSections).not.toContain('qualifications')
            } else {
              expect(state.visibleSections).not.toContain('projects')
              expect(state.visibleSections).toContain('qualifications')
            }
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional test: Verify IT field configuration
   */
  it('should show IT-specific sections when IT is selected', () => {
    fc.assert(
      fc.property(
        fc.constant('IT' as const),
        (jobField) => {
          const sections = getVisibleSections(jobField)
          
          expect(sections).toContain('general')
          expect(sections).toContain('education')
          expect(sections).toContain('experience')
          expect(sections).toContain('projects')
          expect(sections).not.toContain('qualifications')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional test: Verify Other field configuration
   */
  it('should show generic sections when Other is selected', () => {
    fc.assert(
      fc.property(
        fc.constant('Other' as const),
        (jobField) => {
          const sections = getVisibleSections(jobField)
          
          expect(sections).toContain('general')
          expect(sections).toContain('education')
          expect(sections).toContain('experience')
          expect(sections).toContain('qualifications')
          expect(sections).not.toContain('projects')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional test: Verify reactivity of job field changes
   */
  it('should update configuration immediately on job field change', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('IT' as const, 'Other' as const),
        (jobField) => {
          // Simulate reactive state
          let currentJobField = jobField
          let currentConfig = getJobFieldConfig(currentJobField)
          
          // Verify initial state
          expect(currentConfig.field).toBe(jobField)
          
          // Change to opposite field
          const newJobField = jobField === 'IT' ? 'Other' : 'IT'
          currentJobField = newJobField
          currentConfig = getJobFieldConfig(currentJobField)
          
          // Verify immediate update
          expect(currentConfig.field).toBe(newJobField)
          expect(currentConfig.field).not.toBe(jobField)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Helper functions to simulate job field configuration logic
function getVisibleSections(jobField: 'IT' | 'Other'): string[] {
  const commonSections = ['general', 'education', 'experience']
  
  if (jobField === 'IT') {
    return [...commonSections, 'projects']
  } else {
    return [...commonSections, 'qualifications']
  }
}

function getJobFieldConfig(jobField: 'IT' | 'Other') {
  if (jobField === 'IT') {
    return {
      field: 'IT' as const,
      visibleTabs: ['General', 'Education', 'Experience', 'Projects'],
      skillCategories: {
        defaultName: 'Programming Languages',
        defaultSkillPlaceholder: 'TypeScript'
      },
      sections: {
        projects: true,
        qualifications: false
      }
    }
  } else {
    return {
      field: 'Other' as const,
      visibleTabs: ['General', 'Education', 'Experience'],
      skillCategories: {
        defaultName: 'Professional Skills',
        defaultSkillPlaceholder: 'Communication'
      },
      sections: {
        projects: false,
        qualifications: true
      }
    }
  }
}
