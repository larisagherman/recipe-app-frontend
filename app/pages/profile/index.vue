<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { usePreferences } from '~/composables/usePreferences';
import type { UserPreferences } from '~/types/userPreferences';

const { user, isLoggedIn, logout } = useAuth();
const { preferences, fetchPreferences, loading: preferencesLoading } = usePreferences();
const router = useRouter();
const authChecked = ref(false);

// Wait for auth state to be checked before redirecting
onMounted(() => {
  // Give Firebase time to restore the auth state
  const timeout = setTimeout(() => {
    authChecked.value = true;
    if (!isLoggedIn.value) {
      router.push('/');
    }
  }, 1000); // Wait 1 second for auth to load

  // Also watch for auth changes
  let stopWatch: (() => void) | null = null;
  stopWatch = watch(user, (newUser) => {
    if (newUser) {
      authChecked.value = true;
      clearTimeout(timeout);
      if (stopWatch) stopWatch();
      // Fetch preferences when user is available
      if (newUser?.id) {
        fetchPreferences(newUser.id);
      }
    }
  }, { immediate: true });
});

const activeTab = ref('history');

const setActiveTab = (tab: string) => {
  activeTab.value = tab;
};
</script>

<template>
  <!-- Loading state while checking auth -->
  <div v-if="!authChecked" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading...</p>
    </div>
  </div>

  <!-- Profile content once auth is checked -->
  <div v-else class="min-h-screen ">
    <div class="max-w-6xl mx-auto p-6">
      <!-- Profile Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-800">{{ user?.name || 'User' }}</h1>
              <p class="text-gray-600">{{ user?.email }}</p>
            </div>
          </div>
          <button  @click="logout" class="underline cursor-pointer">
            Log out
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="flex border-b">
          <button
            @click="setActiveTab('history')"
            :class="[
              'flex-1 py-4 px-6 text-center font-semibold transition-all duration-150',
              activeTab === 'history'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
             Baking History
          </button>
          <button
              @click="setActiveTab('saved')"
              :class="[
              'flex-1 py-4 px-6 text-center font-semibold transition-all duration-150',
              activeTab === 'saved'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            ️ Saved Recipes
          </button>
          <button
            @click="setActiveTab('preferences')"
            :class="[
              'flex-1 py-4 px-6 text-center font-semibold transition-all duration-150',
              activeTab === 'preferences'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
             Preferences
          </button>

        </div>
      </div>

      <!-- Content Area -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <!-- Recipe History Tab -->
        <div v-if="activeTab === 'history'">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Your Recipe History</h2>
          <p class="text-gray-600 mt-4">
            See all the recipes you've viewed, searched for, and cooked. Track your culinary journey!
          </p>
          <NuxtLink
            to="/profile/history"
            class="inline-flex items-center justify-center gap-2 mt-4 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3"
          >
            View Full History →
          </NuxtLink>

        </div>

        <!-- Preferences Tab -->
        <div v-if="activeTab === 'preferences'">
          <!-- If preferences exist, show card display -->
          <div v-if="preferences && !preferencesLoading" class="space-y-6">
            <div class="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border-2 border-orange-200 p-8">
              <div class="flex items-start justify-between mb-6">
                <h2 class="text-3xl font-bold text-gray-900">🍰 Your Preferences</h2>
                <NuxtLink
                  to="/profile/preferences"
                  class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3"
                >
                  ✏️ Edit Preferences
                </NuxtLink>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Dietary Types -->
                <div class="bg-white rounded-lg p-4 border border-orange-200">
                  <h3 class="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <span>🥗</span> Dietary Types
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="type in preferences.dietaryTypes"
                      :key="type"
                      class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {{ type }}
                    </span>
                  </div>
                  <p v-if="!preferences.dietaryTypes?.length" class="text-gray-500 text-sm">No dietary types selected</p>
                  <p v-if="preferences.dietaryStrict" class="text-xs text-orange-600 mt-2 font-semibold">
                    ⚠️ Strict mode enabled
                  </p>
                </div>

                <!-- Allergies -->
                <div class="bg-white rounded-lg p-4 border border-red-200">
                  <h3 class="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <span>🚫</span> Allergies
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="allergy in preferences.allergies"
                      :key="allergy"
                      :class="[
                        'px-3 py-1 rounded-full text-sm font-medium',
                        preferences.severeAllergies?.includes(allergy)
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ allergy }} {{ preferences.severeAllergies?.includes(allergy) ? '⚠️' : '' }}
                    </span>
                  </div>
                  <p v-if="!preferences.allergies?.length" class="text-gray-500 text-sm">No allergies marked</p>
                </div>

                <!-- Sweetness Level -->
                <div class="bg-white rounded-lg p-4 border border-pink-200">
                  <h3 class="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <span>🍬</span> Sweetness Level
                  </h3>
                  <p class="text-gray-700">
                    {{ preferences.tastePreferences
                      ? preferences.tastePreferences === 'notsweet' ? 'Not Sweet'
                      : preferences.tastePreferences === 'mildlysweet' ? 'Mildly Sweet'
                      : preferences.tastePreferences === 'medium' ? 'Medium'
                      : 'Very Sweet'
                      : 'Not specified' }}
                  </p>
                </div>

                <!-- Disliked Ingredients -->
                <div class="bg-white rounded-lg p-4 border border-yellow-200">
                  <h3 class="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <span>🍯</span> Disliked Ingredients
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="ingredient in preferences.dislikedIngredients"
                      :key="ingredient"
                      class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                    >
                      {{ ingredient }}
                    </span>
                  </div>
                  <p v-if="!preferences.dislikedIngredients?.length" class="text-gray-500 text-sm">No disliked ingredients</p>
                </div>

                <!-- Flavor Preferences -->
                <div class="bg-white rounded-lg p-4 border border-purple-200 md:col-span-2">
                  <h3 class="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <span>🍫</span> Flavor Profiles
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="flavor in preferences.flavourPreferences"
                      :key="flavor"
                      class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {{ flavor }}
                    </span>
                  </div>
                  <p v-if="!preferences.flavourPreferences?.length" class="text-gray-500 text-sm">No flavor preferences selected</p>
                </div>
              </div>

              <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm text-blue-800">
                  <span class="font-semibold">💡 Tip:</span> Your preferences help us recommend recipes tailored to your lifestyle and taste!
                </p>
              </div>
            </div>
          </div>

          <!-- If no preferences set, show setup prompt -->
          <div v-else-if="preferencesLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading your preferences...</p>
          </div>

          <div v-else class="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border-2 border-orange-200 p-8 text-center">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">🎉 Set Your Preferences</h3>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't set up your preferences yet. Let's customize your recipe recommendations to match your lifestyle and taste!
            </p>
            <NuxtLink
              to="/profile/preferences"
              class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-8 py-4"
            >
              🍰 Create Your Preferences
            </NuxtLink>
          </div>
        </div>

        <!-- Favorites Tab -->
        <div v-if="activeTab === 'saved'">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Your Favorite Recipes</h2>
          <p class="text-gray-600">
            Your saved favorite recipes will appear here. Start exploring and save recipes you love!
          </p>
          <NuxtLink
            to="/profile/savedRecipes"
            class="inline-flex items-center justify-center gap-2 mt-4 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3"
          >
            View Saved Recipes →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>




