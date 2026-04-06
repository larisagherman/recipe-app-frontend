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
  <div class="w-full bg-white rounded-xl shadow-md p-8 border border-gray-200">
    <!-- Header -->
    <div class="mb-8 pb-4 border-b-2 border-brand-500">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">
        This Week's Recipe Pick
      </h2>
      <p v-if="recommendation && !loading && !error" class="text-sm text-gray-500">
        Week starting {{ formatDate(recommendation.weekStart) }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block">
        <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mb-4"></div>
        <p class="text-gray-600">Loading your weekly recipe...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !recommendation" class="text-center py-8">
      <p class="text-gray-600 mb-4">We couldn't load your weekly recommendation</p>
    </div>

    <!-- Success State -->
    <div v-else-if="recommendation && !loading" class="grid md:grid-cols-2 gap-8">
      <!-- Recipe Image -->
      <div class="flex items-center justify-center">
        <div v-if="recommendation.recipe.imgSrc" class="w-full">
          <img
            :src="recommendation.recipe.imgSrc"
            :alt="recommendation.recipe.name"
            class="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
        <div v-else class="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500">No image available</p>
          </div>
        </div>
      </div>

      <!-- Recipe Details -->
      <div class="flex flex-col justify-between">
        <div>
          <h3 class="text-3xl font-bold text-gray-900 mb-6">
            {{ recommendation.recipe.name }}
          </h3>

          <!-- Quick Info Grid -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-xs text-gray-600 font-semibold mb-2 uppercase tracking-wide">Prep Time</p>
              <p class="font-bold text-blue-700 text-lg">{{ recommendation.recipe.prepTime }}</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p class="text-xs text-gray-600 font-semibold mb-2 uppercase tracking-wide">Cook Time</p>
              <p class="font-bold text-green-700 text-lg">{{ recommendation.recipe.cookTime }}</p>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p class="text-xs text-gray-600 font-semibold mb-2 uppercase tracking-wide">Servings</p>
              <p class="font-bold text-orange-700 text-lg">{{ recommendation.recipe.servings }}</p>
            </div>
          </div>

          <!-- Ingredients Preview -->
          <div class="mb-8">
            <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1 h-5 bg-brand-500 rounded-full"></span>
              Ingredients Preview
            </h4>
            <p class="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {{ recommendation.recipe.ingredients }}
            </p>
          </div>
        </div>

        <!-- Action Button -->
        <NuxtLink
          :to="`/generatedRecipe/${recommendation.recipe.id}`"
          class="inline-flex items-center justify-center gap-2 font-bold text-lg rounded-lg transition-all duration-200 px-6 py-4 bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg"
        >
          View Full Recipe
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </NuxtLink>
      </div>
    </div>

    <!-- Empty State -->
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


