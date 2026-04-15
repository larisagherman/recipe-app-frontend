<script setup lang="ts">
import { onMounted, computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useGeneratedRecipe } from '~/composables/useGeneratedRecipe'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const recipeId = Number(route.params.id)
const { recipe, loading, parsedIngredients, parsedDirections, getGeneratedRecipe } = useGeneratedRecipe()
const { user } = useAuth()
const BakeAlongChat = defineAsyncComponent(() => import('~/components/BakeAlongChat.vue'))

onMounted(() => {
  getGeneratedRecipe(recipeId)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 ">

    <!-- Bake Along Chat - Floating Button -->
    <Suspense>
      <template #default>
        <BakeAlongChat
          v-if="user?.id && recipe?.id"
          :recipe-id="recipe.id"
          :user-id="user.id"
          :recipe-name="recipe.name"
        />
      </template>
      <template #fallback>
        <div />
      </template>
    </Suspense>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-16">
      <div class="flex flex-col items-center justify-center gap-4">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
        <p class="text-lg text-gray-600">Loading recipe...</p>
      </div>
    </div>

    <!-- Recipe Content -->
    <div v-else class="max-w-7xl mx-auto px-4 pb-16 pt-8">
      <!-- Hero Section -->
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
        <!-- Recipe Image -->
        <div class="relative h-96 overflow-hidden">
          <div v-if="!recipe?.imgSrc" class="w-full h-full bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 flex items-center justify-center">
            <div class="text-center">
              <img src="https://cdn-icons-png.flaticon.com/512/3081/3081949.png" alt="Recipe" class="w-32 h-32 mx-auto mb-4 opacity-60" />
              <p class="text-amber-800 text-lg font-medium">No image available</p>
            </div>
          </div>
          <img v-else :src="recipe.imgSrc" :alt="recipe.name" class="w-full h-full object-cover" />

          <!-- Overlay gradient -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          <!-- Recipe Title Overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <h1 class="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {{ recipe?.name }}
            </h1>
          </div>
        </div>

        <!-- Recipe Info Grid -->
        <div class="grid md:grid-cols-3 gap-4 p-8 border-b border-gray-200">
          <div v-if="recipe?.prepTime" class="flex items-center gap-3 p-4 bg-white rounded-xl">
            <div class="flex-shrink-0 w-12 h-12 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Prep Time</p>
              <p class="text-lg font-bold text-gray-900">{{ recipe.prepTime }}</p>
            </div>
          </div>

          <div v-if="recipe?.cookTime" class="flex items-center gap-3 p-4 bg-white rounded-xl">
            <div class="flex-shrink-0 w-12 h-12 bg-brand-500 rounded-lg flex items-center justify-center">
              <UIcon name="i-lucide-microwave" class="w-6 h-6 bg-white" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Cook Time</p>
              <p class="text-lg font-bold text-gray-900">{{ recipe.cookTime }}</p>
            </div>
          </div>

          <div v-if="recipe?.servings" class="flex items-center gap-3 p-4 bg-white rounded-xl">
            <div class="flex-shrink-0 w-12 h-12 bg-brand-500 rounded-lg flex items-center justify-center">
              <UIcon name="i-lucide-utensils" class="w-6 h-6 bg-white" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Servings</p>
              <p class="text-lg font-bold text-gray-900">{{ recipe.servings }}</p>
            </div>
          </div>
        </div>

        <!-- Ingredients and Directions -->
        <div class="grid md:grid-cols-2 gap-8 p-8">
          <!-- Ingredients Section -->
          <div>
            <div class="flex items-center gap-3 mb-6 pb-4 pl-4 border-l-4 border-brand-500">
              <h2 class="text-2xl font-bold text-gray-900">Ingredients</h2>
            </div>
            <div class="space-y-2">
              <div
                v-for="(ingredient, index) in parsedIngredients"
                :key="index"
                class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span class="text-brand-500 font-bold mt-0.5 ">•</span>
                <span class="text-gray-700">{{ ingredient }}</span>
              </div>
            </div>
            <div v-if="parsedIngredients.length === 0" class="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
              No ingredients listed
            </div>
          </div>

          <!-- Directions Section -->
          <div>
            <div class="flex items-center gap-3 mb-6 pb-4 pl-4 border-l-4 border-primary-500">
              <h2 class="text-2xl font-bold text-gray-900">Directions</h2>
            </div>

            <div class="space-y-4">
              <div
                v-for="(direction, index) in parsedDirections"
                :key="index"
                class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <p class="text-gray-700 leading-relaxed pt-1">{{ direction }}</p>
              </div>
            </div>
            <div v-if="parsedDirections.length === 0" class="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
              No directions available
            </div>
          </div>
        </div>

        <!-- Nutrition Info -->
        <div v-if="recipe?.nutrition" class="px-8 pb-8">
          <div class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
            <div class="flex items-center gap-3 mb-4">
              <h2 class="text-2xl font-bold text-gray-900">Nutrition Information</h2>
            </div>
            <pre class="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{{ recipe.nutrition }}</pre>
          </div>
        </div>

        <!-- Source Link -->
        <div v-if="recipe?.url" class="px-8 pb-8">
          <a
            :href="recipe.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>View Original Recipe</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #fbbf24;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #f59e0b;
}
</style>





