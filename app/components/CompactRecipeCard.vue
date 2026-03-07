<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { FullRecipe } from "~/types/fullRecipe";

const props = defineProps<{
  recipe: FullRecipe;
  isBaked: boolean;
  recipeNumber?: number;
}>();

const emit = defineEmits<{
  (event: "toggle-baked", recipeId: number): void;
}>();

const isOpen = ref(false);

const handleToggle = () => {
  emit("toggle-baked", props.recipe.id);
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <div class="compact-card-wrapper">
    <!-- Backdrop -->
    <div v-if="isOpen" class="backdrop" @click="isOpen = false"></div>

    <div
      class="compact-recipe-card"
      @click="isOpen = true"
    >
      <div v-if="recipeNumber" class="recipe-number">{{ recipeNumber }}</div>
      <div class="compact-card-content">
        <div v-if="!recipe.imgSrc" class="placeholder-image">
          <div class="placeholder-content">
            <img src="https://cdn-icons-png.flaticon.com/512/3081/3081949.png" alt="Cupcake" class="placeholder-icon" />
            <p class="placeholder-text">Image not found</p>
          </div>
        </div>
        <img v-else :src="recipe.imgSrc" :alt="recipe.name" class="compact-img" />
        <div class="compact-info">
          <h3 class="compact-title">{{ recipe.name }}</h3>
          <button
            @click.stop.prevent="handleToggle"
            :class="['compact-baked-btn', { baked: isBaked }]"
            :title="isBaked ? 'Mark as not baked' : 'Mark as baked'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon"
            >
              <path
                d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.003-.003.001a.752.752 0 01-.704 0l-.003-.001z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Card -->
    <div v-if="isOpen" class="hover-card" @click.stop>
      <div class="hover-card-header">
        <h2>{{ recipe.name }}</h2>
        <div class="header-actions">
          <button
            @click.stop.prevent="handleToggle"
            :class="['baked-btn', { baked: isBaked }]"
            :title="isBaked ? 'Mark as not baked' : 'Mark as baked'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon"
            >
              <path
                d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.003-.003.001a.752.752 0 01-.704 0l-.003-.001z"
              />
            </svg>
            <span class="baked-text">{{ isBaked ? "Baked!" : "Mark as Baked" }}</span>
          </button>
          <button
            @click.stop.prevent="isOpen = false"
            class="close-btn"
            title="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon"
            >
              <path
                fill-rule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <NuxtLink :to="`/recipes/${recipe.id}`">
        <div v-if="!recipe.imgSrc" class="placeholder-image-large">
          <div class="placeholder-content">
            <img src="https://cdn-icons-png.flaticon.com/512/3081/3081949.png" alt="Cupcake" class="placeholder-icon-large" />
            <p class="placeholder-text-large">Image not found</p>
          </div>
        </div>
        <img v-else :src="recipe.imgSrc" :alt="recipe.name" class="hover-img" />
      </NuxtLink>
      <div class="hover-details">
        <p v-if="recipe.prepTime || recipe.cookTime">
          <strong>Prep Time:</strong> {{ recipe.prepTime }} |
          <strong>Cook Time:</strong> {{ recipe.cookTime }}
        </p>
        <p v-if="recipe.servings"><strong>Servings:</strong> {{ recipe.servings }}</p>
        <h3 v-if="recipe.ingredients">Ingredients:</h3>
        <pre v-if="recipe.ingredients" class="ingredients-text">{{ recipe.ingredients }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compact-card-wrapper {
  position: relative;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeInBackdrop 0.2s ease;
}

@keyframes fadeInBackdrop {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.compact-recipe-card {
  position: relative;
  display: block;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 280px;
  background: white;
}

.recipe-number {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-primary-600);
  color: white;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.compact-recipe-card:hover {
  border-color: var(--color-primary-600);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.compact-card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.compact-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.placeholder-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #92400e;
  margin: 0;
}

.compact-info {
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.compact-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

.compact-baked-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background-color: transparent;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
}

.compact-baked-btn:hover {
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
}

.compact-baked-btn.baked {
  border-color: var(--color-primary-600);
  background-color: var(--color-primary-600);
  color: white;
}

.compact-baked-btn.baked:hover {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.compact-baked-btn .icon {
  width: 1rem;
  height: 1rem;
}

/* Hover Card */
.hover-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  border: 2px solid var(--color-primary-600);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.hover-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.hover-card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  flex: 1;
  margin-right: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #ef4444;
}

.close-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.hover-img {
  width: 100%;
  height: 350px;
  object-fit: cover;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.hover-img:hover {
  opacity: 0.95;
}

.placeholder-image-large {
  width: 100%;
  height: 350px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.placeholder-image-large:hover {
  opacity: 0.95;
}

.placeholder-icon-large {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.placeholder-text-large {
  font-size: 1.125rem;
  font-weight: 500;
  color: #92400e;
  margin: 0;
}

.hover-details {
  padding: 1.5rem;
}

.hover-details p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.hover-details h3 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.ingredients-text {
  font-size: 0.875rem;
  white-space: pre-wrap;
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 6px;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.baked-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.baked-btn:hover {
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
}

.baked-btn.baked {
  border-color: var(--color-primary-600);
  background-color: var(--color-primary-600);
  color: white;
}

.baked-btn.baked:hover {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.baked-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.baked-text {
  white-space: nowrap;
}
</style>










