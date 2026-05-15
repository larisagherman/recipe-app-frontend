<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '~/composables/useAuth';

interface Props {
  isVisible: boolean;
  message: string;
  type: 'save' | 'bake';
}

interface Emits {
  (e: 'close'): void;
  (e: 'login'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { loginWithGoogle } = useAuth();

const titleText = computed(() => {
  return props.type === 'save' ? 'Save Recipe' : 'Track Your Baking';
});

const iconColor = computed(() => {
  return props.type === 'save' ? 'text-brand-600' : 'text-primary-950';
});

const iconBgColor = computed(() => {
  return props.type === 'save' ? 'bg-brand-100' : 'bg-primary-100';
});

const buttonGradient = computed(() => {
  return props.type === 'save'
    ? 'from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800'
    : 'from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800';
});

const handleLogin = () => {
  loginWithGoogle();
  emit('close');
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop - Blurred, semi-transparent -->
      <div
        @click="handleClose"
        class="absolute inset-0 backdrop-blur-sm bg-black/20 transition-opacity duration-300"
      ></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 animate-in">
        <!-- Close Button -->
        <button
          @click="handleClose"
          class="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <!-- Content -->
        <div class="text-center">
          <!-- Icon -->
          <div v-if="type === 'save'" :class="['w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center', iconBgColor, iconColor]">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </div>
          <div v-else :class="['w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center', iconBgColor, iconColor]">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <!-- Title -->
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ titleText }}</h2>

          <!-- Message -->
          <p class="text-gray-700 font-medium mb-4">{{ message }}</p>

          <!-- Subtext -->
          <p class="text-gray-500 text-sm mb-8 leading-relaxed">
            <span v-if="type === 'save'">
              Sign in to your account to save recipes, create collections, and access your favorites anytime.
            </span>
            <span v-else>
              Keep track of all the recipes you've baked and build your personal baking history.
            </span>
          </p>

          <!-- Buttons -->
          <div class="space-y-3">
            <button
              @click="handleLogin"
              :class="['w-full bg-gradient-to-r text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105', buttonGradient]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
            <button
              @click="handleClose"
              class="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active :deep(.relative) {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from :deep(.relative) {
  transform: scale(0.95);
  opacity: 0;
}

.animate-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: scale(0.95) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>





