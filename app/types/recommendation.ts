import type {Recipe} from "~/types/recipeRecommendation";

export interface PaginatedRecipes {
  content: Recipe[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}
