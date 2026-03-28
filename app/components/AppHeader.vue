<script setup lang="ts">
const { loginWithGoogle, isLoggedIn, user } = useAuth();
</script>
<template>
  <div class="flex justify-between items-center p-4 bg-transparent backdrop-blur-sm">
    <!-- Home Link -->
    <div class="flex ml-8 gap-4">
      <NuxtLink
          to="/"
          class="flex items-center justify-center gap-2 px-4 py-2 rounded-full hover:bg-white/50 transition-all duration-150 group"
      >
        <span class="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">Home</span>
      </NuxtLink>
      <NuxtLink to="/recipes"
                class="flex items-center justify-center gap-2 px-4 py-2 rounded-full hover:bg-white/50 transition-all duration-150 group">

        <span class="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">Recipes</span>
      </NuxtLink>
    </div>

    <!-- Auth Section -->
    <button
        v-if="!isLoggedIn"
        @click="loginWithGoogle"
        class="bg-white border border-gray-300 flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-150"
    >
      <img src="/google-logo.png" alt="Google" class="w-5 h-5"/>
      <span class="font-medium text-gray-700">Sign in with Google</span>
    </button>

    <div v-else class="flex items-center gap-3">
      <NuxtLink
        to="/profile"
        class="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 hover:shadow-md transition-all duration-150 cursor-pointer"
      >
        <img
          v-if="user?.photoURL"
          :src="user.photoURL"
          :alt="user.name || 'User'"
          class="w-8 h-8 rounded-full object-cover"
        />
        <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-gray-800">{{ user?.name || 'User' }}</span>
          <span class="text-xs text-gray-500">{{ user?.email }}</span>
        </div>
      </NuxtLink>
    </div>

  </div>
</template>
