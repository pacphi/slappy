import { ref, computed, readonly } from 'vue'
import type { ColumnMapping } from '#shared/types'
import { columnMappingSchema } from '#shared/validation'
import { z } from 'zod'

const STORAGE_KEY = 'slappy-mapping-templates'

interface MappingTemplate {
  name: string
  mapping: ColumnMapping
  hasHeaders: boolean
  createdAt: string
}

const templateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  mapping: columnMappingSchema,
  hasHeaders: z.boolean(),
  createdAt: z.iso.datetime(),
})

const isSafeName = (name: string) => !['__proto__', 'constructor', 'prototype'].includes(name)

function parseStoredTemplates(stored: string): Record<string, MappingTemplate> {
  const templates: Record<string, MappingTemplate> = Object.create(null)
  const parsed: unknown = JSON.parse(stored)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return templates
  for (const [name, value] of Object.entries(parsed)) {
    const result = templateSchema.safeParse(value)
    if (isSafeName(name) && result.success && result.data.name === name) {
      templates[name] = result.data
    }
  }
  return templates
}

/**
 * F2: Manages saving and loading column mapping templates
 * Allows users to reuse mappings for recurring CSV formats
 */
export const useMappingTemplates = () => {
  const templates = ref<Record<string, MappingTemplate>>(Object.create(null))

  // Load templates from localStorage on init
  const loadTemplatesFromStorage = () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        templates.value = parseStoredTemplates(stored)
      }
    } catch (error) {
      console.error('Failed to load templates from localStorage:', error)
    }
  }

  // Save templates to localStorage
  const saveTemplatesToStorage = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value))
    } catch (error) {
      console.error('Failed to save templates to localStorage:', error)
    }
  }

  // Initialize templates
  loadTemplatesFromStorage()

  const templateNames = computed(() => Object.keys(templates.value).sort())

  const saveTemplate = (name: string, mapping: ColumnMapping, hasHeaders: boolean) => {
    const normalizedName = name.trim()
    const result = templateSchema.safeParse({
      name: normalizedName,
      mapping,
      hasHeaders,
      createdAt: new Date().toISOString(),
    })
    if (!isSafeName(normalizedName) || !result.success) return
    templates.value[normalizedName] = result.data
    saveTemplatesToStorage()
  }

  const loadTemplate = (name: string): MappingTemplate | null => {
    if (!Object.hasOwn(templates.value, name)) return null
    const template = templates.value[name]
    if (!template) return null
    return { ...template, mapping: { ...template.mapping } }
  }

  const deleteTemplate = (name: string) => {
    Reflect.deleteProperty(templates.value, name)
    saveTemplatesToStorage()
  }

  const hasTemplates = computed(() => templateNames.value.length > 0)

  return {
    templates: readonly(templates),
    templateNames: readonly(templateNames),
    hasTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  }
}
