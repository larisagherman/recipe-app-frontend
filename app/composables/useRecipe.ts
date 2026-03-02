import { ref } from 'vue';
import type {FullRecipe} from "~/types/fullRecipe";
import type {Recommendation} from "~/types/Recommendation";
import type {PaginatedRecipes} from "~/types/paginatedRecipes";
export const useRecipe = () => {
    const config = useRuntimeConfig();
    const baseUrl = config.public.apiBaseUrl || 'http://localhost:8080';

    // State
    const recipes = ref<FullRecipe[]>([]);
    const recipe = ref<FullRecipe | null>(null);
    const recommendations = ref<Recommendation[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);
    const bakedRecipes = ref<Set<number>>(new Set());
    const pagination = ref<{
        totalPages: number;
        totalElements: number;
        currentPage: number;
        size: number;
    }>({
        totalPages: 0,
        totalElements: 0,
        currentPage: 0,
        size: 10,
    });

    // Fetch all recipes with pagination
    const fetchRecipes = async (page: number = 0, size: number = 10) => {
        loading.value = true;
        error.value = null;
        try {
            const data = await $fetch<PaginatedRecipes>(`${baseUrl}/recipes/page`, { // <-- add /page
                params: { page, size },
            });
            recipes.value = data.content;
            pagination.value = {
                totalPages: data.totalPages,
                totalElements: data.totalElements,
                currentPage: data.page, // Swagger uses "page" not "number"
                size: data.size,
            };
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch recipes';
            console.error('Error fetching recipes:', e);
        } finally {
            loading.value = false;
        }
    };


    // Get a recipe by ID
    const getRecipeById = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            const data = await $fetch<FullRecipe>(`${baseUrl}/recipes/${id}`);
            recipe.value = data;
            return data;
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch recipe';
            console.error('Error fetching recipe:', e);
            return null;
        } finally {
            loading.value = false;
        }
    };

    // Search recipes by name
    const searchRecipes = async (query: string, page: number = 0, size: number = 10) => {
        loading.value = true;
        error.value = null;
        try {
            const data = await $fetch<PaginatedRecipes>(`${baseUrl}/recipes/search`, {
                params: { query, page, size },
            });
            recipes.value = data.content;
            pagination.value = {
                totalPages: data.totalPages,
                totalElements: data.totalElements,
                currentPage: data.number,
                size: data.size,
            };
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to search recipes';
            console.error('Error searching recipes:', e);
        } finally {
            loading.value = false;
        }
    };

    // Get recipe recommendations based on ingredients
    const getRecommendations = async (ingredients: string[]) => {
        loading.value = true;
        error.value = null;
        try {
            const data = await $fetch<Recommendation[]>(`${baseUrl}/recipes/recommendations`, {
                method: 'POST',
                body: { ingredients },
            });
            recommendations.value = data;
            return data;
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to get recommendations';
            console.error('Error getting recommendations:', e);
            return [];
        } finally {
            loading.value = false;
        }
    };




    return {
        // State
        recipes,
        recipe,
        recommendations,
        loading,
        error,
        pagination,
        bakedRecipes,
        // Methods
        fetchRecipes,
        getRecipeById,
        searchRecipes,
        getRecommendations,
    };
};

