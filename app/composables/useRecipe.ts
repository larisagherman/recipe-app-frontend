import { ref } from 'vue'
import type {RecipeRecommendation} from "~/types/recipeRecommendation";
import type {PaginatedRecipes} from "~/types/paginatedRecipes";
import type {FullRecipe} from "~/types/fullRecipe";

export const useRecipe = () => {
    const recipes = ref<RecipeRecommendation[]>([])   // store recipes
    const page = ref(0)                 // current page
    const pageSize = 10                  // number per page
    const hasMore = ref(true)
    const recipe=ref()
    const loadRecipes = async () => {
        try {
            const response = await $fetch<PaginatedRecipes>(`http://localhost:8080/recipes/page?page=${page.value}&size=${pageSize}`)

            // Spring Page object has "content" and "totalPages"
            const newRecipes = response.content
            recipes.value.push(...newRecipes)

            // Check if there are more pages
            hasMore.value = page.value < response.totalPages - 1
            page.value++
        } catch (err) {
            console.error('Error fetching recipes:', err)
        }
    }
    const getRecipeById = async (id:number ) => {
        try{
            const response= await $fetch<FullRecipe>(`http://localhost:8080/recipes/${id}`,{
                method:'GET'
            })
            recipe.value=response
        }catch(err){
            console.error('Error fetching recipe by id:', err)
        }

    }

    return {
        recipes,
        loadRecipes,
        hasMore,
        page,
        recipe,
        getRecipeById,
    }
}
