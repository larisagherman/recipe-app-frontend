<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { Recommendation } from "~/types/Recommendation";
import type { FullRecipe } from "~/types/fullRecipe";
import { useAuth } from '~/composables/useAuth';
import { useUserRecipeLogs } from '~/composables/useUserRecipeLogs';
import { useRecipe } from '~/composables/useRecipe';

const { isLoggedIn, user } = useAuth();
const { getUserRecipeLogs, isRecipeBaked, toggleUserRecipeLog } = useUserRecipeLogs();
const { analyzeImage, loading } = useRecipe();

const userName = computed(() => user.value?.name ?? 'User');
const userId = computed(() => user.value?.firebaseId ?? null);

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
  }
})

const handleBakedClick = async (recipeId: number) => {
  if (!user.value?.id) return;
  await toggleUserRecipeLog(user.value.id, recipeId);
};
</script>
<template>



  <div v-if="isLoggedIn" class="text-sm text-gray-700">
    Hello {{ userName }} (ID: {{ userId }})
  </div>

  <!-- Rest of your page content -->
  <div class="flex flex-col items-center justify-center p-2">
    <div class="flex gap-4 mb-4 items-start">
      <div>
        <UTextarea v-model="query" class="w-64" placeholder="Enter ingredients (e.g. I have chocolate, butter and eggs)"/>
      </div>
      <div class="flex flex-col gap-1">
        <label for="image-upload" class="text-sm font-medium text-gray-700">Upload Image</label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          :disabled="loading"
          class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span v-if="loading" class="text-xs text-gray-500">Analyzing image...</span>
      </div>
    </div>
    <UInputNumber  v-model="topK"/>

    <!-- Strict mode checkbox -->
    <div class="mb-4 flex items-center gap-2">
      <input type="checkbox" id="strict" v-model="strictMode" />
      <label for="strict">Strict mode (only recipes with exact ingredients)</label>
      <p>Strict mode value: {{ strictMode }}</p>
    </div>

    <!-- Forbidden ingredients multi-select -->
    <div class="mb-4">
      <label class="block w-64 mb-1 font-medium">Forbidden ingredients:</label>
      <select v-model="forbiddenIngredients" multiple class="w-full border p-2 rounded">
        <option v-for="ing in allIngredients" :key="ing" :value="ing">
          {{ ing }}
        </option>
      </select>
    </div>
    <UButton @click="getRecommendation">Get Recommendation</UButton>
  </div>

  <!-- Recipe Results Grid -->
  <div class="recipe-grid">
    <div v-for="(recipe, index) in recommendations" :key="recipe.id" class="recipe-grid-item">
      <CompactRecipeCard
        :recipe="toFullRecipe(recipe)"
        :is-baked="isRecipeBaked(recipe.id)"
        :recipe-number="index + 1"
        @toggle-baked="handleBakedClick"
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
</template>

<style scoped>
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.recipe-grid-item {
  position: relative;
}

.missing-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.missing-info ul {
  margin: 0.25rem 0 0 0;
  padding-left: 1.5rem;
  list-style: none;
}

.missing-info li {
  margin: 0.125rem 0;
}

@media (max-width: 1024px) {
  .recipe-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .recipe-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style>

