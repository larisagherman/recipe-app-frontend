<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useWeeklyRecommendation } from '~/composables/useWeeklyRecommendation';

const { isLoggedIn, user } = useAuth();
const userName = computed(() => user.value?.name ?? 'Guest');
const { weeklyRecommendation, loading, error, fetchWeeklyRecommendation } = useWeeklyRecommendation();

// Fetch weekly recommendation when user is available
onMounted(async () => {
  if (isLoggedIn.value && user.value?.id) {
    await fetchWeeklyRecommendation(user.value.id);
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-4xl w-full">
      <!-- Welcome Section -->
      <div class="text-center mb-12">
        <div v-if="isLoggedIn">
          <h1 class="text-5xl font-bold text-gray-900 mb-4">
            Welcome, {{ userName }}!
          </h1>
          <p class="text-xl text-gray-600">
            Discover delicious recipes tailored to your ingredients and preferences
          </p>
        </div>
        <div v-else>
          <h1 class="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Your Recipe Journey
          </h1>
          <p class="text-xl text-gray-600">
            Sign in to discover recipes tailored just for you
          </p>
        </div>
      </div>

      <!-- Weekly Recommendation Section (Only for logged-in users) -->
      <div v-if="isLoggedIn" class="mb-12">
        <WeeklyRecommendationCard
          :recommendation="weeklyRecommendation"
          :loading="loading"
          :error="error"
        />
      </div>

      <!-- Action Cards -->
      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <!-- Get Custom Recommendation Card -->
        <NuxtLink
          to="/recommend"
          class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-primary-400 transform hover:-translate-y-1"
        >
          <div class="text-center">
            <div class="mb-4 text-6xl">
              🔍
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">
              Get Custom Recommendations
            </h2>
            <p class="text-gray-600 mb-6">
              Enter your available ingredients or upload a photo to discover recipes you can make right now
            </p>
            <div class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 shadow-sm group-hover:shadow-md bg-primary-600 text-white group-hover:bg-primary-700 px-6 py-3">
              Start Baking
              <span class="transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </NuxtLink>

        <!-- Weekly Recommendations Card -->
        <NuxtLink
          to="/recipes"
          class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-primary-400 transform hover:-translate-y-1"
        >
          <div class="text-center">
            <div class="mb-4 text-6xl">
              📅
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">
              Browse All Recipes
            </h2>
            <p class="text-gray-600 mb-6">
              Explore our complete collection of recipes and find inspiration for your next meal
            </p>
            <div class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 shadow-sm group-hover:shadow-md bg-primary-600 text-white group-hover:bg-primary-700 px-6 py-3">
              Explore Recipes
              <span class="transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Features Section -->
      <div class="grid md:grid-cols-3 gap-6">
        <div class="text-center p-6 bg-white/50 rounded-xl">
          <div class="text-3xl mb-3">🥗</div>
          <h3 class="font-semibold text-gray-900 mb-2">Smart Matching</h3>
          <p class="text-sm text-gray-600">AI-powered ingredient matching</p>
        </div>
        <div class="text-center p-6 bg-white/50 rounded-xl">
          <div class="text-3xl mb-3">📸</div>
          <h3 class="font-semibold text-gray-900 mb-2">Image Recognition</h3>
          <p class="text-sm text-gray-600">Upload photos of your ingredients</p>
        </div>
        <div class="text-center p-6 bg-white/50 rounded-xl">
          <div class="text-3xl mb-3">❤️</div>
          <h3 class="font-semibold text-gray-900 mb-2">Track Favorites</h3>
          <p class="text-sm text-gray-600">Save and organize your recipes</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional hover effects */
.group:hover .transform {
  transition: transform 0.3s ease;
}
</style>

