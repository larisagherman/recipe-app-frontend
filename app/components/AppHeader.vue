<script setup lang="ts">
const { loginWithGoogle, logout, isLoggedIn, user } = useAuth();
</script>
<template>
  <div class="flex justify-between items-center p-2 border-b">
    <NuxtLink to="/recipes">See all recipes</NuxtLink>
    <NuxtLink to="/history">See your history</NuxtLink>

    <button
        v-if="!isLoggedIn"
        @click="loginWithGoogle"
        class="bg-white border border-gray-300 flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-150"
    >
      <img src="/google-logo.png" alt="Google" class="w-5 h-5"/>
      <span class="font-medium text-gray-700">Sign in with Google</span>
    </button>

    <div v-else class="flex items-center gap-2">
      <img :src="user.photoURL" class="w-6 h-6 rounded-full"/>
      <span class="font-medium text-gray-700">{{ user.name }}</span>
      <button @click="logout" class="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-all duration-150">
        Log out
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>