<script setup lang="ts">
import { watchEffect } from "vue";
import { useRecipe } from '~/composables/useRecipe';
import { useAuth } from '~/composables/useAuth';
import { useUserRecipeLogs } from '~/composables/useUserRecipeLogs';

const { recipes } = useRecipe();
const { user } = useAuth();
const { getUserRecipeLogs, isRecipeBaked, toggleUserRecipeLog } = useUserRecipeLogs();

watchEffect(() => {
  if (user.value?.id) {
    getUserRecipeLogs(user.value.id);
  }
});

const handleBakedClick = async (recipeId: number) => {
  if (!user.value?.id) return;
  await toggleUserRecipeLog(user.value.id, recipeId);
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
