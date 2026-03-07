<script setup lang="ts">
import { watchEffect, onMounted } from "vue";
import { useRecipe } from '~/composables/useRecipe';
import { useAuth } from '~/composables/useAuth';
import { useUserRecipeLogs } from '~/composables/useUserRecipeLogs';

const { recipes, fetchRecipes, loading, error, pagination } = useRecipe();
const { user } = useAuth();
const { getUserRecipeLogs, isRecipeBaked, toggleUserRecipeLog } = useUserRecipeLogs();

// Fetch recipes on mount
onMounted(() => {
  fetchRecipes(0, 12);
});

watchEffect(() => {
  if (user.value?.id) {
    getUserRecipeLogs(user.value.id);
  }
});

const handleBakedClick = async (recipeId: number) => {
  if (!user.value?.id) return;
  await toggleUserRecipeLog(user.value.id, recipeId);
};

const handlePageChange = (newPage: number) => {
  fetchRecipes(newPage, pagination.value.size);
};
</script>

<template>
  <div class="recipes-page">
    <div class="header-section">
      <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>
      <h1 class="page-title">All Recipes</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading recipes...</p>
    </div>

    <div v-if="error" class="error-state">
      <p>Error: {{ error }}</p>
    </div>

    <div v-if="!loading && recipes.length > 0" class="recipes-container">
      <div class="recipe-grid">
        <div v-for="(recipe, index) in recipes" :key="recipe.id" class="recipe-grid-item">
          <div class="recipe-number">{{ (pagination.currentPage * pagination.size) + index + 1 }}</div>
          <CompactRecipeCard
            :recipe="recipe"
            :is-baked="isRecipeBaked(recipe.id)"
            @toggle-baked="handleBakedClick"
          />
        </div>
      </div>

      <div v-if="pagination.totalPages > 1" class="pagination-controls">
        <button
          @click="handlePageChange(pagination.currentPage - 1)"
          :disabled="pagination.currentPage === 0"
          class="pagination-btn"
        >
          ← Previous
        </button>
        <span class="pagination-info">
          Page {{ pagination.currentPage + 1 }} of {{ pagination.totalPages }}
        </span>
        <button
          @click="handlePageChange(pagination.currentPage + 1)"
          :disabled="pagination.currentPage >= pagination.totalPages - 1"
          class="pagination-btn"
        >
          Next →
        </button>
      </div>
    </div>

    <div v-if="!loading && recipes.length === 0" class="empty-state">
      <p>No recipes found.</p>
    </div>
  </div>
</template>

<style scoped>
.recipes-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-block;
  color: var(--color-primary-600);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--color-primary-700);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.125rem;
}

.error-state {
  color: #dc2626;
}

.recipes-container {
  margin-top: 2rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .recipe-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .recipe-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1536px) {
  .recipe-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.recipe-grid-item {
  position: relative;
}

.recipe-number {
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--color-primary-600);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 2rem 0;
}

.pagination-btn {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-primary-700);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pagination-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-info {
  font-size: 1rem;
  font-weight: 500;
  color: #4b5563;
}
</style>

