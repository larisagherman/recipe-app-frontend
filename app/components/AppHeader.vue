<script setup lang="ts">
const { loginWithGoogle, isLoggedIn, user } = useAuth();
</script>


<template>
  <nav class="flex justify-between items-center px-8 py-3 bg-brand-500/90 backdrop-blur-md">

    <!-- Left: Logo + Links -->
    <div class="flex items-center gap-8">
      <NuxtLink to="/" class="font-bold text-white text-lg">
        HOME
      </NuxtLink>

      <div class="flex items-center gap-6 text-sm">
        <NuxtLink to="/recommend" class="text-white/80 hover:text-white transition font-semibold">
          Recipe Finder
        </NuxtLink>
        <NuxtLink to="/recipes" class="text-white/80 hover:text-white transition font-semibold">
          View Recipes
        </NuxtLink>

      </div>
    </div>

    <!-- Right: Auth -->
    <div>
      <!-- Not logged in -->
      <button
          v-if="!isLoggedIn"
          @click="loginWithGoogle"
          class="bg-white text-gray-800 text-md px-4 py-2 rounded-full hover:shadow-md transition flex items-center gap-2 "
      >
        <img src="/google-logo.png" class="w-4 h-4" />
        Sign in
      </button>

      <!-- Logged in -->
      <NuxtLink
          v-else
          to="/profile"
          class="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/20 transition"
      >


        <span class="text-white text-sm hidden sm:block font-semibold">
          {{ user?.name }}
        </span>
        <img
          v-if="user?.photoURL"
          :src="user.photoURL"
          class="w-8 h-8 rounded-full object-cover"
      />

        <div
            v-else
            class="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-sm font-semibold"
        >
          {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
      </NuxtLink>
    </div>

  </nav>
</template>