<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useWeeklyRecommendation } from '~/composables/useWeeklyRecommendation';
import { usePreferences } from '~/composables/usePreferences';
import { useRouter } from 'vue-router';

const router = useRouter();
const { isLoggedIn, user } = useAuth();
const userName = computed(() => user.value?.name ?? 'Guest');
const { weeklyRecommendation, loading, error, fetchWeeklyRecommendation } = useWeeklyRecommendation();
const { preferences, fetchPreferences } = usePreferences();

const searchSectionRef = ref<HTMLDivElement | null>(null);
const hasFetchedRecommendation = ref<boolean>(false);
const hasPreferences = computed(() => preferences.value && Object.keys(preferences.value).length > 0);

const RECIPE_CATEGORIES = [
  {
    name: "Chocolate Delights",
    image: "/images/home/chocolate-delights.png"
  },
  {
    name: "Fruity Treats",
    image: "/images/home/fruity-treats.png"
  },
  {
    name: "Baked Classics",
    image: "/images/home/baked-classics.png"
  },
  {
    name: "Frozen Delights",
    image: "/images/home/frozen-delights.png"
  },
];

const scrollToSearch = () => {
  searchSectionRef.value?.scrollIntoView({ behavior: "smooth" });
};

// Retry fetching weekly recommendation
const retryFetchRecommendation = async () => {
  if (user.value?.id) {
    hasFetchedRecommendation.value = false;
    await fetchWeeklyRecommendation(user.value.id);
    hasFetchedRecommendation.value = true;
  }
};

// Watch for user changes and fetch recommendation
watchEffect(async () => {
  if (isLoggedIn.value && user.value?.id && !hasFetchedRecommendation.value) {
    console.log('User detected, fetching data...');
    try {
      await fetchPreferences(user.value.id);
      if (hasPreferences.value) {
        await fetchWeeklyRecommendation(user.value.id);
      }
      hasFetchedRecommendation.value = true;
      console.log('Data fetching complete.');
    } catch (err) {
      console.error('Failed to fetch data in watchEffect:', err);
    }
  }
});

// Fallback: Fetch in onMounted as well
onMounted(async () => {
  if (isLoggedIn.value && user.value?.id && !hasFetchedRecommendation.value) {
    console.log('Component mounted, ensuring data is fetched...');
    try {
      await fetchPreferences(user.value.id);
      if (hasPreferences.value) {
        await fetchWeeklyRecommendation(user.value.id);
      }
      hasFetchedRecommendation.value = true;
    } catch (err) {
      console.error('Failed to fetch data on mount:', err);
    }
  }
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section v-if="!isLoggedIn" class="relative bg-gradient-to-br from-[#FCE4D6] to-[#F9D7C3] overflow-hidden">
      <div class="absolute inset-0 opacity-30">
        <img
          src="/images/home/chocolate-delights.png"
          alt="Delicious dessert"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div class="text-center max-w-4xl mx-auto">

          <h1 class="text-6xl md:text-7xl font-black mb-6 leading-tight text-[#5D3A2D]">
            Turn Ingredients Into Desserts          </h1>

          <p class="text-xl md:text-2xl mb-10 text-[#7D4F3E] max-w-3xl mx-auto leading-relaxed">
            Enter what you have. Get recipes instantly.          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <NuxtLink
              to="/recommend"
              class="inline-flex items-center justify-center gap-3 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl bg-[#E37D4D] text-white hover:bg-[#D46B3B] px-8 py-4 text-lg hover:-translate-y-1 transform"
            >
              <UIcon name="i-lucide-search" class="w-6 h-6"></UIcon>
              Find Recipes Now
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Decorative wave -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" class="w-full h-12 md:h-20 fill-current text-white">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </section>

    <!-- Welcome Section (Only for logged-in users) -->
    <section v-if="isLoggedIn" class="relative  overflow-hidden py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-3">
          <p class="text-5xl md:text-6xl font-black text-[#5D3A2D]">
            Welcome back,
            <span class="italic text-[#E37D4D]">{{ userName }}</span>!
          </p>
          <p class="text-xl md:text-2xl text-[#7D4F3E] font-medium">
            Ready to bake something delicious today?
          </p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section v-if="!isLoggedIn" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-[#5D3A2D] mb-4">How It Works</h2>
          <p class="text-xl text-[#7D4F3E]">Three simple steps to sweet success</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="inline-flex items-center justify-center size-20 rounded-full bg-[#FCE4D6] text-[#E37D4D] mb-4 border-2 border-[#E37D4D]">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-[#5D3A2D] mb-3">1. Add Ingredients</h3>
            <p class="text-[#7D4F3E] text-lg">
              Type your dessert ingredients or upload a photo. We'll recognize what you have!
            </p>
          </div>

          <div class="text-center">
            <div class="inline-flex items-center justify-center size-20 rounded-full bg-[#FCE4D6] text-[#E37D4D] mb-4 border-2 border-[#E37D4D]">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-[#5D3A2D] mb-3">2. Set Preferences</h3>
            <p class="text-[#7D4F3E] text-lg">
              Add forbidden ingredients, adjust difficulty, choose how many recipes you want
            </p>
          </div>

          <div class="text-center">
            <div class="inline-flex items-center justify-center size-20 rounded-full bg-[#FCE4D6] text-[#E37D4D] mb-4 border-2 border-[#E37D4D]">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-[#5D3A2D] mb-3">3. Get Sweet Recipes</h3>
            <p class="text-[#7D4F3E] text-lg">
              Discover perfectly matched desserts, save favorites, and start baking!
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Weekly Recommendation Section (Only for logged-in users) -->
    <section v-if="isLoggedIn" class="py-4 mb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading Skeleton State -->
        <div v-if="loading" class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div class="animate-pulse space-y-4">
            <div class="h-8 bg-gray-200 rounded-lg w-48 mx-auto"></div>
            <div class="h-4 bg-gray-200 rounded-lg w-full"></div>
            <div class="h-4 bg-gray-200 rounded-lg w-5/6 mx-auto"></div>
            <div class="grid md:grid-cols-2 gap-6 pt-4">
              <div class="h-64 bg-gray-200 rounded-lg"></div>
              <div class="space-y-3">
                <div class="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded-lg w-full"></div>
                <div class="h-4 bg-gray-200 rounded-lg w-full"></div>
                <div class="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                <div class="pt-4">
                  <div class="h-10 bg-gray-200 rounded-lg w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="rounded-2xl shadow-lg p-8 border border-red-200 bg-red-50">
          <div class="text-center">
            <svg class="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-red-800 mb-2">Couldn't Load This Week's Pick</h3>
            <p class="text-red-700 mb-4">{{ error }}</p>
            <button
              @click="retryFetchRecommendation"
              class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 bg-red-600 text-white hover:bg-red-700 px-6 py-2"
            >
              Try Again
            </button>
          </div>
        </div>

        <!-- Prompt to set preferences -->
        <div v-else-if="!hasPreferences" class="rounded-2xl shadow-lg p-8 border border-primary-200 bg-primary-50">
          <div class="text-center">
            <svg class="w-12 h-12 text-primary-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.343 3.94c.09-.542.56-1.04 1.11-1.04h1.093c.55 0 1.02.498 1.11 1.04l.158.943h.093c.473 0 .898.193 1.2.512l.668.668c.318.318.512.747.512 1.2v1.093c0 .55-.498 1.02-1.04 1.11l-.943.158v.093c0 .473-.193.898-.512 1.2l-.668.668c-.318.318-.747.512-1.2.512h-1.093c-.55 0-1.02-.498-1.11-1.04l-.158-.943h-.093c-.473 0-.898-.193-1.2-.512l-.668-.668c-.318-.318-.512-.747-.512-1.2v-1.093c0-.55.498-1.02 1.04-1.11l.943-.158v-.093c0-.473.193-.898.512-1.2l.668-.668c.318.318.747.512 1.2-.512h.093l.158-.943z" />
            </svg>
            <h3 class="text-lg font-semibold text-primary-800 mb-2">Set Your Preferences for Weekly Picks</h3>
            <p class="text-primary-700 mb-4">To get personalized weekly recipe recommendations, please set your preferences.</p>
            <NuxtLink
                to="/profile/preferences"
                class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 bg-primary-600 text-white hover:bg-primary-700 px-6 py-2"
            >
              Set Preferences
            </NuxtLink>
          </div>
        </div>

        <!-- Actual Content -->
        <div v-else>
          <WeeklyRecommendationCard
              :recommendation="weeklyRecommendation"
              :loading="false"
              :error="null"
          />
        </div>
      </div>
    </section>

    <!-- Recipe Finder CTA Section (Only for logged-in users) -->
    <section v-if="isLoggedIn" class="py-12 bg-gradient-to-r from-[#E37D4D] to-[#D46B3B]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h3 class="text-3xl md:text-4xl font-bold text-white mb-3">
            Find Your Perfect Dessert
          </h3>
          <p class="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Have ingredients on hand? Let us suggest delicious desserts you can make right now!
          </p>
          <NuxtLink
            to="/recommend"
            class="inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl bg-white text-[#E37D4D] hover:bg-[#FCE4D6] px-8 py-3 text-lg hover:-translate-y-1 transform"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Start Searching
          </NuxtLink>
        </div>
      </div>
    </section>
    <!-- Browse Categories Section -->
    <section class="py-16 bg-gradient-to-br from-[#FCE4D6] to-[#F9D7C3]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-[#5D3A2D] mb-4">Popular Dessert Categories</h2>
          <p class="text-xl text-[#7D4F3E]">Explore delicious sweet treats from around the world</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="category in RECIPE_CATEGORIES"
            :key="category.name"
            class="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transform transition hover:scale-105 hover:shadow-2xl"
            @click="scrollToSearch"
          >
            <div class="aspect-square">
              <img
                :src="category.image"
                :alt="category.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
              <div class="p-6 w-full">
                <h3 class="text-2xl font-bold text-white">{{ category.name }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>



    <!-- Quick Action Cards (Only for logged-in users) -->
    <section v-if="isLoggedIn" class="py-20 md:py-24 flex items-center justify-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 class="text-4xl font-bold text-[#5D3A2D] mb-16 text-center">Explore More</h2>
        <div class="grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
          <!-- Baking History Card -->
          <NuxtLink
            to="/profile/history"
            class="group bg-gradient-to-br from-[#FCE4D6] to-[#F9D7C3] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-[#D8A48F] transform hover:-translate-y-1 overflow-hidden"
          >
            <div class="flex flex-col items-center gap-4 text-center">
              <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors border border-white">
                <UIcon name="i-lucide-history" class="w-8 h-8 text-[#E37D4D]"></UIcon>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-[#5D3A2D] mb-2">
                  Baking History
                </h3>
                <p class="text-[#7D4F3E] mb-4 text-sm">
                  View all the delicious desserts you've baked
                </p>
                <div class="inline-flex items-center gap-2 text-[#E37D4D] font-semibold group-hover:gap-3 transition-all">
                  View History
                  <UIcon name="i-lucide-arrow-right" class="w-4 h-4"></UIcon>
                </div>
              </div>
            </div>
          </NuxtLink>

          <!-- Saved Recipes Card -->
          <NuxtLink
            to="/profile/savedRecipes"
            class="group bg-gradient-to-br from-[#FCE4D6] to-[#F9D7C3] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-[#D8A48F] transform hover:-translate-y-1 overflow-hidden"
          >
            <div class="flex flex-col items-center gap-4 text-center">
              <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors border border-white">
                <UIcon name="i-lucide-bookmark" class="w-8 h-8 text-[#E37D4D]"></UIcon>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-[#5D3A2D] mb-2">
                  Saved Recipes
                </h3>
                <p class="text-[#7D4F3E] mb-4 text-sm">
                  Access all your favorite recipes saved for later
                </p>
                <div class="inline-flex items-center gap-2 text-[#E37D4D] font-semibold group-hover:gap-3 transition-all justify-center">
                  View Saved
                  <UIcon name="i-lucide-arrow-right" class="w-4 h-4"></UIcon>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-gradient-to-r from-[#E37D4D] to-[#D46B3B] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8 text-center">

          <div>
            <div class="inline-flex items-center justify-center size-16 rounded-full bg-white/20 mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-4xl font-bold mb-2">Quick</h3>
            <p class="text-xl opacity-90">Find Recipes Instantly</p>
          </div>
          <div>
            <div class="inline-flex items-center justify-center size-16 rounded-full bg-white/20 mb-4">
              <UIcon name="i-lucide-hand-heart"  class="w-8 h-8"></UIcon>
            </div>
            <h3 class="text-4xl font-bold mb-2">Trusted</h3>
            <p class="text-xl opacity-90">From Websites You Love</p>
          </div>
          <div>
            <div class="inline-flex items-center justify-center size-16 rounded-full bg-white/20 mb-4">
              <UIcon name="i-lucide-notebook-pen" class="w-8 h-8"></UIcon>
            </div>
            <h3 class="text-4xl font-bold mb-2">5000+</h3>
            <p class="text-xl opacity-90">Delicious Desserts</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section (Only for logged-out users) -->
    <section v-if="!isLoggedIn" class="py-20 bg-gradient-to-br from-[#FCE4D6] to-[#F9D7C3]">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-[#5D3A2D] mb-6">
          Ready to Bake Your Dream Dessert?
        </h2>
        <p class="text-xl text-[#7D4F3E] mb-8">
          Sign in to save your favorite recipes, track your baking history, and get personalized recommendations
        </p>
        <NuxtLink
          to="/recommend"
          class="inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl bg-[#E37D4D] text-white hover:bg-[#D46B3B] px-8 py-4 text-lg hover:-translate-y-1 transform"
        >
          Get Started
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Hero section animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

section {
  animation: fadeInUp 0.6s ease-out;
}

/* Category card hover effects */
.group:hover img {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

/* Smooth transitions for interactive elements */
button,
a {
  transition: all 0.3s ease;
}

/* Wave animation for decorative SVG */
svg path {
  animation: none;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  section {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.5rem;
  }
}
</style>

