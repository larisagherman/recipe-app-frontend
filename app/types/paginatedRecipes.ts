import {FullRecipe} from "~/app/types/fullRecipe";

export interface PaginatedRecipes {
  page: number;
  content: FullRecipe[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}
