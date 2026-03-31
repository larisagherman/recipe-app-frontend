<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { Recommendation } from "~/types/Recommendation";
import type { FullRecipe } from "~/types/fullRecipe";
import { useAuth } from '~/composables/useAuth';
import { useUserRecipeLogs } from '~/composables/useUserRecipeLogs';
import { useRecipe } from '~/composables/useRecipe';

const { user } = useAuth();
const { getUserRecipeLogs, isRecipeBaked, toggleUserRecipeLog, getSavedRecipeLogs, isRecipeSaved, toggleSavedRecipeLog } = useUserRecipeLogs();
const { analyzeImage, loading } = useRecipe();

const recommendations = ref<Recommendation[]>([])

const query= ref('')
const topK=ref(12)
const strictMode = ref(false)
const forbiddenIngredients = ref<string[]>([])
const getRecommendation = async () => {
  const parsedQuery = query.value
      .split(/[\n,]/)       // split by comma or new line
      .map(i => i.trim())
      .filter(i => i.length > 0)
  if (parsedQuery.length === 0) {
    alert("Please enter at least one ingredient")
    return
  }
  recommendations.value=await $fetch('http://localhost:8080/recommend',
      {
        method:'POST',
        body: {
          query: parsedQuery,
          top_k:topK.value,
          strict: strictMode.value,
          forbidden_ingredients: forbiddenIngredients.value
        }

      })
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const result = await analyzeImage(file, topK.value, forbiddenIngredients.value, strictMode.value);
  if (result && result.length > 0) {
    recommendations.value = result;
  }
};

const allIngredients = [
  "cinnamon",
  "sugar",
  "salt",
  "milk",
  "eggs",
  "flour",
  "butter",
  "chocolate"
]

const toFullRecipe = (recipe: Recommendation): FullRecipe => ({
  id: recipe.id,
  name: recipe.name,
  ingredients: recipe.ingredients,
  imgSrc: recipe.img_src ?? "",
  directions: "",
  nutrition: "",
  prepTime: "",
  cookTime: "",
  totalTime: "",
  servings: "",
  url: "",
});

watchEffect(() => {
  if (user.value?.id) {
    getUserRecipeLogs(user.value.id);
    getSavedRecipeLogs(user.value.id);
  }
})

const handleBakedClick = async (recipeId: number) => {
  if (!user.value?.id) return;
  await toggleUserRecipeLog(user.value.id, recipeId);
};

const handleSavedClick = async (recipeId: number) => {
  if (!user.value?.id) return;
  await toggleSavedRecipeLog(user.value.id, recipeId);
};
</script>
<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
    <!-- Hero Section -->
    <div class="max-w-6xl mx-auto px-4 py-12">
      <div class="text-center mb-8">
        <h1 class="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Recipe Recommendations
        </h1>
        <p class="text-lg text-gray-600">
          Tell us what you have, and we'll find the perfect recipes for you!
        </p>
      </div>

      <!-- Search Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <!-- Input Methods -->
        <div class="max-w-3xl mx-auto mb-6">
          <!-- Text Input - Centered -->
          <div class="space-y-2 mb-6">
            <label class="flex items-center justify-center gap-2 text-lg font-semibold text-gray-700">
              Type Your Ingredients:
            </label>
            <UTextarea
              v-model="query"
              class="w-full min-h-[140px] text-center"
              placeholder="chocolate, butter, eggs, flour..."
            />
            <p class="text-xs text-gray-500 text-center"> Separate ingredients with commas or new lines</p>
          </div>

          <!-- Alternative Options - Below Text Input -->
          <div class="pt-4 border-t border-gray-200">
            <p class="text-center text-sm text-gray-600 mb-4 font-medium">Or use alternative input methods:</p>

            <div class="grid md:grid-cols-2 gap-4">
              <!-- Image Upload -->
              <div class="space-y-2">
                <label for="image-upload" class="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                  <span class="text-xl">📸</span>
                  Upload an Image
                </label>
                <div class="relative">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    :disabled="loading"
                    class="block w-full text-sm text-gray-900 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 focus:outline-none focus:border-orange-400 transition-all file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-500 file:to-amber-500 file:text-white hover:file:from-orange-600 hover:file:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div v-if="loading" class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                    <div class="flex flex-col items-center gap-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      <span class="text-sm font-medium text-gray-700">Analyzing image...</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Voice Input Placeholder -->
              <div class="space-y-2">
                <label class="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                  <span class="text-xl">🎤</span>
                  Voice Input
                </label>
                <button
                  disabled
                  class="w-full py-3 px-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 text-sm font-semibold cursor-not-allowed opacity-60"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Row -->
        <div class="grid md:grid-cols-3 gap-6 mb-6 pt-6 border-t border-gray-100">
          <!-- Forbidden Ingredients -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
              Forbidden Ingredients
            </label>
            <div class="bg-gray-50 rounded-lg p-3 space-y-2 max-h-[140px] overflow-y-auto">
              <div
                  v-for="ing in allIngredients"
                  :key="ing"
                  class="flex items-center gap-2"
              >
                <input
                    type="checkbox"
                    :id="`forbidden-${ing}`"
                    :value="ing"
                    v-model="forbiddenIngredients"
                    class="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                />
                <label
                    :for="`forbidden-${ing}`"
                    class="text-sm text-gray-700 cursor-pointer capitalize"
                >
                  {{ ing }}
                </label>
              </div>
            </div>
            <p class="text-xs text-gray-500">Select ingredients to exclude</p>
          </div>

          <!-- Strict Mode -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
              Search Mode
            </label>
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg h-[140px]">
              <input
                  type="checkbox"
                  id="strict"
                  v-model="strictMode"
                  class="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
              />
              <label for="strict" class="text-sm text-gray-700 cursor-pointer">
                Strict Mode
                <span class="block text-xs text-gray-500">Only exact matches</span>
              </label>
            </div>
            <p class="text-xs text-gray-500">&nbsp;</p>
          </div>

          <!-- Number of Results -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
              Number of Results
            </label>
            <div class="bg-gray-50 rounded-lg p-3 h-[140px] flex items-center">
              <UInputNumber v-model="topK" class="w-full" :min="1" :max="50"/>
            </div>
            <p class="text-xs text-gray-500">&nbsp;</p>
          </div>
        </div>





        <!-- Search Button -->
        <div class="flex justify-center">
          <button
            @click="getRecommendation"
            :disabled="loading"
            class="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 text-lg"
          >
            Find My Recipes
          </button>
        </div>
      </div>

      <!-- Results Section -->
      <div v-if="recommendations.length > 0" class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-gray-900">
            Your Recipe Matches
            <span class="text-orange-600">({{ recommendations.length }})</span>
          </h2>
        </div>

        <!-- Recipe Results Grid -->
        <div class="recipe-grid">
          <div v-for="(recipe, index) in recommendations" :key="recipe.id" class="recipe-grid-item">
            <CompactRecipeCard
              :recipe="toFullRecipe(recipe)"
              :is-baked="isRecipeBaked(recipe.id)"
              :is-saved="isRecipeSaved(recipe.id)"
              :recipe-number="index + 1"
              @toggle-baked="handleBakedClick"
              @toggle-saved="handleSavedClick"
            />

            <div v-if="strictMode && (recipe.missing_count || recipe.missing_ingredients?.length)" class="missing-info">
              <p v-if="recipe.missing_count" class="text-pink-700 text-xs font-semibold">
                Missing: {{ recipe.missing_count }} ingredient(s)
              </p>

              <ul v-if="recipe.missing_ingredients?.length" class="text-xs">
                <li v-for="ing in recipe.missing_ingredients" :key="ing">
                  🛒 {{ ing }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <h3 class="text-2xl font-semibold text-gray-700 mb-2">No recipes yet</h3>
        <p class="text-gray-500">Enter your ingredients above to get started!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  padding: 0;
}

.recipe-grid-item {
  position: relative;
  transition: transform 0.2s ease;
}

.recipe-grid-item:hover {
  transform: translateY(-4px);
}

.missing-info {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%);
  border: 2px solid #fecaca;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.missing-info ul {
  margin: 0.5rem 0 0 0;
  padding-left: 0;
  list-style: none;
}

.missing-info li {
  margin: 0.25rem 0;
  padding: 0.25rem 0;
  color: #991b1b;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .recipe-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .recipe-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

