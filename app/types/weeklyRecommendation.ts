export interface WeeklyRecommendation {
  id: number;
  userId: number;
  weekStart: string;
  recipe: {
    id: number;
    name: string;
    imgSrc: string;
    prepTime: string;
    cookTime: string;
    servings: string;
    ingredients: string;
    directions: string;
  };
}

