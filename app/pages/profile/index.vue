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
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Your Preferences</h2>
          <p class="text-gray-600 mt-4">
            Set your prefered life style now!
          </p>
          <NuxtLink
              to="/profile/history"
              class="inline-flex items-center justify-center gap-2 mt-4 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3"
          >            Update Preferences →
          </NuxtLink >
        </div>

        <!-- Favorites Tab -->
        <div v-if="activeTab === 'saved'">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Your Favorite Recipes</h2>
          <p class="text-gray-600">
            Your saved favorite recipes will appear here. Start exploring and save recipes you love!
          </p>
          <NuxtLink
            to="/profile"
            class="inline-flex items-center justify-center gap-2 mt-4 font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md bg-primary-600 text-white hover:bg-primary-700 px-6 py-3"
          >
            View Saved Recipes →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>




