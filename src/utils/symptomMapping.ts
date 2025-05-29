import { symptomCategories } from '../data/symptoms';

type SymptomSynonym = {
  term: string;
  synonyms: string[];
};

// Symptom synonyms mapping for common terms
export const symptomSynonyms: SymptomSynonym[] = [
  // Basic symptoms
  {
    term: 'pain',
    synonyms: ['ache', 'discomfort', 'soreness', 'relieves pain', 'alleviates pain']
  },
  {
    term: 'inflammation',
    synonyms: ['swelling', 'heat', 'clears heat', 'reduces swelling', 'damp-heat']
  },
  {
    term: 'congestion',
    synonyms: ['blockage', 'stagnation', 'fullness', 'opens', 'unblocks']
  },
  
  // Digestive symptoms
  {
    term: 'digestion',
    synonyms: ['digestive', 'stomach', 'intestinal', 'spleen', 'harmonizes middle']
  },
  {
    term: 'nausea',
    synonyms: ['vomiting', 'descends rebellious qi', 'stops vomiting']
  },
  
  // Respiratory symptoms
  {
    term: 'respiratory',
    synonyms: ['breathing', 'lungs', 'chest', 'cough', 'wheezing']
  },
  
  // Emotional/mental symptoms
  {
    term: 'emotional',
    synonyms: ['spirit', 'shen', 'calms spirit', 'mental']
  },
  
  // Additional specific conditions
  {
    term: 'dizziness',
    synonyms: ['vertigo', 'balance', 'stabilizes']
  },
  {
    term: 'headache',
    synonyms: ['head pain', 'benefits head', 'clears head']
  }
];

// Map healing properties to likely symptoms with improved matching
export function extractSymptomsFromHealing(healingText: string): string[] {
  if (!healingText) return [];
  
  const symptoms = new Set<string>();
  const lowerHealingText = healingText.toLowerCase();
  
  // Check each category's symptoms
  symptomCategories.forEach(category => {
    // Direct symptom matching
    category.symptoms.forEach(symptom => {
      if (lowerHealingText.includes(symptom.toLowerCase())) {
        symptoms.add(symptom);
      }
      
      // Check synonyms
      const synonymData = symptomSynonyms.find(s => s.term === symptom);
      if (synonymData) {
        for (const synonym of synonymData.synonyms) {
          if (lowerHealingText.includes(synonym.toLowerCase())) {
            symptoms.add(symptom);
            break;
          }
        }
      }
    });
    
    // Special case handling
    switch (category.id) {
      case 'respiratory':
        if (lowerHealingText.includes('lung') || 
            lowerHealingText.includes('chest') ||
            lowerHealingText.includes('breathe')) {
          symptoms.add('respiratory');
        }
        break;
        
      case 'digestive':
        if (lowerHealingText.includes('stomach') || 
            lowerHealingText.includes('spleen') ||
            lowerHealingText.includes('intestine') ||
            lowerHealingText.includes('digestion')) {
          symptoms.add('digestion');
        }
        break;
        
      case 'emotional':
        if (lowerHealingText.includes('shen') || 
            lowerHealingText.includes('spirit') ||
            lowerHealingText.includes('calm')) {
          symptoms.add('emotional');
        }
        break;
        
      case 'inflammation':
        if (lowerHealingText.includes('heat') || 
            lowerHealingText.includes('fire') ||
            lowerHealingText.includes('damp')) {
          symptoms.add('inflammation');
        }
        break;
    }
  });
  
  return Array.from(symptoms);
}

// Helper functions for symptom lookup
export function getCategoryForSymptom(symptom: string): string | null {
  for (const category of symptomCategories) {
    if (category.symptoms.includes(symptom)) {
      return category.id;
    }
  }
  return null;
}

export function findMatchingSynonyms(searchTerm: string): string[] {
  const matches = new Set<string>();
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  symptomSynonyms.forEach(synonym => {
    if (synonym.term.toLowerCase().includes(lowerSearchTerm) ||
        synonym.synonyms.some(s => s.toLowerCase().includes(lowerSearchTerm))) {
      matches.add(synonym.term);
    }
  });
  
  return Array.from(matches);
}
