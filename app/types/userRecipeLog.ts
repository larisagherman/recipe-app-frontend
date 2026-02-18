export type UserRecipeLog = {
  id?: number;
  userId: number;
  recipeId: number;
  cookedAt: string;
  rating?: string | null;
  notes?: string | null;
};

