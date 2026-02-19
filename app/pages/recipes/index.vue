<script setup lang="ts">
import { watchEffect } from "vue";

const { recipes } = useRecipe();
const { user } = useAuth();
const { getUserRecipeLogs, isRecipeBaked, toggleUserRecipeLog } = useUserRecipeLogs();

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
  <div>
    <NuxtLink to="/" class="text-amber-700">Home</NuxtLink>

    <h1>Recipes</h1>

    <RecipeCard
      v-for="recipe in recipes"
      :key="recipe.id"
      :recipe="recipe"
      :is-baked="isRecipeBaked(recipe.id)"
      @toggle-baked="handleBakedClick"
    />
  </div>
</template>
