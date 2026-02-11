<script setup lang="ts">

import type {Recommendation} from "~/types/Recommendation";

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
  <div class="flex">
    <NuxtLink to="/recipes">See all recipes</NuxtLink>
    <NuxtLink to="/auth" class="ml-auto">Login/Signup</NuxtLink>
  </div>

  <div class="flex flex-col items-center justify-center p-2">
    <UTextarea v-model="query" class="w-64" placeholder="Enter ingredients (e.g. I have chocolate, butter and eggs)"/>
    <UInputNumber  v-model="topK"/>

    <!-- Strict mode checkbox -->
    <div class="mb-4 flex items-center gap-2">
      <input type="checkbox" id="strict" v-model="strictMode" />
      <label for="strict">Strict mode (only recipes with exact ingredients)</label>
      <p>Strict mode value: {{ strictMode }}</p> <!-- DEBUG -->

    </div>

    <!-- Forbidden ingredients multi-select -->
    <div class="mb-4">
      <label class="block w-64 mb-1 font-medium">Forbidden ingredients:</label>
      <select
          v-model="forbiddenIngredients"
          multiple
          class="w-full border p-2 rounded"
      >
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
      <p v-if="recipe.missing_count " class="text-pink-700">
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
