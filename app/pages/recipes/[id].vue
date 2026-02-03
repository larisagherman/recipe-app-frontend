<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRecipe } from '~/composables/useRecipe'

const { recipe, getRecipeById } = useRecipe()
const route = useRoute()
const recipeId = Number(route.params.id)

onMounted(() => {
  getRecipeById(recipeId)
})
</script>

<template>
  <div>
    <h1>Recipes</h1>

    <div v-if="recipe"  class="recipe-card">
      <h2>{{ recipe.name }}</h2>
      <img :src="recipe.imgSrc" :alt="recipe.name" />
      <p><strong>Prep Time:</strong> {{ recipe.prepTime }} | <strong>Cook Time:</strong> {{ recipe.cookTime }}</p>
      <p><strong>Servings:</strong> {{ recipe.servings }}</p>
      <h3>Ingredients:</h3>
      <pre>{{ recipe.ingredients }}</pre>
      <h3>Directions:</h3>
      <pre>{{ recipe.directions }}</pre>
    </div>

  </div>
</template>

<style scoped>
.recipe-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}
.recipe-card img {
  max-width: 100%;
  border-radius: 4px;
}
</style>
