interface SymptomCategory {
  id: string;
  name: string;
  symptoms: string[];
}

export const symptomCategories: SymptomCategory[] = [
  {
    id: 'musculoskeletal',
    name: 'Musculoskeletal',
    symptoms: [
      'joint pain',
      'muscle pain',
      'weakness',
      'stiffness',
      'limited range of motion',
      'swelling',
      'numbness',
      'tingling',
      'back pain',
      'neck pain',
      'shoulder pain',
      'knee pain'
    ]
  },
  {
    id: 'digestive',
    name: 'Digestive',
    symptoms: [
      'nausea',
      'vomiting',
      'abdominal pain',
      'bloating',
      'indigestion',
      'constipation',
      'diarrhea',
      'acid reflux',
      'poor appetite',
      'digestion',
      'stomach pain',
      'digestive weakness'
    ]
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    symptoms: [
      'cough',
      'shortness of breath',
      'wheezing',
      'chest congestion',
      'sinus congestion',
      'sore throat',
      'runny nose',
      'respiratory',
      'breathing difficulty',
      'asthma'
    ]
  },
  {
    id: 'neurological',
    name: 'Neurological',
    symptoms: [
      'headache',
      'migraine',
      'dizziness',
      'vertigo',
      'tremors',
      'memory issues',
      'concentration problems',
      'insomnia',
      'numbness',
      'tingling',
      'nerve pain'
    ]
  },
  {
    id: 'emotional',
    name: 'Emotional & Mental',
    symptoms: [
      'anxiety',
      'depression',
      'stress',
      'irritability',
      'mood swings',
      'fatigue',
      'restlessness',
      'emotional',
      'mental fatigue',
      'sleep issues'
    ]
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    symptoms: [
      'palpitations',
      'chest pain',
      'high blood pressure',
      'poor circulation',
      'cold hands and feet',
      'circulation',
      'blood stasis',
      'irregular heartbeat'
    ]
  },
  {
    id: 'gynecological',
    name: 'Gynecological',
    symptoms: [
      'menstrual',
      'menstrual pain',
      'irregular periods',
      'heavy periods',
      'infertility',
      'reproductive issues',
      'uterine problems'
    ]
  },
  {
    id: 'urinary',
    name: 'Urinary & Kidney',
    symptoms: [
      'urinary',
      'frequent urination',
      'difficult urination',
      'urinary retention',
      'kidney weakness',
      'edema',
      'water retention'
    ]
  },
  {
    id: 'inflammation',
    name: 'Inflammation & Heat',
    symptoms: [
      'inflammation',
      'fever',
      'heat signs',
      'night sweats',
      'excessive thirst',
      'swelling',
      'redness'
    ]
  },
  {
    id: 'sensory',
    name: 'Sensory',
    symptoms: [
      'vision problems',
      'eye pain',
      'hearing issues',
      'tinnitus',
      'taste issues',
      'loss of smell',
      'sinus problems'
    ]
  }
];
