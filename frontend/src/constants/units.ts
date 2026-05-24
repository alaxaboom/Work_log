export const CONSTRUCTION_UNIT_VALUES = [
  'м²',
  'м³',
  'м',
  'п.м.',
  'шт',
  'т',
  'кг',
] as const;

export type ConstructionUnit = (typeof CONSTRUCTION_UNIT_VALUES)[number];

export const CONSTRUCTION_UNITS: ReadonlyArray<{ value: ConstructionUnit; label: string }> = [
  { value: 'м²', label: 'м² — квадратный метр' },
  { value: 'м³', label: 'м³ — кубический метр' },
  { value: 'м', label: 'м — метр' },
  { value: 'п.м.', label: 'п.м. — погонный метр' },
  { value: 'шт', label: 'шт — штука' },
  { value: 'т', label: 'т — тонна' },
  { value: 'кг', label: 'кг — килограмм' },
];
