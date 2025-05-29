export const meridianFullNameToAbbrev: Record<string, string> = {
  'Lung': 'LU',
  'Large Intestine': 'LI',
  'Stomach': 'ST',
  'Spleen': 'SP',
  'Heart': 'HT',
  'Small Intestine': 'SI',
  'Urinary Bladder': 'BL',
  'Kidney': 'KI',
  'Pericardium': 'PC',
  'Triple Burner': 'TE',
  'Gall Bladder': 'GB',
  'Liver': 'LV'
};

export const meridianAbbrevToFullName: Record<string, string> = 
  Object.entries(meridianFullNameToAbbrev).reduce((acc, [full, abbrev]) => {
    acc[abbrev] = full;
    return acc;
  }, {} as Record<string, string>);
