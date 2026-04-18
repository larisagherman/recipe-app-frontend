<script setup lang="ts">
import { onMounted, computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useUserRecipeLogs } from '~/composables/useUserRecipeLogs'

const { recipe, getRecipeById } = useRecipe()
const { user } = useAuth()
const { getUserRecipeLogs, isRecipeBaked, toggleUserRecipeLog, getSavedRecipeLogs, isRecipeSaved, toggleSavedRecipeLog } = useUserRecipeLogs()
const route = useRoute()
const recipeId = Number(route.params.id)
const BakeAlongChat = defineAsyncComponent(() => import('~/components/BakeAlongChat.vue'))
onMounted(() => {
  getRecipeById(recipeId)
  if (user.value?.id) {
    getUserRecipeLogs(user.value.id)
    getSavedRecipeLogs(user.value.id)
  }
})

const handleBakedToggle = async () => {
  if (!user.value?.id) return
  await toggleUserRecipeLog(user.value.id, recipeId)
}

const handleSavedToggle = async () => {
  if (!user.value?.id) return
  await toggleSavedRecipeLog(user.value.id, recipeId)
}

const isBaked = computed(() => isRecipeBaked(recipeId))
const isSaved = computed(() => isRecipeSaved(recipeId))

const ingredientsList = computed(() => {
  if (!recipe.value?.ingredients) return []
  return recipe.value.ingredients
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.trim())
})

const directionsList = computed(() => {
  if (!recipe.value?.directions) return []
  return recipe.value.directions
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.trim())
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">

    <!-- Bake Along Chat - Floating Button -->
    <Suspense>
      <template #default>
        <BakeAlongChat
          v-if="user?.id && recipe?.id"
          :recipe-id="recipe.id"
          :user-id="user.id"
          :recipe-name="recipe.name"
          :is-generated="false"
        />
      </template>
      <template #fallback>
        <div />
      </template>
    </Suspense>

    <!-- Loading State -->
    <div v-if="!recipe" class="max-w-7xl mx-auto px-4 py-16">
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
          <div v-if="!recipe.imgSrc" class="w-full h-full bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 flex items-center justify-center">
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
              {{ recipe.name }}
            </h1>
          </div>

          <!-- Baked and Save Buttons - Top Right -->
          <div v-if="user" class="absolute top-6 right-6 flex gap-3">
            <!-- Baked Button -->
            <button
                @click="handleBakedToggle"
                :class="[
                'flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg',
                isBaked
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.003-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <span>{{ isBaked ? 'Baked!' : 'Mark as Baked' }}</span>
            </button>
            <!-- Save Button -->
            <button
              @click="handleSavedToggle"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg',
                isSaved
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
              <span>{{ isSaved ? 'Saved!' : 'Mark as Save' }}</span>
            </button>


          </div>
        </div>

        <!-- Recipe Info Grid -->
        <div class="grid md:grid-cols-3 gap-4 p-8 border-b border-gray-200">
          <div v-if="recipe.prepTime" class="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
            <div class="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">⏱️</span>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Prep Time</p>
              <p class="text-lg font-bold text-gray-900">{{ recipe.prepTime }}</p>
            </div>
          </div>

          <div v-if="recipe.cookTime" class="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
            <div class="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">🔥</span>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Cook Time</p>
              <p class="text-lg font-bold text-gray-900">{{ recipe.cookTime }}</p>
            </div>
          </div>

          <div v-if="recipe.servings" class="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
            <div class="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">🍽️</span>
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
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span class="text-2xl">🥕</span>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">Ingredients</h2>
            </div>
            <div class="space-y-2">
              <div
                v-for="(ingredient, index) in ingredientsList"
                :key="index"
                class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <span class="text-orange-600 font-bold mt-0.5">•</span>
                <span class="text-gray-700">{{ ingredient }}</span>
              </div>
            </div>
            <div v-if="ingredientsList.length === 0" class="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
              No ingredients listed
            </div>
          </div>

          <!-- Directions Section -->
          <div>
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span class="text-2xl">👨‍🍳</span>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">Directions</h2>
            </div>
            <div class="space-y-4">
              <div
                v-for="(direction, index) in directionsList"
                :key="index"
                class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <p class="text-gray-700 leading-relaxed pt-1">{{ direction }}</p>
              </div>
            </div>
            <div v-if="directionsList.length === 0" class="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
              No directions available
            </div>
          </div>
        </div>

        <!-- Nutrition Info -->
        <div v-if="recipe.nutrition" class="px-8 pb-8">
          <div class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span class="text-2xl">📊</span>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">Nutrition Information</h2>
            </div>
            <pre class="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{{ recipe.nutrition }}</pre>
          </div>
        </div>

        <!-- Source Link -->
        <div v-if="recipe.url" class="px-8 pb-8">
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
