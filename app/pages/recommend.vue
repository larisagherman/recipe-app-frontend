<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { Recommendation } from "~/types/Recommendation";
import type { FullRecipe } from "~/types/fullRecipe";
import { useAuth } from '~/composables/useAuth';
import { useUserRecipeLogs } from '~/composables/useUserRecipeLogs';
import { useRecipe } from '~/composables/useRecipe';
import { useAuthNotification } from '~/composables/useAuthNotification';

const { user } = useAuth();
const { getUserRecipeLogs, isRecipeBaked, toggleUserRecipeLog, getSavedRecipeLogs, isRecipeSaved, toggleSavedRecipeLog } = useUserRecipeLogs();
const { analyzeImage, loading } = useRecipe();
const { isNotificationVisible, notificationMessage, notificationType, showLoginPrompt, hideNotification } = useAuthNotification();

const recommendations = ref<Recommendation[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

const query= ref('')
const forbiddenQuery = ref('')
const topK=ref(12)
const strictMode = ref(false)

const getRecommendation = async () => {
  const parsedQuery = query.value
      .split(/[\n,]/)       // split by comma or new line
      .map(i => i.trim())
      .filter(i => i.length > 0)
  if (parsedQuery.length === 0) {
    alert("Please enter at least one ingredient")
    return
  }

  const parsedForbidden = forbiddenQuery.value
      .split(/[\n,]/)       // split by comma or new line
      .map(i => i.trim())
      .filter(i => i.length > 0)

  recommendations.value=await $fetch('http://localhost:8080/recommend',
      {
        method:'POST',
        body: {
          query: parsedQuery,
          top_k:topK.value,
          strict: strictMode.value,
          forbidden_ingredients: parsedForbidden
        }

      })
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const parsedForbidden = forbiddenQuery.value
      .split(/[\n,]/)
      .map(i => i.trim())
      .filter(i => i.length > 0)

  const result = await analyzeImage(file, topK.value, parsedForbidden, strictMode.value);
  if (result && result.length > 0) {
    recommendations.value = result;
  }
};

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
  if (!user.value?.id) {
    showLoginPrompt('bake');
    return;
  }
  await toggleUserRecipeLog(user.value.id, recipeId);
  // Refetch the logs to update the UI
  await getUserRecipeLogs(user.value.id);
};

const handleSavedClick = async (recipeId: number) => {
  if (!user.value?.id) {
    showLoginPrompt('save');
    return;
  }
  await toggleSavedRecipeLog(user.value.id, recipeId);
  // Refetch the logs to update the UI
  await getSavedRecipeLogs(user.value.id);
};

const handleShowLoginPrompt = (type: 'save' | 'bake') => {
  showLoginPrompt(type);
};
</script>
<template>
  <div class="min-h-screen bg-gradient-to-br from-[#FCE4D6] to-[#F9D7C3]">
    <!-- Auth Prompt Modal -->
    <AuthPromptModal
      :is-visible="isNotificationVisible"
      :message="notificationMessage"
      :type="notificationType"
      @close="hideNotification"
    />

    <!-- Header Section -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-3 text-[#5D3A2D]">
          Find Your Perfect Recipe
        </h1>
        <p class="text-xl text-[#7D4F3E]">
          Tell us what ingredients you have
        </p>
      </div>

      <!-- Main Grid Layout -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Panel - Search Criteria (Sticky) -->
        <div class="lg:col-span-1">
          <div class="sticky top-4 bg-white rounded-2xl shadow-lg p-6 border border-[#E37D4D]/20">
            <!-- Header -->
            <div class="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
              <i class="i-lucide-search w-5 h-5 text-[#E37D4D]"></i>
              <h3 class="text-lg font-bold text-[#5D3A2D]">Search Criteria</h3>
            </div>

            <!-- Ingredients Input -->
            <div class="mb-6">
              <label class="text-base font-semibold text-[#5D3A2D] block mb-2">Your Ingredients</label>
              <input
                v-model="query"
                type="text"
                placeholder="e.g., chocolate, butter, eggs..."
                @keypress.enter="query += (query.endsWith(',') ? '' : ',') + ' '"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#E37D4D] transition-colors text-gray-900 mb-3"
              />
              <p class="text-xs text-[#7D4F3E] mb-3">Separate ingredients with commas or just keep typing</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(ing, idx) in query.split(',').map(i => i.trim()).filter(i => i.length > 0)"
                  :key="idx"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-[#E37D4D] text-white rounded-full text-sm font-medium"
                >
                  {{ ing }}
                  <button
                    @click="query = query.split(',').filter(i => i.trim() !== ing).join(', ').trim()"
                    class="hover:opacity-80 transition-opacity"
                  >
                    <i class="i-lucide-x w-3 h-3"></i>
                  </button>
                </span>
              </div>
            </div>

            <!-- Photo Upload -->
            <div class="mb-6">
              <label class="text-base font-semibold text-[#5D3A2D] block mb-2">Or Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                :disabled="loading"
                class="hidden"
                ref="fileInputRef"
              />
              <button
                @click="fileInputRef?.click()"
                :disabled="loading"
                class="w-full py-3 px-4 border-2 border-dashed border-[#E37D4D] rounded-lg bg-[#FCE4D6]/50 text-[#E37D4D] font-semibold hover:bg-[#FCE4D6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <i class="i-lucide-camera w-4 h-4"></i>
                {{ loading ? 'Analyzing...' : 'Upload Ingredient Photo' }}
              </button>
            </div>

            <!-- Forbidden Ingredients -->
            <div class="mb-6 pb-6 border-b border-gray-200">
              <label class="text-base font-semibold text-[#5D3A2D] block mb-2">Forbidden Ingredients</label>
              <input
                v-model="forbiddenQuery"
                type="text"
                placeholder="e.g., nuts, dairy, gluten..."
                @keypress.enter="forbiddenQuery += (forbiddenQuery.endsWith(',') ? '' : ',') + ' '"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#E37D4D] transition-colors text-gray-900 mb-3"
              />
              <p class="text-xs text-[#7D4F3E] mb-3">Separate ingredients with commas or just keep typing</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(ing, idx) in forbiddenQuery.split(',').map(i => i.trim()).filter(i => i.length > 0)"
                  :key="idx"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium border border-red-300"
                >
                  {{ ing }}
                  <button
                    @click="forbiddenQuery = forbiddenQuery.split(',').filter(i => i.trim() !== ing).join(', ').trim()"
                    class="hover:opacity-80 transition-opacity"
                  >
                    <i class="i-lucide-x w-3 h-3"></i>
                  </button>
                </span>
              </div>
            </div>

            <!-- Strict Mode -->
            <div class="mb-6 pb-6 border-b border-gray-200 p-4 bg-[#FCE4D6]/50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-base font-semibold text-[#5D3A2D] cursor-pointer">
                    Strict Mode
                  </label>
                  <p class="text-sm text-[#7D4F3E] mt-1">
                    Only exact ingredients
                  </p>
                </div>
                <input
                  type="checkbox"
                  v-model="strictMode"
                  class="w-5 h-5 text-[#E37D4D] bg-gray-100 border-gray-300 rounded focus:ring-[#E37D4D] cursor-pointer"
                />
              </div>
            </div>

            <!-- Number of Results -->
            <div class="mb-6">
              <label class="text-base font-semibold text-[#5D3A2D] block mb-3">
                Number of Results: <span class="text-[#E37D4D]">{{ topK }}</span>
              </label>
              <input
                type="range"
                v-model.number="topK"
                :min="1"
                :max="50"
                :style="{ '--value': `${(topK / 50) * 100}%` }"
                class="w-full cursor-pointer"
              />
            </div>

            <!-- Search Button -->
            <button
              @click="getRecommendation"
              class="w-full py-4 bg-gradient-to-r from-[#E37D4D] to-[#D46B3B] text-white font-bold rounded-lg hover:from-[#D46B3B] hover:to-[#C55A2B] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading || query.trim().length === 0"
            >
              <i class="i-lucide-search w-5 h-5"></i>
              {{ loading ? 'Searching...' : 'Find Recipes' }}
            </button>
          </div>
        </div>

        <!-- Right Panel - Results -->
        <div class="lg:col-span-2">
          <!-- Results Header -->
          <div v-if="recommendations.length > 0" class="mb-8">
            <h2 class="text-3xl font-bold text-[#5D3A2D]">
              Your Recipe Matches
              <span class="text-[#E37D4D]">({{ recommendations.length }})</span>
            </h2>
            <p class="text-[#7D4F3E] mt-2">Perfect matches for your ingredients</p>
          </div>

          <!-- Recipe Grid -->
          <div v-if="recommendations.length > 0" class="recipe-grid">
            <div v-for="(recipe, index) in recommendations" :key="recipe.id" class="recipe-grid-item">
              <div class="recipe-number">{{ index + 1 }}</div>
              <CompactRecipeCard
                :recipe="toFullRecipe(recipe)"
                :is-baked="isRecipeBaked(recipe.id)"
                :is-saved="isRecipeSaved(recipe.id)"
                @toggle-baked="handleBakedClick"
                @toggle-saved="handleSavedClick"
                @show-login-prompt="handleShowLoginPrompt"
              />

              <!-- Missing Info -->
              <div v-if="strictMode && (recipe.missing_count || recipe.missing_ingredients?.length)" class="missing-info">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0">
                    <i class="i-lucide-alert-circle w-5 h-5 text-[#E37D4D] mt-0.5"></i>
                  </div>
                  <div class="flex-1">
                    <p v-if="recipe.missing_count" class="text-sm font-bold text-[#5D3A2D] mb-3">
                      Missing {{ recipe.missing_count }} ingredient{{ recipe.missing_count !== 1 ? 's' : '' }}
                    </p>
                    <ul v-if="recipe.missing_ingredients?.length" class="space-y-2">
                      <li v-for="ing in recipe.missing_ingredients" :key="ing" class="flex items-center gap-3 pb-2 border-b border-[#E37D4D]/20 last:border-b-0">
                        <input
                          type="checkbox"
                          :id="`missing-${ing}`"
                          class="w-4 h-4 text-[#E37D4D] bg-white border-2 border-[#E37D4D] rounded cursor-pointer"
                          disabled
                        />
                        <label
                          :for="`missing-${ing}`"
                          class="text-xs text-[#7D4F3E] capitalize font-medium cursor-pointer flex-1"
                        >
                          {{ ing }}
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <i class="i-lucide-search w-16 h-16 text-gray-300 mx-auto mb-4"></i>
            <h3 class="text-2xl font-bold text-[#5D3A2D] mb-2">No recipes yet</h3>
            <p class="text-[#7D4F3E]">Enter your ingredients on the left to get started!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.recipe-number {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #E37D4D, #D46B3B);
  color: white;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(227, 125, 77, 0.3);
}

.missing-info {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #FCE4D6 0%, #FAD1B8 100%);
  border-left: 4px solid #E37D4D;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(227, 125, 77, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.missing-info ul {
  margin: 0.5rem 0 0 0;
  padding-left: 0;
  list-style: none;
}

.missing-info li {
  margin: 0.25rem 0;
  padding: 0.25rem 0;
  color: #9D502B;
  font-weight: 500;
}

/* Range slider styling */
input[type="range"] {
  width: 100%;
  height: 8px;
  background: linear-gradient(to right, #E37D4D 0%, #E37D4D var(--value), #e5e7eb var(--value), #e5e7eb 100%);
  border-radius: 5px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E37D4D, #D46B3B);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(227, 125, 77, 0.4);
  border: 2px solid white;
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(227, 125, 77, 0.6);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E37D4D, #D46B3B);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(227, 125, 77, 0.4);
  border: 2px solid white;
  transition: all 0.2s ease;
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(227, 125, 77, 0.6);
}

input[type="range"]::-moz-range-track {
  background: transparent;
  border: none;
}

input[type="range"]::-moz-range-progress {
  background: linear-gradient(to right, #E37D4D, #D46B3B);
  border-radius: 5px;
  height: 8px;
}

@media (max-width: 1400px) {
  .recipe-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .recipe-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

