<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { Recommendation } from "~/types/Recommendation";
import type { FullRecipe } from "~/types/fullRecipe";

const { isLoggedIn, user } = useAuth();
const { getUserRecipeLogs, isRecipeBaked, toggleUserRecipeLog } = useUserRecipeLogs();

const userName = computed(() => user.value?.name ?? 'User');
const userId = computed(() => user.value?.firebaseId ?? null);

const recommendations = ref<Recommendation[]>([])

const query= ref('')
const topK=ref(10)
const strictMode = ref(false)
const forbiddenIngredients = ref<string[]>([])
const getRecommendation = async () => {
  recommendations.value=await $fetch('http://localhost:8080/recommend',
      {
        method:'POST',
        body: {
          query: query.value,
          top_k:topK.value,
          strict: strictMode.value,
          forbidden_ingredients: forbiddenIngredients.value
        }

      })
}
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
    getUserRecipeLogs();
  }
});

const handleBakedClick = async (recipeId: number) => {
  await toggleUserRecipeLog(recipeId);
};
</script>
<template>



  <div v-if="isLoggedIn" class="text-sm text-gray-700">
    Hello {{ userName }} (ID: {{ userId }})
  </div>

  <!-- Rest of your page content -->
  <div class="flex flex-col items-center justify-center p-2">
    <UTextarea v-model="query" class="w-64" placeholder="Enter ingredients (e.g. I have chocolate, butter and eggs)"/>
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

  <div v-for="recipe in recommendations" :key="recipe.id" class="m-2">
    <RecipeCard
      :recipe="toFullRecipe(recipe)"
      :is-baked="isRecipeBaked(recipe.id)"
      @toggle-baked="handleBakedClick"
    />

    <div v-if="strictMode" class="border p-4">
      <p v-if="recipe.missing_count" class="text-pink-700">
        Missing ingredients: {{ recipe.missing_count }}
      </p>

      <ul v-if="recipe.missing_ingredients?.length">
        <li v-for="ing in recipe.missing_ingredients" :key="ing">
          🛒 {{ ing }}
        </li>
      </ul>
    </div>
  </div>
</template>
