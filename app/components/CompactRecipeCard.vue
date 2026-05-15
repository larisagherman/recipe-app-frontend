<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import type { FullRecipe } from "~/types/fullRecipe";
import { useAuth } from '~/composables/useAuth';

const props = defineProps<{
  recipe: FullRecipe;
  isBaked: boolean;
  isSaved?: boolean;
  recipeNumber?: number;
}>();

const emit = defineEmits<{
  (event: "toggle-baked", recipeId: number): void;
  (event: "toggle-saved", recipeId: number): void;
  (event: "show-login-prompt", type: 'save' | 'bake'): void;
}>();

const { user } = useAuth();
const isOpen = ref(false);

const handleToggle = () => {
  if (!user.value?.id) {
    emit("show-login-prompt", 'bake');
    return;
  }
  emit("toggle-baked", props.recipe.id);
};

const handleToggleSave = () => {
  if (!user.value?.id) {
    emit("show-login-prompt", 'save');
    return;
  }
  emit("toggle-saved", props.recipe.id);
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
  }
};

// Prevent body scroll when modal is open
watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="compact-card-wrapper">

    <!-- Compact Card Preview -->
    <div
      class="compact-recipe-card"
      @click="isOpen = true"
    >
      <div class="compact-card-content">
        <div v-if="!recipe.imgSrc" class="placeholder-image">
          <div class="placeholder-content">
            <img src="https://cdn-icons-png.flaticon.com/512/3081/3081949.png" alt="Cupcake" class="placeholder-icon" />
            <p class="placeholder-text">Image not found</p>
          </div>
        </div>
        <img v-else :src="recipe.imgSrc" :alt="recipe.name" class="compact-img" />
        <div v-if="recipeNumber" class="recipe-number">{{ recipeNumber }}</div>

        <div class="compact-info">
          <h3 class="compact-title">{{ recipe.name }}</h3>
          <div class="compact-actions">
             <button
                 @click.stop.prevent="handleToggle"
                 :class="['compact-icon-btn', { baked: props.isBaked }]"
                 :title="props.isBaked ? 'Mark as not baked' : 'Mark as baked'"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                 <polyline points="20 6 9 17 4 12" />
               </svg>
             </button>
            <button
              @click.stop.prevent="handleToggleSave"
              :class="['compact-icon-btn', { saved: props.isSaved }]"
              :title="props.isSaved ? 'Remove from saved' : 'Save recipe'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            </button>

          </div>
        </div>
      </div>
    </div>

    <!-- Modal Overlay (Backdrop + Card) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isOpen" class="modal-overlay" @click="isOpen = false">
          <!-- Modal Card -->
          <div class="hover-card" @click.stop>
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
                     fill="none"
                     stroke="currentColor"
                     stroke-width="2"
                     class="icon"
                   >
                     <polyline points="20 6 9 17 4 12" />
                   </svg>
                   <span class="baked-text">{{ isBaked ? "Baked!" : "Mark as Baked" }}</span>
                 </button>
                <button
                    @click.stop.prevent="handleToggleSave"
                    :class="['action-btn', { saved: props.isSaved }]"
                    :title="props.isSaved ? 'Remove from saved' : 'Save recipe'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
                    <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                  <span class="action-text">{{ props.isSaved ? "Saved" : "Save" }}</span>
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
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.compact-card-wrapper {
  position: relative;
}

/* Modal Overlay (Backdrop) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  cursor: pointer;
  overflow-y: auto;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .hover-card,
.modal-leave-active .hover-card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .hover-card,
.modal-leave-to .hover-card {
  transform: scale(0.9);
  opacity: 0;
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
  left: 8px;
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
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.75rem;
  flex: 1;
}

.compact-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  flex: 1;
}

.compact-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.compact-icon-btn {
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

.compact-icon-btn:hover {
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
}

.compact-icon-btn.baked {
  border-color: var(--color-primary-600);
  background-color: var(--color-primary-600);
  color: white;
}

.compact-icon-btn.baked:hover {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.compact-icon-btn.saved {
  border-color: var(--color-primary-600);
  background-color: var(--color-primary-600);
  color: white;
}

.compact-icon-btn.saved:hover {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.compact-icon-btn svg {
  width: 1rem;
  height: 1rem;
}

/* Hover Card Modal */
.hover-card {
  position: relative;
  width: 700px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border: none;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  cursor: default;
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

.action-btn {
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

.action-btn:hover {
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
}

.action-btn.saved {
  border-color: var(--color-primary-600);
  background-color: var(--color-primary-600);
  color: white;
}

.action-btn.saved:hover {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.action-text {
  white-space: nowrap;
}

.action-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .hover-card {
    width: 95vw;
    max-height: 95vh;
    border-radius: 12px;
  }

  .hover-card-header h2 {
    font-size: 1.25rem;
  }

  .hover-img,
  .placeholder-image-large {
    height: 250px;
  }

  .hover-details {
    padding: 1rem;
  }

  .baked-text {
    display: none;
  }

  .baked-btn {
    padding: 0.5rem;
    min-width: 36px;
  }
}
</style>










