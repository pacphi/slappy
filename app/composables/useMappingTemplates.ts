import { ref, computed } from 'vue'
import type { ColumnMapping } from '~/types'

const STORAGE_KEY = 'slappy-mapping-templates'

interface MappingTemplate {
  name: string
  mapping: ColumnMapping
  hasHeaders: boolean
  createdAt: string
}

/**
 * F2: Manages saving and loading column mapping templates
 * Allows users to reuse mappings for recurring CSV formats
 */
export const useMappingTemplates = () => {
  const templates = ref<Record<string, MappingTemplate>>({})

  // Load templates from localStorage on init
  const loadTemplatesFromStorage = () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        templates.value = JSON.parse(stored)
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
    templates.value[name] = {
      name,
      mapping,
      hasHeaders,
      createdAt: new Date().toISOString(),
    }
    saveTemplatesToStorage()
  }

  const loadTemplate = (name: string): MappingTemplate | null => {
    return templates.value[name] || null
  }

  const deleteTemplate = (name: string) => {
    const { [name]: _, ...rest } = templates.value
    templates.value = rest
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
