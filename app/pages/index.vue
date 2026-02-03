<script setup lang="ts">
type Recommendation = {
  id:number,
  name: string
  ingredients: string
}
const recommendations = ref<Recommendation[]>([])

const query= ref('')
const topK=ref()
const getRecommendation = async () => {
  recommendations.value=await $fetch('http://localhost:8080/recommend',
      {
        method:'POST',
        body:{
          query: query.value,
          topK: topK.value
        }
      })
}
</script>
<template>
  <NuxtLink to="/recipes">See all recipes</NuxtLink>

  <div class="flex flex-col items-center justify-center p-2">
    <UTextarea v-model="query" placeholder="Enter ingredients (e.g. I have chocolate, butter and eggs)"/>
    <UButton @click="getRecommendation">Get Recommendation</UButton>
  </div>
  <div v-for="recipe in recommendations" :key="recipe.name">
    <NuxtLink :to="`/recipes/${recipe.id}`">{{ recipe.name }}</NuxtLink>
      <p class="p-2">{{recipe.ingredients}}</p>
  </div>
</template>
