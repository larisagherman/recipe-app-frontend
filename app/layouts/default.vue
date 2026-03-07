<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
    <AppHeader/>
    <slot/>
  </div>
</template>
<script setup lang="ts">
import AppHeader from "~/components/AppHeader.vue";
</script>