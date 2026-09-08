import { averyTemplates } from './labels/avery'
import { onlineLabelsTemplates } from './labels/onlinelabels'
import { townstixTemplates } from './labels/townstix'

// Historical IDs retain their own geometry for existing API and CLI callers.
const legacyIds: ReadonlySet<string> = new Set([
  'onlinelabels-ol100',
  'onlinelabels-ol125',
  'onlinelabels-ol150',
  'onlinelabels-ol400',
  'onlinelabels-ol500',
  'onlinelabels-ol525',
  'onlinelabels-ol750',
  'onlinelabels-ol875',
  'onlinelabels-ol900',
  'onlinelabels-ol175',
])

export const allLabelTemplates = [...averyTemplates, ...onlineLabelsTemplates, ...townstixTemplates]
export const labelTemplates = allLabelTemplates
  .filter(template => !legacyIds.has(template.id))
  .sort((left, right) => left.name.localeCompare(right.name, 'en'))

export type LabelTemplateId = (typeof allLabelTemplates)[number]['id']
export const defaultLabelTemplateId: LabelTemplateId = 'avery-5390'

export function getLabelTemplate(id: unknown = defaultLabelTemplateId) {
  const template = allLabelTemplates.find(template => template.id === id)
  if (!template) throw new RangeError('Unknown label template')
  return template
}
