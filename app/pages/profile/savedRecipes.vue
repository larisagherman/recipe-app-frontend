<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useUserRecipeLogs } from '~/composables/useUserRecipeLogs';
import { useRecipe } from '~/composables/useRecipe';
import type { FullRecipe } from '~/types/fullRecipe';

const { getSavedRecipeLogs, savedRecipes, loading, removeSavedRecipeLog, isRecipeBaked, toggleUserRecipeLog, getUserRecipeLogs } = useUserRecipeLogs();
const { user, isLoggedIn } = useAuth();
const { getRecipeById } = useRecipe();
const router = useRouter();

const recipesMap = ref<Map<number, FullRecipe>>(new Map());
const loadingRecipes = ref(false);
const authChecked = ref(false);
const showScrollTop = ref(false);

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

  // Add scroll listener for scroll-to-top button
  window.addEventListener('scroll', handleScroll);
});

// Handle scroll event to show/hide scroll-to-top button
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

// Scroll to top smoothly
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// ...existing code...


// Fetch recipe details for each saved recipe
const fetchRecipeDetails = async () => {
  if (!savedRecipes.value.length) return;

  loadingRecipes.value = true;
  const recipeIds = [...new Set(savedRecipes.value.map(recipe => recipe.recipeId))];

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


// Handler to unsave a recipe
const handleUnsaveRecipe = async (recipeId: number) => {
  if (!user.value?.id) return;
  const savedRecipe = savedRecipes.value.find(r => r.recipeId === recipeId);
  if (savedRecipe?.id) {
    await removeSavedRecipeLog(savedRecipe.id);
  }
};

// Handler to toggle baked status
const handleToggleBaked = async (recipeId: number) => {
  if (!user.value?.id) return;
  await toggleUserRecipeLog(user.value.id, recipeId);
};

watch(
  () => user?.value?.id,
  async (id) => {
    if (!id) return;
    await getSavedRecipeLogs(id);
    await getUserRecipeLogs(id);
    await fetchRecipeDetails();
  },
  { immediate: true }
);

watch(
  () => savedRecipes.value.length,
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

  <!-- Saved recipes content once auth is checked -->
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
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Your Saved Recipes</h1>
            <p class="text-gray-600">Your collection of favorite recipes to try later</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-primary-600">{{ savedRecipes.length }}</div>
            <div class="text-sm text-gray-500">Recipes Saved</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading || loadingRecipes" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="text-gray-600 mt-4">Loading your saved recipes...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!savedRecipes.length" class="text-center py-16">
        <div class="text-6xl mb-4">📚</div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">No saved recipes yet</h2>
        <p class="text-gray-600 mb-6">Start saving your favorite recipes to build your collection!</p>
        <NuxtLink
          to="/recipes"
          class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3"
        >
          Browse Recipes
          <span>→</span>
        </NuxtLink>
      </div>

      <!-- Saved Recipes Grid -->
      <div v-else class="grid gap-6">
        <div
          v-for="savedRecipe in savedRecipes"
          :key="savedRecipe.id"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
          <div class="flex flex-col md:flex-row">
            <!-- Recipe Image -->
            <div class="md:w-64 h-48 md:h-auto bg-gradient-to-br from-primary-100 to-primary-50 flex-shrink-0">
              <NuxtLink :to="`/recipes/${savedRecipe.recipeId}`" class="block w-full h-full">
                <img
                  v-if="recipesMap.get(savedRecipe.recipeId)?.imgSrc"
                  :src="recipesMap.get(savedRecipe.recipeId)?.imgSrc"
                  :alt="recipesMap.get(savedRecipe.recipeId)?.name"
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
                    :to="`/recipes/${savedRecipe.recipeId}`"
                    class="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2 block"
                  >
                    {{ recipesMap.get(savedRecipe.recipeId)?.name || `Recipe #${savedRecipe.recipeId}` }}
                  </NuxtLink>
                </div>
                <div class="ml-4 flex gap-2">
                  <!-- Unsave Button -->
                  <button
                    @click="handleUnsaveRecipe(savedRecipe.recipeId)"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                    title="Remove from saved"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                      <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    Unsave
                  </button>

                  <!-- Baked Toggle Button -->
                  <button
                    @click="handleToggleBaked(savedRecipe.recipeId)"
                    :class="['inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors', isRecipeBaked(savedRecipe.recipeId) ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200']"
                    :title="isRecipeBaked(savedRecipe.recipeId) ? 'Mark as not baked' : 'Mark as baked'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.003-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                    {{ isRecipeBaked(savedRecipe.recipeId) ? 'Baked!' : 'Mark Baked' }}
                  </button>
                </div>
              </div>

              <!-- Recipe Info -->
              <div v-if="recipesMap.get(savedRecipe.recipeId)" class="flex flex-wrap gap-4 mb-4 text-sm">
                <div v-if="recipesMap.get(savedRecipe.recipeId)?.prepTime" class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold">Prep:</span>
                  <span>{{ recipesMap.get(savedRecipe.recipeId)?.prepTime }}</span>
                </div>
                <div v-if="recipesMap.get(savedRecipe.recipeId)?.cookTime" class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold">Cook:</span>
                  <span>{{ recipesMap.get(savedRecipe.recipeId)?.cookTime }}</span>
                </div>
                <div v-if="recipesMap.get(savedRecipe.recipeId)?.servings" class="flex items-center gap-2 text-gray-600">
                  <span class="font-semibold">Servings:</span>
                  <span>{{ recipesMap.get(savedRecipe.recipeId)?.servings }}</span>
                </div>
              </div>

              <!-- Notes (if exists) -->
              <div v-if="savedRecipe.notes" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="text-xs font-semibold text-blue-900 mb-1">Your Notes:</div>
                <p class="text-sm text-blue-800">{{ savedRecipe.notes }}</p>
              </div>

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

