interface Option {
  value: string;
  label: string;
}

export const COUNTRY_OPTIONS: Option[] = [
  { value: '', label: 'غير محدد' },
  { value: 'sa', label: 'السعودية' },
  { value: 'ae', label: 'الإمارات' },
  { value: 'kw', label: 'الكويت' },
  { value: 'qa', label: 'قطر' },
  { value: 'bh', label: 'البحرين' },
  { value: 'om', label: 'عُمان' },
  { value: 'ye', label: 'اليمن' },
  { value: 'eg', label: 'مصر' },
  { value: 'sd', label: 'السودان' },
  { value: 'jo', label: 'الأردن' },
  { value: 'ps', label: 'فلسطين' },
  { value: 'lb', label: 'لبنان' },
  { value: 'sy', label: 'سوريا' },
  { value: 'iq', label: 'العراق' },
  { value: 'ly', label: 'ليبيا' },
  { value: 'tn', label: 'تونس' },
  { value: 'dz', label: 'الجزائر' },
  { value: 'ma', label: 'المغرب' },
  { value: 'mr', label: 'موريتانيا' },
  { value: 'tr', label: 'تركيا' },
  { value: 'other', label: 'دولة أخرى' },
];

export const GENDER_OPTIONS: Option[] = [
  { value: '', label: 'غير محدد' },
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
  { value: 'other', label: 'آخر' },
];

export function optionLabel(options: Option[], value: string | undefined): string {
  if (!value) return 'غير محدد';
  return options.find((option) => option.value === value)?.label ?? 'غير محدد';
}
