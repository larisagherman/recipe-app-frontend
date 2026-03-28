<script setup lang="ts">
import type { WeeklyRecommendation } from '~/types/weeklyRecommendation';

interface Props {
  recommendation: WeeklyRecommendation | null;
  loading?: boolean;
  error?: string | null;
}

defineProps<Props>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};
</script>

<template>
  <div class="w-full bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-200">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        📅 This Week's Recipe Pick
      </h2>
      <p v-if="recommendation && !loading && !error" class="text-sm text-gray-500">
        Week starting {{ formatDate(recommendation.weekStart) }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block">
        <div class="animate-spin">⏳</div>
        <p class="text-gray-600 mt-2">Loading your weekly recipe...</p>
      </div>
    </div>

    <!-- Error State - Still Display Card -->
    <div v-else-if="error && !recommendation" class="text-center py-8">
      <p class="text-gray-600 mb-4">We couldn't load your weekly recommendation</p>
    </div>

    <!-- Success State -->
    <div v-else-if="recommendation && !loading" class="grid md:grid-cols-2 gap-6">
      <!-- Recipe Image -->
      <div class="flex items-center justify-center">
        <div v-if="recommendation.recipe.imgSrc" class="w-full">
          <img
            :src="recommendation.recipe.imgSrc"
            :alt="recommendation.recipe.name"
            class="w-full h-64 object-cover rounded-xl shadow-md"
          />
        </div>
        <div v-else class="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
          <div class="text-center">
            <div class="text-4xl mb-2">🍳</div>
            <p class="text-gray-500">No image available</p>
          </div>
        </div>
      </div>

      <!-- Recipe Details -->
      <div class="flex flex-col justify-between">
        <div>
          <h3 class="text-3xl font-bold text-gray-900 mb-4">
            {{ recommendation.recipe.name }}
          </h3>

          <!-- Quick Info -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <p class="text-xs text-gray-600 mb-1">Prep Time</p>
              <p class="font-semibold text-blue-900">{{ recommendation.recipe.prepTime }}</p>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <p class="text-xs text-gray-600 mb-1">Cook Time</p>
              <p class="font-semibold text-green-900">{{ recommendation.recipe.cookTime }}</p>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <p class="text-xs text-gray-600 mb-1">Servings</p>
              <p class="font-semibold text-orange-900">{{ recommendation.recipe.servings }}</p>
            </div>
          </div>

          <!-- Ingredients Preview -->
          <div class="mb-6">
            <h4 class="font-semibold text-gray-900 mb-2">Ingredients:</h4>
            <p class="text-gray-600 text-sm line-clamp-3">
              {{ recommendation.recipe.ingredients }}
            </p>
          </div>
        </div>

        <!-- Action Button -->
        <NuxtLink
          :to="`/recipes/${recommendation.recipe.id}`"
          class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 text-center"
        >
          View Full Recipe
          <span class="text-lg">→</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Empty State (shouldn't happen but just in case) -->
    <div v-else class="text-center py-8">
      <p class="text-gray-500">No weekly recommendation available</p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>


