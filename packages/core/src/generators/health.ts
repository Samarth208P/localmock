export const HOSPITALS = [
  { name: 'Mayo Clinic', city: 'Rochester', state: 'MN', zip: '55905', npi: '1234567890' },
  { name: 'Cleveland Clinic', city: 'Cleveland', state: 'OH', zip: '44195', npi: '0987654321' },
  { name: 'Johns Hopkins Hospital', city: 'Baltimore', state: 'MD', zip: '21287', npi: '1122334455' },
  { name: 'Massachusetts General Hospital', city: 'Boston', state: 'MA', zip: '02114', npi: '5544332211' }
];

export const DIAGNOSES_ICD10 = [
  { code: 'J01.90', descShort: 'Acute sinusitis', descLong: 'Acute sinusitis, unspecified' },
  { code: 'I10', descShort: 'Hypertension', descLong: 'Essential (primary) hypertension' },
  { code: 'E11.9', descShort: 'Type 2 diabetes', descLong: 'Type 2 diabetes mellitus without complications' }
];

export const PROCEDURES_ICD10 = [
  { code: '0DTJ0ZZ', descShort: 'Appendectomy', descLong: 'Resection of Appendix, Open Approach' },
  { code: '0SRD0J9', descShort: 'Knee replacement', descLong: 'Replacement of Right Knee Joint with Synthetic Substitute' }
];

export const DRUGS_GENERIC = ['Atorvastatin', 'Levothyroxine', 'Lisinopril', 'Metformin', 'Amlodipine', 'Metoprolol', 'Albuterol', 'Omeprazole', 'Losartan', 'Gabapentin'];
export const DRUGS_BRAND = ['Lipitor', 'Synthroid', 'Zestril', 'Glucophage', 'Norvasc', 'Lopressor', 'ProAir', 'Prilosec', 'Cozaar', 'Neurontin'];
