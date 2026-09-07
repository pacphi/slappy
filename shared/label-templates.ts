export type LabelTemplateId = 'townstix-us-10' | 'avery-5390'

export const defaultLabelTemplateId: LabelTemplateId = 'townstix-us-10'

export const labelTemplates = [
  {
    id: 'townstix-us-10',
    name: 'TownStix US-10',
    widthIn: 4,
    heightIn: 2,
    nominalHeightIn: 2,
    columns: 2,
    rows: 5,
    marginTopIn: 0.5,
    marginBottomIn: 0.5,
    marginLeftIn: 0.25,
    marginRightIn: 0.25,
    columnGapIn: 0,
    rowGapIn: 0,
  },
  {
    id: 'avery-5390',
    name: 'Avery 5390',
    widthIn: 3.5,
    // Product dimensions are nominal; printing follows Avery's official PDF:
    // https://s3.amazonaws.com/avery.dpp.projects.s3uspdownloadables/CA_en/Downloadables/pdf/U-0119-01.pdf
    // Letter 612×792pt. Columns x=54,306,558; rows y=76.5 + n×159.75pt.
    heightIn: 159.75 / 72,
    nominalHeightIn: 2.25,
    columns: 2,
    rows: 4,
    marginTopIn: 76.5 / 72,
    marginBottomIn: 76.5 / 72,
    marginLeftIn: 0.75,
    marginRightIn: 0.75,
    columnGapIn: 0,
    rowGapIn: 0,
  },
] as const

export function getLabelTemplate(id: unknown = defaultLabelTemplateId) {
  const template = labelTemplates.find(template => template.id === id)
  if (!template) throw new RangeError('Unknown label template')
  return template
}
