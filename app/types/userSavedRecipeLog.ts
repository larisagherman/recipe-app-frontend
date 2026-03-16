export type UserSavedRecipeLog = {
  id?: number;
  userId: number;
  recipeId: number;
  savedAt: string;
  notes?: string | null;
};

