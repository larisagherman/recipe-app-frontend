<script setup lang="ts">


const {recipes, toggleBakedRecipe, isRecipeBaked}=useRecipe()

const handleBakedClick = async (event: Event, recipeId: number) => {
  event.preventDefault(); // Prevent navigation when clicking the button
  event.stopPropagation();
  await toggleBakedRecipe(recipeId);
}
</script>

<template>
  <div>
    <NuxtLink to="/" class="text-amber-700">Home</NuxtLink>

    <h1>Recipes</h1>

    <NuxtLink
      v-for="recipe in recipes"
      :key="recipe.id"
      :to="`/recipes/${recipe.id}`"
      class="recipe-card"
    >
      <div class="recipe-card-header">
        <h2>{{ recipe.name }}</h2>
        <button
          @click="handleBakedClick($event, recipe.id)"
          :class="['baked-btn', { 'baked': isRecipeBaked(recipe.id) }]"
          :title="isRecipeBaked(recipe.id) ? 'Mark as not baked' : 'Mark as baked'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="icon"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.003-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <span class="baked-text">{{ isRecipeBaked(recipe.id) ? 'Baked!' : 'Mark as Baked' }}</span>
        </button>
      </div>
      <img :src="recipe.imgSrc" :alt="recipe.name" />
      <p><strong>Prep Time:</strong> {{ recipe.prepTime }} | <strong>Cook Time:</strong> {{ recipe.cookTime }}</p>
      <p><strong>Servings:</strong> {{ recipe.servings }}</p>
      <h3>Ingredients:</h3>
      <pre>{{ recipe.ingredients }}</pre>
    </NuxtLink>

  </div>
</template>

<style scoped>
.recipe-card {
  position: relative;
  display: block;
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}
.recipe-card:hover {
  border-color: #d97706;
  box-shadow: 0 4px 8px rgba(217, 119, 6, 0.2);
  transform: translateY(-2px);
}
.recipe-card img {
  max-width: 100%;
  border-radius: 4px;
}

.recipe-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.recipe-card-header h2 {
  margin: 0;
  flex: 1;
}

.baked-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.baked-btn:hover {
  border-color: #d97706;
  color: #d97706;
  background-color: #fef3c7;
}

.baked-btn.baked {
  border-color: #d97706;
  background-color: #d97706;
  color: white;
}

.baked-btn.baked:hover {
  background-color: #b45309;
  border-color: #b45309;
}

.baked-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.baked-text {
  white-space: nowrap;
}

@media (max-width: 640px) {
  .baked-text {
    display: none;
  }

  .baked-btn {
    padding: 0.5rem;
  }
}
</style>
