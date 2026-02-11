import type {FullRecipe} from "~/types/fullRecipe";

export interface PaginatedRecipes {
  content: FullRecipe[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}
