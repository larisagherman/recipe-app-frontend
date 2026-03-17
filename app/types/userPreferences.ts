export interface UserPreferences {
  id?: number;
  userId: number;

  // Dietary Types
  dietaryTypes: string[]; // vegetarian, vegan, pescatarian, omnivore, keto, paleo, glutenfree, dairyfree
  dietaryStrict: boolean; // strict vs flexible

  // Allergies & Restrictions (Critical)
  allergies: string[]; // nuts, dairy, eggs, gluten, soy, honey, shellfish
  severeAllergies: string[]; // mark as severe (never recommend)

  // Ingredient Avoidance (Custom dislikes)
  dislikedIngredients: string[];

  // Taste Preferences
  sweetnessLevel: 'notsweet' | 'mildlysweet' | 'medium' | 'verysweet' | null;
  flavourProfiles: string[]; // chocolatey, fruity, nutty, spiced, citrusy, vanilla, savory

  createdAt?: string;
  updatedAt?: string;
}

export const DIETARY_TYPES = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Omnivore',
  'Keto',
  'Paleo',
  'Gluten-free',
  'Dairy-free'
];

export const ALLERGIES = [
  'Nuts',
  'Dairy',
  'Eggs',
  'Gluten',
  'Soy',
  'Honey',
  'Shellfish'
];

export const DISLIKED_INGREDIENTS = [
  'Honey',
  'Cinnamon',
  'Coconut',
  'Chocolate',
  'Artificial sweeteners'
];

export const FLAVOR_PROFILES = [
  'Chocolatey',
  'Fruity',
  'Nutty',
  'Spiced',
  'Citrusy',
  'Vanilla-based',
  'Savory baking'
];

export const SWEETNESS_LEVELS = [
  { value: 'notsweet', label: 'Not sweet' },
  { value: 'mildlysweet', label: 'Mildly sweet' },
  { value: 'medium', label: 'Medium' },
  { value: 'verysweet', label: 'Very sweet' }
];

