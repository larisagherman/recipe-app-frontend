<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { usePreferences } from '~/composables/usePreferences';
import { useUserRecipeLogs } from '~/composables/useUserRecipeLogs';
import { useRecipe } from '~/composables/useRecipe';
import type { FullRecipe } from '~/types/fullRecipe';

const { user, isLoggedIn, logout } = useAuth();
const { preferences, fetchPreferences, loading: preferencesLoading } = usePreferences();
const { getUserRecipeLogs, logs, loading: logsLoading, getSavedRecipeLogs, savedRecipes } = useUserRecipeLogs();
const { getRecipeById } = useRecipe();
const router = useRouter();
const authChecked = ref(false);

// Recipe details maps
const historyRecipesMap = ref<Map<number, FullRecipe>>(new Map());
const savedRecipesMap = ref<Map<number, FullRecipe>>(new Map());
const loadingHistoryRecipes = ref(false);
const loadingSavedRecipes = ref(false);

// Wait for auth state to be checked before redirecting
onMounted(() => {
  const timeout = setTimeout(() => {
    authChecked.value = true;
    if (!isLoggedIn.value) {
      router.push('/');
    }
  }, 1000);

  let stopWatch: (() => void) | null = null;
  stopWatch = watch(user, (newUser) => {
    if (newUser) {
      authChecked.value = true;
      clearTimeout(timeout);
      if (stopWatch) stopWatch();
      if (newUser?.id) {
        fetchPreferences(newUser.id);
        getUserRecipeLogs(newUser.id);
        getSavedRecipeLogs(newUser.id);
      }
    }
  }, { immediate: true });
});

// Fetch recipe details for history
const fetchHistoryRecipeDetails = async () => {
  if (!logs.value.length) return;
  loadingHistoryRecipes.value = true;
  const recipeIds = [...new Set(logs.value.map(log => log.recipeId))];

  for (const recipeId of recipeIds) {
    if (!historyRecipesMap.value.has(recipeId)) {
      const recipe = await getRecipeById(recipeId);
      if (recipe) {
        historyRecipesMap.value.set(recipeId, recipe);
      }
    }
  }
  loadingHistoryRecipes.value = false;
};

// Fetch recipe details for saved recipes
const fetchSavedRecipeDetails = async () => {
  if (!savedRecipes.value.length) return;
  loadingSavedRecipes.value = true;
  const recipeIds = [...new Set(savedRecipes.value.map(recipe => recipe.recipeId))];

  for (const recipeId of recipeIds) {
    if (!savedRecipesMap.value.has(recipeId)) {
      const recipe = await getRecipeById(recipeId);
      if (recipe) {
        savedRecipesMap.value.set(recipeId, recipe);
      }
    }
  }
  loadingSavedRecipes.value = false;
};

// Watch for logs changes and fetch recipe details
watch(() => logs.value.length, async () => {
  if (logs.value.length > 0) {
    await fetchHistoryRecipeDetails();
  }
});

// Watch for saved recipes changes and fetch recipe details
watch(() => savedRecipes.value.length, async () => {
  if (savedRecipes.value.length > 0) {
    await fetchSavedRecipeDetails();
  }
});

// Computed properties for recent items (sorted by latest first)
const recentHistoryItems = computed(() => {
  return logs.value.slice().reverse().slice(0, 3);
});

const recentSavedRecipes = computed(() => {
  return savedRecipes.value.slice().reverse().slice(0, 4);
});

// Helper to get recipe image with fallback
const getRecipeImage = (recipe: FullRecipe | undefined) => {
  if (!recipe) return undefined;
  return recipe.imgSrc || undefined;
};

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<template>
  <!-- Loading state while checking auth -->
  <div v-if="!authChecked" class="min-h-screen flex items-center justify-center bg-white">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading...</p>
    </div>
  </div>

  <!-- Profile content once auth is checked -->
  <div v-else class="min-h-screen bg-primary-50">
    <div class="max-w-7xl mx-auto p-4 md:p-8">
      <!-- Header -->
      <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl shadow-lg p-8 mb-8 border border-primary-300">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold text-primary-950">{{ user?.name || 'User' }}</h1>
            <p class="text-primary-800 text-lg mt-2">{{ user?.email }}</p>
          </div>
          <button
            @click="logout"
            class="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-100 transition-all duration-150 shadow-md hover:shadow-lg border border-primary-300"
          >
            Log Out
          </button>
        </div>
      </div>

      <!-- Main Grid: Left Preferences + Right Dashboard -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Left Column: Preferences (wider) -->
        <div class="lg:col-span-2">
          <!-- Preferences Section -->
          <div v-if="preferences && !preferencesLoading" class="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-primary-700">
            <div class="flex items-start justify-between mb-8">
              <h2 class="text-3xl font-bold text-primary-950">Your Preferences</h2>
              <NuxtLink
                to="/profile/preferences"
                class="px-4 py-2 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 transition-all duration-150 shadow-md hover:shadow-lg text-sm"
              >
                Edit
              </NuxtLink>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Dietary Types Card -->
              <div v-if="preferences.dietaryTypes?.length" class="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border-2 border-emerald-300 hover:border-emerald-400 transition-all">
                <h3 class="font-bold text-emerald-900 mb-4 text-base">Dietary Types</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="type in preferences.dietaryTypes"
                    :key="type"
                    class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-300"
                  >
                    {{ type }}
                  </span>
                </div>
              </div>

              <!-- Allergies Card -->
              <div v-if="preferences.allergies?.length" class="bg-gradient-to-br from-rose-50 to-white rounded-xl p-5 border-2 border-rose-300 hover:border-rose-400 transition-all">
                <h3 class="font-bold text-rose-900 mb-4 text-base">Allergies</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="allergy in preferences.allergies"
                    :key="allergy"
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold border',
                      preferences.severeAllergies?.includes(allergy)
                        ? 'bg-rose-200 text-rose-900 border-rose-400'
                        : 'bg-rose-100 text-rose-700 border-rose-300'
                    ]"
                  >
                    {{ allergy }}{{ preferences.severeAllergies?.includes(allergy) ? ' •' : '' }}
                  </span>
                </div>
              </div>

              <!-- Sweetness Level Card -->
              <div v-if="preferences.tastePreferences" class="bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border-2 border-amber-300 hover:border-amber-400 transition-all">
                <h3 class="font-bold text-amber-900 mb-4 text-base">Sweetness Level</h3>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold border border-amber-300">
                    {{ preferences.tastePreferences === 'notsweet' ? 'Not Sweet'
                        : preferences.tastePreferences === 'mildlysweet' ? 'Mildly Sweet'
                        : preferences.tastePreferences === 'medium' ? 'Medium'
                        : 'Very Sweet' }}
                  </span>
                </div>
              </div>

              <!-- Disliked Ingredients Card -->
              <div v-if="preferences.dislikedIngredients?.length" class="bg-gradient-to-br from-orange-50 to-white rounded-xl p-5 border-2 border-orange-300 hover:border-orange-400 transition-all">
                <h3 class="font-bold text-orange-900 mb-4 text-base">Disliked Ingredients</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="ingredient in preferences.dislikedIngredients"
                    :key="ingredient"
                    class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-300"
                  >
                    {{ ingredient }}
                  </span>
                </div>
              </div>

              <!-- Flavor Preferences Card -->
              <div v-if="preferences.flavourPreferences?.length" class="bg-gradient-to-br from-violet-50 to-white rounded-xl p-5 border-2 border-violet-300 hover:border-violet-400 transition-all md:col-span-2">
                <h3 class="font-bold text-violet-900 mb-4 text-base">Flavor Profiles</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="flavor in preferences.flavourPreferences"
                    :key="flavor"
                    class="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold border border-violet-300"
                  >
                    {{ flavor }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading preferences -->
          <div v-else-if="preferencesLoading" class="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading your preferences...</p>
          </div>

          <!-- No preferences set -->
          <div v-else class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl shadow-lg border-2 border-primary-300 p-8 text-center">
            <h3 class="text-2xl font-bold text-primary-950 mb-2">Set Your Preferences</h3>
            <p class="text-primary-900 mb-6">Customize your recipe recommendations to match your lifestyle and taste</p>
            <NuxtLink
              to="/profile/preferences"
              class="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 shadow-md hover:shadow-lg bg-primary-700 text-white hover:bg-primary-800 px-8 py-4"
            >
              Create Your Preferences
            </NuxtLink>
          </div>
        </div>

        <!-- Right Column: Quick Stats Dashboard -->
        <div class="space-y-6">
          <!-- History Stats Card -->
          <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl shadow-lg border border-primary-300 p-6 hover:shadow-xl transition-all">
            <h3 class="text-lg font-bold text-primary-950 mb-4">Baking History</h3>
            <p class="text-4xl font-bold text-primary-700 mb-2">{{ logs.length }}</p>
            <p class="text-primary-900 text-sm mb-4">recipes in your history</p>
            <NuxtLink
              to="/profile/history"
              class="w-full px-4 py-2 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 transition-all duration-150 text-center text-sm"
            >
              View Full History
            </NuxtLink>
          </div>

          <!-- Saved Recipes Stats Card -->
          <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl shadow-lg border border-primary-300 p-6 hover:shadow-xl transition-all">
            <h3 class="text-lg font-bold text-primary-950 mb-4">Saved Recipes</h3>
            <p class="text-4xl font-bold text-primary-700 mb-2">{{ savedRecipes.length }}</p>
            <p class="text-primary-900 text-sm mb-4">recipes saved</p>
            <NuxtLink
              to="/profile/savedRecipes"
              class="w-full px-4 py-2 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 transition-all duration-150 text-center text-sm"
            >
              View All Saved
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Recent History Section -->
      <div v-if="recentHistoryItems.length > 0" class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-primary-950">Recent History</h2>
          <NuxtLink to="/profile/history" class="text-primary-700 font-semibold hover:text-primary-800">View All</NuxtLink>
        </div>

        <div v-if="loadingHistoryRecipes" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto"></div>
        </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="(historyItem, idx) in recentHistoryItems"
              :key="idx"
              class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-150 overflow-hidden border-t-4 border-primary-700"
            >
              <div v-if="historyRecipesMap.get(historyItem.recipeId)" class="h-full flex flex-col">
                <div v-if="!getRecipeImage(historyRecipesMap.get(historyItem.recipeId))" class="h-40 bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center overflow-hidden">
                  <div class="flex flex-col items-center gap-2">
                    <img src="https://cdn-icons-png.flaticon.com/512/3081/3081949.png" alt="Cupcake" class="w-20 h-20 object-contain" />
                    <p class="text-xs font-semibold text-yellow-700">Image not found</p>
                  </div>
                </div>
                <img v-else :src="getRecipeImage(historyRecipesMap.get(historyItem.recipeId))" :alt="historyRecipesMap.get(historyItem.recipeId)?.name" class="w-full h-40 object-cover" />
                <div class="p-4 flex-grow flex flex-col">
                  <h3 class="font-bold text-primary-950 mb-2 line-clamp-2">{{ historyRecipesMap.get(historyItem.recipeId)?.name }}</h3>
                  <p class="text-sm text-primary-700 mb-4">{{ formatDate(historyItem.cookedAt) }}</p>
                  <NuxtLink
                    :to="`/recipes/${historyItem.recipeId}`"
                    class="mt-auto px-4 py-2 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 transition-all duration-150 text-center text-sm"
                  >
                    View Recipe
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
      </div>

      <!-- Recent Saved Recipes Section -->
      <div v-if="recentSavedRecipes.length > 0" class="mb-32">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-primary-950">Saved Recipes</h2>
          <NuxtLink to="/profile/savedRecipes" class="text-primary-700 font-semibold hover:text-primary-800">View All</NuxtLink>
        </div>

        <div v-if="loadingSavedRecipes" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto"></div>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div
            v-for="(savedItem, idx) in recentSavedRecipes"
            :key="idx"
            class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-150 overflow-hidden border-t-4 border-primary-700"
          >
            <div v-if="savedRecipesMap.get(savedItem.recipeId)" class="h-full flex flex-col">
              <div v-if="!getRecipeImage(savedRecipesMap.get(savedItem.recipeId))" class="h-40 bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center overflow-hidden">
                <div class="flex flex-col items-center gap-2">
                  <img src="https://cdn-icons-png.flaticon.com/512/3081/3081949.png" alt="Cupcake" class="w-20 h-20 object-contain" />
                  <p class="text-xs font-semibold text-yellow-700">Image not found</p>
                </div>
              </div>
              <img v-else :src="getRecipeImage(savedRecipesMap.get(savedItem.recipeId))" :alt="savedRecipesMap.get(savedItem.recipeId)?.name" class="w-full h-40 object-cover" />
              <div class="p-4 flex-grow flex flex-col">
                <h3 class="font-bold text-primary-950 mb-2 line-clamp-2">{{ savedRecipesMap.get(savedItem.recipeId)?.name }}</h3>
                <NuxtLink
                  :to="`/recipes/${savedItem.recipeId}`"
                  class="mt-auto px-4 py-2 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 transition-all duration-150 text-center text-sm"
                >
                  View Recipe
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State Message -->
      <div v-if="recentHistoryItems.length === 0 && recentSavedRecipes.length === 0 && !logsLoading" class="bg-white rounded-2xl shadow-lg border-t-4 border-primary-700 p-12 text-center mb-32">
        <h3 class="text-2xl font-bold text-primary-950 mb-4">Welcome to Your Profile</h3>
        <p class="text-primary-900 mb-8 max-w-md mx-auto">
          Start exploring recipes to see your history and save your favorite recipes here
        </p>
        <NuxtLink
          to="/recipes"
          class="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 shadow-md hover:shadow-lg bg-primary-700 text-white hover:bg-primary-800 px-8 py-4"
        >
          Explore Recipes
        </NuxtLink>
      </div>
    </div>
  </div>
</template>




