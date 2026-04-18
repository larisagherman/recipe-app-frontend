<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

interface Props {
  recipeId: number;
  userId: string;
  recipeName?: string;
  isGenerated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  recipeName: 'Recipe',
  isGenerated: false,
});

console.log('🔍 BakeAlongChat props.isGenerated:', props.isGenerated, 'Type:', typeof props.isGenerated);

const { state, connect, disconnect, sendMessage, clearMessages } = useBakeAlongChat(
  props.recipeId,
  props.userId,
  props.isGenerated
);

const inputMessage = ref('');
const isOpen = ref(false);
const messagesContainer = ref<HTMLDivElement>();

const isChatReady = computed(() => state.isConnected);

const handleSendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  const message = inputMessage.value.trim();
  inputMessage.value = '';

  await sendMessage(message);

  // Scroll to bottom after new message
  await nextTick();
  scrollToBottom();
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};

const startChat = async () => {
  const connected = await connect();
  if (connected) {
    isOpen.value = true;
    await nextTick();
    scrollToBottom();
  }
};

const closeChat = () => {
  isOpen.value = false;
  disconnect();
  clearMessages();
};

onMounted(() => {
  // Don't auto-connect, wait for user to click "Start chat"
});

onUnmounted(() => {
  disconnect();
});
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Chat Button -->
    <button
      v-if="!isOpen"
      @click="startChat"
      :class="[
        'flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 transform hover:scale-105',
        isChatReady || !state.isConnected
          ? 'bg-brand-500 text-white hover:shadow-xl'
          : 'bg-neutral-400 text-white cursor-not-allowed'
      ]"
      :disabled="state.isLoading"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-5 h-5"
      >
        <path
          d="M15.375 12a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z"
        />
      </svg>
      <span class="hidden sm:inline">Bake Along with AI</span>
      <span class="sm:hidden">Chat</span>
    </button>

    <!-- Chat Window -->
    <div
      v-if="isOpen"
      class="fixed bottom-24 right-6 w-96 max-w-[90vw] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <!-- Header -->
      <div class="bg-brand-500 text-white p-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path d="M2 12.5c0 .621.504 1.125 1.125 1.125h1.6L8 19.77c.308.618 1.014.999 1.764.999.75 0 1.456-.381 1.764-.999l2.675-5.145h1.6c.621 0 1.125-.504 1.125-1.125v-3c0-.621-.504-1.125-1.125-1.125h-1.6L11.529 4.23c-.308-.618-1.014-.999-1.764-.999-.75 0-1.456.381-1.764.999L4.726 9.375H3.125C2.504 9.375 2 9.879 2 10.5v2z" />
          </svg>
          <div>
            <h3 class="font-bold">Baking Assistant</h3>
            <p class="text-sm text-orange-50">{{ recipeName }}</p>
          </div>
        </div>
        <button
          @click="closeChat"
          class="p-1 hover:bg-secondary-600 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="w-5 h-5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Status Message -->
      <div v-if="!state.isConnected && state.error" class="bg-danger-50 border-b border-danger-200 px-4 py-2">
        <p class="text-sm text-danger-700">{{ state.error }}</p>
      </div>

      <div v-if="!state.isConnected && !state.error" class="bg-warning-50 border-b border-warning-200 px-4 py-2">
        <p class="text-sm text-warning-700">Connecting to chat...</p>
      </div>

      <!-- Messages Container -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 bg-brand-50 space-y-4"
      >
        <!-- Welcome Message -->
        <div
          v-if="state.messages.length === 0"
          class="flex justify-center items-center h-full"
        >
          <div class="text-center">
            <div class="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-8 h-8 text-brand-500"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <p class="text-gray-600 font-medium">Hi! I'm your baking assistant.</p>
            <p class="text-sm text-gray-500 mt-2">Ask me anything about this recipe!</p>
          </div>
        </div>

        <!-- Messages -->
        <div
          v-for="(msg, index) in state.messages"
          :key="index"
          :class="[
            'flex',
            msg.type === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-xs px-4 py-2 rounded-lg text-sm',
              msg.type === 'user'
                ? 'bg-brand-500 text-white rounded-br-none'
                : msg.type === 'ai'
                ? 'bg-brand-50 text-primary-950 border border-brand-200 rounded-bl-none'
                : msg.type === 'hint'
                ? 'bg-info-50 text-info-900 border border-info-200 rounded-bl-none'
                : 'bg-neutral-100 text-neutral-700 rounded-bl-none'
            ]"
          >
            <p class="leading-relaxed">{{ msg.message }}</p>
            <p v-if="msg.timestamp" class="text-xs opacity-70 mt-1">
              {{ new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="state.isLoading" class="flex justify-start">
          <div class="bg-brand-50 text-primary-950 border border-brand-200 px-4 py-2 rounded-lg rounded-bl-none">
            <div class="flex gap-2">
              <div class="w-2 h-2 bg-brand-400 rounded-full animate-bounce" />
              <div class="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style="animation-delay: 0.1s" />
              <div class="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style="animation-delay: 0.2s" />
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="border-t border-brand-200 bg-white p-4">
        <div v-if="!state.isConnected" class="text-center text-sm text-neutral-500 mb-2">
          Connecting...
        </div>
        <div class="flex gap-2">
          <textarea
            v-model="inputMessage"
            @keydown="handleKeydown"
            :disabled="!state.isConnected"
            placeholder="Ask me anything about the recipe..."
            class="flex-1 px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none max-h-24 disabled:bg-neutral-100 disabled:cursor-not-allowed"
            rows="1"
          />
          <button
            @click="handleSendMessage"
            :disabled="!state.isConnected || !inputMessage.trim() || state.isLoading"
            class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-5 h-5"
            >
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.9429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.97721575 L3.03521743,10.4182088 C3.03521743,10.5753061 3.34915502,10.7324035 3.50612381,10.7324035 L16.6915026,11.5178905 C16.6915026,11.5178905 17.1624089,11.5178905 17.1624089,12.0429225 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-in-from-bottom-4 {
  from {
    opacity: 0;
    transform: translate(0, 16px);
  }
  to {
    opacity: 1;
    transform: translate(0, 0);
  }
}

.animate-in {
  animation: slide-in-from-bottom-4 0.3s ease-out;
}

.fade-in {
  opacity: 1;
}
</style>



