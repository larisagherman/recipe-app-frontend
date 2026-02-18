<script setup lang="ts">
const { getUserRecipeLogs, logs } = useUserRecipeLogs();
const {user}=useAuth();
watch(
  () => user?.value?.id,
  async (id) => {
    if (!id) return;
    await getUserRecipeLogs();
    console.log('User ID:', id);
  },
  { immediate: true }
);
</script>

<template>
  <NuxtLink to="/" class="text-amber-700">Home</NuxtLink>
  <div>
    <h1>User recipe logs</h1>

    <div v-if="!logs.length">No logs yet</div>

    <ul>
      <li v-for="log in logs" :key="log.recipeId">
        Recipe {{ log.recipeId }} cooked at {{ log.cookedAt }}
      </li>
    </ul>
  </div>
</template>
