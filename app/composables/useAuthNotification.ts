import { ref } from 'vue';

export const useAuthNotification = () => {
  const isNotificationVisible = ref(false);
  const notificationMessage = ref('');
  const notificationType = ref<'save' | 'bake'>('save');

  const showLoginPrompt = (type: 'save' | 'bake') => {
    notificationType.value = type;
    if (type === 'save') {
      notificationMessage.value = 'Sign in to save this recipe for later';
    } else {
      notificationMessage.value = 'Sign in to mark recipes as baked and track your journey';
    }
    isNotificationVisible.value = true;
  };

  const hideNotification = () => {
    isNotificationVisible.value = false;
  };

  return {
    isNotificationVisible,
    notificationMessage,
    notificationType,
    showLoginPrompt,
    hideNotification,
  };
};


