<script setup lang="ts">


const {recipes}=useRecipe()
</script>

<template>
  <div>
    <NuxtLink to="/" class="text-amber-700">Home</NuxtLink>

    <h1>Recipes</h1>

    <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
      <h2>{{ recipe.name }}</h2>
      <img :src="recipe.imgSrc" :alt="recipe.name" />
      <p><strong>Prep Time:</strong> {{ recipe.prepTime }} | <strong>Cook Time:</strong> {{ recipe.cookTime }}</p>
      <p><strong>Servings:</strong> {{ recipe.servings }}</p>
      <h3>Ingredients:</h3>
      <pre>{{ recipe.ingredients }}</pre>

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
