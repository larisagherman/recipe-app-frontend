import { ref } from 'vue';
import type { UserRecipeLog } from '~/types/userRecipeLog';

export const useUserRecipeLogs = () => {
  const logs = ref<UserRecipeLog[]>([]);
  const loading = ref(false);
  const error = ref<unknown>(null);

  const getUserRecipeLogs = async (userId: number) => {
    if (!userId) return;

    loading.value = true;
    error.value = null;

    try {
      logs.value = await $fetch<UserRecipeLog[]>(
          `http://localhost:8080/user-recipe-logs/${userId}`
      );

      console.log('Successfully fetched logs:', logs.value);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  const addUserRecipeLog = async(userId: number, recipeId: number, cookedAt: string) => {
    if (!userId) return;
    try {
      const newLog = await $fetch<UserRecipeLog>(`http://localhost:8080/user-recipe-logs`, {
        method: 'POST',
        body: {
          userId: userId,
          recipeId: recipeId,
          cookedAt: cookedAt
        }
      });
      logs.value = [...logs.value, newLog];
      console.log("successfully added new log", newLog);
    } catch(err) {
      console.error('Failed to add log:', err);
    }
  }

  const removeUserRecipeLog = async (logId: number) => {
    try {
      await $fetch(`http://localhost:8080/user-recipe-logs/${logId}`, {
        method: 'DELETE',
      });
      logs.value = logs.value.filter((log) => log.id !== logId);
      console.log("successfully deleted log", logId);
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };

  const isRecipeBaked = (recipeId: number) => {
    return logs.value.some((log) => log.recipeId === recipeId);
  };

  const toggleUserRecipeLog = async (userId: number, recipeId: number) => {
    if (!userId) return;

    const existing = logs.value.find((log) => log.recipeId === recipeId);
    if (existing?.id) {
      if (process.client) {
        const ok = window.confirm('Remove this recipe from your baked list?');
        if (!ok) return;
      }
      await removeUserRecipeLog(existing.id);
      return;
    }

    const cookedAt = new Date().toISOString();
    await addUserRecipeLog(userId, recipeId, cookedAt);
  };

  return {
    logs,
    loading,
    error,
    getUserRecipeLogs,
    addUserRecipeLog,
    removeUserRecipeLog,
    isRecipeBaked,
    toggleUserRecipeLog,
  };
};

