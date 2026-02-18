import { ref } from 'vue';
import type { UserRecipeLog } from '~/types/userRecipeLog';

export const useUserRecipeLogs = () => {
  const { $user } = useNuxtApp();

  const logs = ref<UserRecipeLog[]>([]);
  const loading = ref(false);
  const error = ref<unknown>(null);

  const getUserRecipeLogs = async () => {
    if (!$user || !$user.value?.id) return; // safe guard

    loading.value = true;
    error.value = null;

    try {
      const fetchedLogs = await $fetch<UserRecipeLog[]>(
          `http://localhost:8080/user-recipe-logs/${$user.value.id}`
      );

      logs.value = fetchedLogs; // $fetch returns plain data
      console.log('Successfully fetched logs:', logs.value);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return { logs, loading, error, getUserRecipeLogs };
};
