<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const { user, isLoggedIn, logout } = useAuth();
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
          <AppButton variant="danger" @click="logout">
            Log out
          </AppButton>
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
             Recipe History
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
          <button
            @click="setActiveTab('favorites')"
            :class="[
              'flex-1 py-4 px-6 text-center font-semibold transition-all duration-150',
              activeTab === 'favorites'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            ️ Favorites
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <!-- Recipe History Tab -->
        <div v-if="activeTab === 'history'">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Your Recipe History</h2>
          <NuxtLink
            to="/profile/history"
            class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3"
          >
            View Full History →
          </NuxtLink>
          <p class="text-gray-600 mt-4">
            See all the recipes you've viewed, searched for, and cooked. Track your culinary journey!
          </p>
        </div>

        <!-- Preferences Tab -->
        <div v-if="activeTab === 'preferences'">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Your Preferences</h2>
          <div class="space-y-6">
            <!-- Dietary Restrictions -->
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Dietary Restrictions</h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Vegetarian</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Vegan</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Gluten-Free</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Dairy-Free</span>
                </label>
              </div>
            </div>

            <!-- Forbidden Ingredients -->
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Forbidden Ingredients</h3>
              <textarea
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter ingredients you want to avoid (e.g., peanuts, shellfish, mushrooms)..."
              ></textarea>
              <p class="text-sm text-gray-500 mt-1">Separate multiple ingredients with commas</p>
            </div>

            <!-- Preferred Cuisines -->
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Preferred Cuisines</h3>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Italian</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Chinese</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Mexican</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Indian</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Japanese</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="w-5 h-5 text-primary-600 rounded">
                  <span class="text-gray-700">Mediterranean</span>
                </label>
              </div>
            </div>

            <AppButton>
              💾 Save Preferences
            </AppButton>
          </div>
        </div>

        <!-- Favorites Tab -->
        <div v-if="activeTab === 'favorites'">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Your Favorite Recipes</h2>
          <p class="text-gray-600">
            Your saved favorite recipes will appear here. Start exploring and save recipes you love!
          </p>
          <NuxtLink
            to="/recipes"
            class="inline-flex items-center justify-center gap-2 mt-4 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3"
          >
            Browse Recipes →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>




