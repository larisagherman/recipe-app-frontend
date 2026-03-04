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
            console.log('Fetching recipes from:', `${baseUrl}/recipes/page?page=${page}&size=${size}`);
            const data = await $fetch<any>(`${baseUrl}/recipes/page`, {
                params: { page, size },
            });
            console.log('Received data:', data);

            // Handle different response structures
            if (data && data.content) {
                recipes.value = data.content;
                pagination.value = {
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0,
                    currentPage: data.page !== undefined ? data.page : (data.number || 0),
                    size: data.size || size,
                };
            } else if (Array.isArray(data)) {
                // If backend returns array directly
                recipes.value = data;
                pagination.value = {
                    totalPages: 1,
                    totalElements: data.length,
                    currentPage: 0,
                    size: data.length,
                };
            } else {
                console.error('Unexpected response structure:', data);
                error.value = 'Unexpected response structure from server';
            }
        } catch (e: any) {
            console.error('Error fetching recipes:', e);
            error.value = e?.message || e?.data?.message || 'Failed to fetch recipes';

            // Log more details about the error
            if (e?.response) {
                console.error('Response status:', e.response.status);
                console.error('Response data:', e.response._data);
            }
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

    // Analyze image with Gemini
    const analyzeImage = async (
        file: File,
        topK: number = 10,
        forbiddenIngredients: string[] = [],
        strict: boolean = false
    ) => {
        loading.value = true;
        error.value = null;
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Build query params
            const params: Record<string, any> = {
                topK: topK,
                strict: strict
            };

            // Only add forbiddenIngredients if not empty
            if (forbiddenIngredients.length > 0) {
                params.forbiddenIngredients = forbiddenIngredients;
            }

            const data = await $fetch<Recommendation[]>(`${baseUrl}/gemini/analyze`, {
                method: 'POST',
                body: formData,
                params: params,
            });
            recommendations.value = data;
            return data;
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to analyze image';
            console.error('Error analyzing image:', e);
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
        analyzeImage,
    };
};

