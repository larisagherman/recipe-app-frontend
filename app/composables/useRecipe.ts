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

    // Fetch user's baked recipes from backend
    const fetchBakedRecipes = async () => {
        try {
            const { $user } = useNuxtApp();
            if (!$user?.value?.userId) {
                return; // User not logged in or userId not available
            }
            const userId = $user.value.id;
            const data = await $fetch<Array<{ recipeId: number }>>(`${baseUrl}/user-recipe-logs/user/${userId}`);

            // Extract recipe IDs and store in Set
            bakedRecipes.value = new Set(data.map(log => log.recipeId));
        } catch (e: unknown) {
            console.error('Error fetching baked recipes:', e);
        }
    };

    // Initialize - fetch recipes on composable use
    if (recipes.value.length === 0) {
        fetchRecipes();
    }

    // Initialize - fetch baked recipes on client side
    if (process.client) {
        fetchBakedRecipes();
    }

    // Toggle baked status for a recipe
    const toggleBakedRecipe = async (recipeId: number) => {
        const wasBaked = bakedRecipes.value.has(recipeId);
        const { $user } = useNuxtApp();

        if (!$user?.value?.userId) {
            console.error('User not logged in or userId not available');
            return;
        }

        const userId = $user.value.userId;

        try {
            if (wasBaked) {
                // Remove from baked recipes - DELETE request
                await $fetch(`${baseUrl}/user-recipe-logs/${userId}/${recipeId}`, {
                    method: 'DELETE'
                });
                bakedRecipes.value.delete(recipeId);
                console.log('Recipe removed from baked list');
            } else {
                // Add to baked recipes - POST request
                await $fetch(`${baseUrl}/user-recipe-logs`, {
                    method: 'POST',
                    body: {
                        userId: userId,
                        recipeId: recipeId,
                        rating: null,
                        cookedAt: new Date().toISOString(),
                        notes: null
                    }
                });
                bakedRecipes.value.add(recipeId);
                console.log('Recipe saved to backend successfully');
            }
        } catch (e: unknown) {
            console.error('Error toggling recipe baked status:', e);
            // Revert the change if the backend request fails
            if (wasBaked) {
                bakedRecipes.value.add(recipeId);
            } else {
                bakedRecipes.value.delete(recipeId);
            }
        }
    };

    // Check if a recipe is marked as baked
    const isRecipeBaked = (recipeId: number) => {
        return bakedRecipes.value.has(recipeId);
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
        toggleBakedRecipe,
        isRecipeBaked,
        fetchBakedRecipes,
    };
};

