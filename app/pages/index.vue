<script setup lang="ts">
import { ref, computed } from 'vue'
import type {Recommendation} from "~/types/Recommendation";

const { loginWithGoogle, logout, isLoggedIn, user } = useAuth();

const userName = computed(() => user.value?.name ?? 'User');
const userId = computed(() => user.value?.firebaseId ?? null);

const recommendations = ref<Recommendation[]>([])

const query= ref('')
const topK=ref(10)
const strictMode = ref(false)
const forbiddenIngredients = ref<string[]>([])
const getRecommendation = async () => {
  recommendations.value=await $fetch('http://localhost:8080/recommend',
      {
        method:'POST',
        body: {
          query: query.value,
          top_k:topK.value,
          strict: strictMode.value,
          forbidden_ingredients: forbiddenIngredients.value
        }

      })
}
const allIngredients = [
  "cinnamon",
  "sugar",
  "salt",
  "milk",
  "eggs",
  "flour",
  "butter",
  "chocolate"
]
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


  <div v-if="isLoggedIn" class="text-sm text-gray-700">
    Hello {{ userName }} (ID: {{ userId }})
  </div>

  <!-- Rest of your page content -->
  <div class="flex flex-col items-center justify-center p-2">
    <UTextarea v-model="query" class="w-64" placeholder="Enter ingredients (e.g. I have chocolate, butter and eggs)"/>
    <UInputNumber  v-model="topK"/>

    <!-- Strict mode checkbox -->
    <div class="mb-4 flex items-center gap-2">
      <input type="checkbox" id="strict" v-model="strictMode" />
      <label for="strict">Strict mode (only recipes with exact ingredients)</label>
      <p>Strict mode value: {{ strictMode }}</p>
    </div>

    <!-- Forbidden ingredients multi-select -->
    <div class="mb-4">
      <label class="block w-64 mb-1 font-medium">Forbidden ingredients:</label>
      <select v-model="forbiddenIngredients" multiple class="w-full border p-2 rounded">
        <option v-for="ing in allIngredients" :key="ing" :value="ing">
          {{ ing }}
        </option>
      </select>
    </div>
    <UButton @click="getRecommendation">Get Recommendation</UButton>
  </div>

  <div v-for="recipe in recommendations" :key="recipe.id" class="border p-4 m-2">
    <div class="flex justify-items-start space-x-5">
      <img v-if="recipe.img_src" :src="recipe.img_src" class="w-40 mt-2" />
      <NuxtLink :to="`/recipes/${recipe.id}`">{{ recipe.name }}</NuxtLink>
    </div>

    <p class="p-2">{{ recipe.ingredients }}</p>
    <div v-if="strictMode">
      <p v-if="recipe.missing_count" class="text-pink-700">
        Missing ingredients: {{ recipe.missing_count }}
      </p>

      <ul v-if="recipe.missing_ingredients?.length">
        <li v-for="ing in recipe.missing_ingredients" :key="ing">
          🛒 {{ ing }}
        </li>
      </ul>
    </div>
  </div>
</template>
