<script setup lang="ts">
import { watch, ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useUserRecipeLogs } from '~/composables/useUserRecipeLogs';
import { useRecipe } from '~/composables/useRecipe';
import type { FullRecipe } from '~/types/fullRecipe';

const { getUserRecipeLogs, logs, loading } = useUserRecipeLogs();
const { user, isLoggedIn } = useAuth();
const { getRecipeById } = useRecipe();
const router = useRouter();

const recipesMap = ref<Map<number, FullRecipe>>(new Map());
const loadingRecipes = ref(false);
const authChecked = ref(false);

// Wait for auth state to be checked before redirecting
onMounted(() => {
  // Give Firebase time to restore the auth state
  const timeout = setTimeout(() => {
    authChecked.value = true;
    if (!isLoggedIn.value) {
      router.push('/');
    }
  }, 1000); // Wait 1 second for auth to load

  // Also watch for auth changes
  let stopWatch: (() => void) | null = null;
  stopWatch = watch(user, (newUser) => {
    if (newUser) {
      authChecked.value = true;
      clearTimeout(timeout);
      if (stopWatch) stopWatch();
    }
  }, { immediate: true });
});

// Fetch recipe details for each log
const fetchRecipeDetails = async () => {
  if (!logs.value.length) return;

  loadingRecipes.value = true;
  const recipeIds = [...new Set(logs.value.map(log => log.recipeId))];

  for (const recipeId of recipeIds) {
    if (!recipesMap.value.has(recipeId)) {
      const recipe = await getRecipeById(recipeId);
      if (recipe) {
        recipesMap.value.set(recipeId, recipe);
      }
    }
  }
  loadingRecipes.value = false;
};

// Format date to readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Sort logs by date (newest first)
const sortedLogs = computed(() => {
  return [...logs.value].sort((a, b) =>
    new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime()
  );
});

watch(
  () => user?.value?.id,
  async (id) => {
    if (!id) return;
    await getUserRecipeLogs(id);
    await fetchRecipeDetails();
  },
  { immediate: true }
);

watch(
  () => logs.value.length,
  async () => {
    await fetchRecipeDetails();
  }
);
</script>

<template>
  <!-- Loading state while checking auth -->
  <div v-if="!authChecked" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading...</p>
    </div>
  </div>

  <!-- History content once auth is checked -->
  <div v-else class="min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink
          to="/profile"
          class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors"
        >
          <span>←</span>
          <span>Back to Profile</span>
        </NuxtLink>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Your Recipe History</h1>
            <p class="text-gray-600">Track all the delicious recipes you've cooked</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-primary-600">{{ logs.length }}</div>
            <div class="text-sm text-gray-500">Recipes Cooked</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading || loadingRecipes" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="text-gray-600 mt-4">Loading your recipe history...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!logs.length" class="text-center py-16">
        <div class="text-6xl mb-4">🍰</div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">No recipes cooked yet</h2>
        <p class="text-gray-600 mb-6">Start cooking and your history will appear here!</p>
        <NuxtLink
          to="/recommend"
          class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3"
        >
          Find Recipes
          <span>→</span>
        </NuxtLink>
      </div>

      <!-- Recipe History Grid -->
      <div v-else class="grid gap-6">
        <div
          v-for="log in sortedLogs"
          :key="log.id"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
          <div class="flex flex-col md:flex-row">
            <!-- Recipe Image -->
            <div class="md:w-64 h-48 md:h-auto bg-gradient-to-br from-primary-100 to-primary-50 flex-shrink-0">
              <NuxtLink :to="`/recipes/${log.recipeId}`" class="block w-full h-full">
                <img
                  v-if="recipesMap.get(log.recipeId)?.imgSrc"
                  :src="recipesMap.get(log.recipeId)?.imgSrc"
                  :alt="recipesMap.get(log.recipeId)?.name"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                  <img src="https://cdn-icons-png.flaticon.com/512/3081/3081949.png" alt="Cupcake" class="w-20 h-20" />
                  <p class="text-sm text-gray-500 text-center">Image not found</p>
                </div>
              </NuxtLink>
            </div>

            <!-- Recipe Details -->
            <div class="flex-1 p-6">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <NuxtLink
                    :to="`/recipes/${log.recipeId}`"
                    class="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2 block"
                  >
                    {{ recipesMap.get(log.recipeId)?.name || `Recipe #${log.recipeId}` }}
                  </NuxtLink>
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                      <span>🕐</span>
                      <span>{{ formatDate(log.cookedAt) }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span>📅</span>
                      <span>{{ new Date(log.cookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
                    </div>
                  </div>
                </div>
                <div class="ml-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Cooked
                  </span>
                </div>
              </div>

              <!-- Recipe Info -->
              <div v-if="recipesMap.get(log.recipeId)" class="flex flex-wrap gap-4 mb-4 text-sm">
                <div v-if="recipesMap.get(log.recipeId)?.prepTime" class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold">Prep:</span>
                  <span>{{ recipesMap.get(log.recipeId)?.prepTime }}</span>
                </div>
                <div v-if="recipesMap.get(log.recipeId)?.cookTime" class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold">Cook:</span>
                  <span>{{ recipesMap.get(log.recipeId)?.cookTime }}</span>
                </div>
                <div v-if="recipesMap.get(log.recipeId)?.servings" class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold">Servings:</span>
                  <span>{{ recipesMap.get(log.recipeId)?.servings }}</span>
                </div>
              </div>

              <!-- Notes (if exists) -->
              <div v-if="log.notes" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div class="text-xs font-semibold text-amber-900 mb-1">Your Notes:</div>
                <p class="text-sm text-amber-800">{{ log.notes }}</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <NuxtLink
                  :to="`/recipes/${log.recipeId}`"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <span>View Recipe</span>
                  <span>→</span>
                </NuxtLink>
                <button
                  class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <span>❤️</span>
                  <span>Add to Favorites</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="logs.length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
          <div class="text-3xl mb-2">🍽️</div>
          <div class="text-2xl font-bold text-gray-900">{{ logs.length }}</div>
          <div class="text-sm text-gray-600">Total Recipes</div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
          <div class="text-3xl mb-2">📅</div>
          <div class="text-2xl font-bold text-gray-900">
            {{ Math.ceil((new Date().getTime() - new Date(sortedLogs[sortedLogs.length - 1]?.cookedAt).getTime()) / (1000 * 60 * 60 * 24)) }}
          </div>
          <div class="text-sm text-gray-600">Days Cooking</div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
          <div class="text-3xl mb-2">🔥</div>
          <div class="text-2xl font-bold text-gray-900">
            {{ sortedLogs[0] ? formatDate(sortedLogs[0].cookedAt) : 'N/A' }}
          </div>
          <div class="text-sm text-gray-600">Last Cooked</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: fadeIn 0.5s ease-out;
}
</style>

