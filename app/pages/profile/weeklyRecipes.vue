<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useWeeklyRecommendation } from '~/composables/useWeeklyRecommendation';
import { useRecipe } from '~/composables/useRecipe';
import type { FullRecipe } from '~/types/fullRecipe';

const { fetchWeeklyRecommendations, weeklyRecommendations, loading } = useWeeklyRecommendation();
const { user, isLoggedIn } = useAuth();
const { getRecipeById } = useRecipe();
const router = useRouter();

const recipesMap = ref<Map<number, FullRecipe>>(new Map());
const loadingRecipes = ref(false);
const authChecked = ref(false);
const showScrollTop = ref(false);

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
    }
  }, { immediate: true });

  window.addEventListener('scroll', handleScroll);
});

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const fetchRecipeDetails = async () => {
  if (!weeklyRecommendations.value.length) return;

  loadingRecipes.value = true;
  const recipeIds = [...new Set(weeklyRecommendations.value.map(rec => rec.recipe.id))];

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

watch(
  () => user?.value?.id,
  async (id) => {
    if (!id) return;
    await fetchWeeklyRecommendations(id);
    await fetchRecipeDetails();
  },
  { immediate: true }
);

watch(
  () => weeklyRecommendations.value.length,
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

  <!-- Weekly recipes content once auth is checked -->
  <div v-else class="min-h-screen p-6 bg-white">
    <!-- Scroll to Top Button (Dynamic) -->
    <button
      v-if="showScrollTop"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 hover:shadow-xl"
      title="Scroll to top"
    >
      <UIcon name="i-lucide-arrow-up" class="size-5" />
    </button>
    <!-- Back Button (Under Navbar) -->
    <div class="mb-6">
      <NuxtLink
          to="/profile"
          class="inline-flex items-center gap-2 text-primary-700 hover:text-primary-900 font-medium transition-colors"
      >
        <span>←</span>
        <span>Back to Profile</span>
      </NuxtLink>
    </div>
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Your Weekly Recipes</h1>
            <p class="text-gray-600">Your weekly generated recipe recommendations</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-primary-600">{{ weeklyRecommendations.length }}</div>
            <div class="text-sm text-gray-500">Weeks</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading || loadingRecipes" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="text-gray-600 mt-4">Loading your weekly recipes...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!weeklyRecommendations.length" class="text-center py-16">
        <svg class="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3.042.525A9.006 9.006 0 002.25 9m14.25-9h.008v.008h-.008V6.042m0 0A8.966 8.966 0 0012 21c4.478 0 8.268-2.943 9.542-7A9.006 9.006 0 0021.75 9" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">No weekly recipes yet</h2>
        <p class="text-gray-600 mb-6">Your weekly recipe recommendations will appear here.</p>
        <NuxtLink
          to="/generatedRecipe"
          class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-brand-500 text-white hover:bg-brand-600 px-6 py-3"
        >
          Get Recommendations
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Weekly Recipes Grid -->
      <div v-else class="grid gap-6">
        <div
          v-for="weeklyRecipe in weeklyRecommendations"
          :key="weeklyRecipe.id"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
          <div class="flex flex-col md:flex-row">
            <!-- Recipe Image -->
            <div class="md:w-64 h-48 md:h-auto bg-gradient-to-br from-primary-100 to-primary-50 flex-shrink-0">
              <NuxtLink :to="`/generatedRecipe/${weeklyRecipe.recipe.id}`" class="block w-full h-full">
                <img
                  v-if="weeklyRecipe.recipe.imgSrc"
                  :src="weeklyRecipe.recipe.imgSrc"
                  :alt="weeklyRecipe.recipe.name"
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
                    :to="`/generatedRecipe/${weeklyRecipe.recipe.id}`"
                    class="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2 block"
                  >
                    {{ weeklyRecipe.recipe.name }}
                  </NuxtLink>
                  <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Week of {{ new Date(weeklyRecipe.weekStart).toLocaleDateString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Recipe Info -->
              <div class="flex flex-wrap gap-4 mb-4 text-sm">
                <div v-if="weeklyRecipe.recipe.prepTime" class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold">Prep:</span>
                  <span>{{ weeklyRecipe.recipe.prepTime }}</span>
                </div>
                <div v-if="weeklyRecipe.recipe.cookTime" class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold">Cook:</span>
                  <span>{{ weeklyRecipe.recipe.cookTime }}</span>
                </div>
                <div v-if="weeklyRecipe.recipe.servings" class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold">Servings:</span>
                  <span>{{ weeklyRecipe.recipe.servings }}</span>
                </div>
              </div>

              <!-- View Recipe Button -->
              <NuxtLink
                :to="`/generatedRecipe/${weeklyRecipe.recipe.id}`"
                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-150 text-sm"
              >
                View Recipe
              </NuxtLink>

            </div>
          </div>
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

