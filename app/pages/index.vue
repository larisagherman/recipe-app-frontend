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
  <div class="min-h-screen flex flex-col">
    <!-- Hero Section (Only for logged-out users) -->
    <div v-if="!isLoggedIn">
      <div class="min-h-screen flex items-center justify-center px-6 py-20">
        <div class="max-w-6xl w-full">
          <div class="grid md:grid-cols-2 gap-16 items-center">
            <!-- Left Side: Content -->
            <div class="flex flex-col justify-center">
              <h1 class="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Your <span class="text-primary-600">Recipe</span> Journey
              </h1>
              <p class="text-lg text-gray-600 mb-10 leading-relaxed">
                Discover delicious recipes tailored to your ingredients and preferences. Whether you're a seasoned chef or just starting out, we've got the perfect recipe for you.
              </p>

              <!-- Button -->
              <NuxtLink
                to="/recommend"
                class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl bg-primary-600 text-white hover:bg-primary-700 px-8 py-4 w-fit text-lg hover:-translate-y-1 transform"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Find Recipes
              </NuxtLink>
            </div>

            <!-- Right Side: Image -->
            <div class="flex items-center justify-center">
              <div class="relative w-full h-96 md:h-full md:min-h-96">
                <img
                  src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=600&fit=crop"
                  alt="Delicious food"
                  class="w-full h-full object-cover rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Welcome Section (Only for logged-in users) -->
    <div v-if="isLoggedIn">
      <div class="flex items-center justify-center px-6 py-8">
        <div class="max-w-6xl w-full">
          <div class="text-center">
            <h1 class="text-5xl font-bold text-gray-900 ">
              Welcome back, <span class="text-primary-600">{{ userName }}</span>!
            </h1>
            <p class="text-lg text-gray-600">
              Discover delicious recipes tailored to your ingredients and preferences
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rest of content -->
    <div class="flex-1 flex items-center justify-center px-6 py-8">
      <div class="max-w-6xl w-full space-y-20">

      <!-- Weekly Recommendation Section (Only for logged-in users) -->
      <div v-if="isLoggedIn" class="pb-12">
        <WeeklyRecommendationCard
          :recommendation="weeklyRecommendation"
          :loading="loading"
          :error="error"
        />
      </div>

      <!-- Quick Action Cards (Only for logged-in users) -->
      <div v-if="isLoggedIn" class="pt-8">
        <h2 class="text-4xl font-bold text-gray-900 mb-12">Explore More</h2>
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Find Recipe by Ingredients Card -->
          <NuxtLink
            to="/recommend"
            class="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-primary-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div class="flex items-start gap-6">
              <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">
                  Find by Ingredients
                </h3>
                <p class="text-gray-600 mb-4">
                  Search for recipes based on ingredients you have at home
                </p>
                <div class="inline-flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                  Get Started
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </NuxtLink>

          <!-- Browse All Recipes Card -->
          <NuxtLink
            to="/recipes"
            class="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-orange-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div class="flex items-start gap-6">
              <div class="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.996 10-11.747S17.5 6.253 12 6.253z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">
                  Browse All Recipes
                </h3>
                <p class="text-gray-600 mb-4">
                  Explore our complete collection of delicious recipes
                </p>
                <div class="inline-flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all">
                  Explore
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Info Section (Only for logged-out users) -->
      <div v-if="!isLoggedIn">
        <h2 class="text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose Us</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature Card 1 -->
          <div class="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 border border-gray-100">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Smart Recommendations</h3>
            <p class="text-gray-600 leading-relaxed">
              Get personalized recipe suggestions based on your available ingredients and dietary preferences.
            </p>
          </div>

          <!-- Feature Card 2 -->
          <div class="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 border border-gray-100">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1m2-1v2.5M4 7l2 1m-2-1l2-1m-2 1v2.5"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Easy to Use</h3>
            <p class="text-gray-600 leading-relaxed">
              Simply enter your ingredients or upload a photo, and our app will suggest delicious recipes you can make.
            </p>
          </div>

          <!-- Feature Card 3 -->
          <div class="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 border border-gray-100">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Save Favorites</h3>
            <p class="text-gray-600 leading-relaxed">
              Log in and save your favorite recipes and access them anytime. Build your own personalized recipe collection.
            </p>
          </div>
        </div>
      </div>

      <!-- Second Info Section (Only for logged-out users) -->
      <div v-if="!isLoggedIn" class="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl shadow-xl p-12 text-white">
        <h2 class="text-4xl font-bold mb-12 text-center">Why Choose RecipeApp?</h2>
        <div class="grid md:grid-cols-2 gap-12">
          <div class="flex gap-4">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-2">Unlimited Recipes</h3>
              <p class="text-white/80">
                Access thousands of recipes from all around the world, with detailed instructions and beautiful food photography.
              </p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-2">Save Time Cooking</h3>
              <p class="text-white/80">
                Filter recipes by cooking time and difficulty level to find meals that fit your schedule perfectly.
              </p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 20h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-2">Access Anywhere</h3>
              <p class="text-white/80">
                Use our app on any device and access your recipes anytime, anywhere you need them.
              </p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-2">Share with Friends</h3>
              <p class="text-white/80">
                Share your favorite recipes with friends and family to inspire their cooking adventures.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Cards for logged-out users (already existing) -->
      <div v-if="!isLoggedIn" class="grid md:grid-cols-2 gap-8">
        <!-- ...existing code... -->
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

