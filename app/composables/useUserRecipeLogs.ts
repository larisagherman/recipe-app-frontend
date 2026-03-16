import { ref } from 'vue';
import type { UserRecipeLog } from '~/types/userRecipeLog';
import type {UserSavedRecipeLog} from "~/types/userSavedRecipeLog";

export const useUserRecipeLogs = () => {
  const logs = ref<UserRecipeLog[]>([]);
  const loading = ref(false);
  const error = ref<unknown>(null);
  const savedRecipes = ref<UserSavedRecipeLog[]>([]);
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
  const getSavedRecipeLogs = async (userId: number) => {
    if (!userId) return;

    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<UserSavedRecipeLog[]>(`http://localhost:8080/user-saved-recipe-logs/${userId}`);
      savedRecipes.value = Array.isArray(data) ? data : [];
      console.log('Successfully fetched saved recipes:', savedRecipes.value);
    } catch (err) {
      console.error('Failed to fetch saved logs:', err);
      error.value = err;
      savedRecipes.value = [];
    } finally {
      loading.value = false;
    }
  };
  const addSavedRecipeLog = async(userId: number, recipeId: number) => {
    if (!userId) return;
    try {
      const newSavedLog = await $fetch<UserSavedRecipeLog>(`http://localhost:8080/user-saved-recipe-logs`, {
        method: 'POST',
        body: {
          userId: userId,
          recipeId: recipeId,
          savedAt: new Date().toISOString()
        }
      });
      savedRecipes.value = [...savedRecipes.value, newSavedLog];
      console.log("Successfully added new log");
    } catch(err) {
      console.error('Failed to add the new saved recipe log:', err);
    }
  }
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
      console.log("Successfully added new log");
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
      console.log("Successfully deleted log", logId);
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };
  const removeSavedRecipeLog = async (savedRecipeLogId: number) => {
    try {
      await $fetch(`http://localhost:8080/user-saved-recipe-logs/${savedRecipeLogId}`, {
        method: 'DELETE',
      });
      savedRecipes.value = savedRecipes.value.filter((log) => log.id !== savedRecipeLogId);
      console.log("Successfully deleted log", savedRecipeLogId);
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
  const isRecipeSaved = (recipeId: number) => {
    return savedRecipes.value.some((log) => log.recipeId === recipeId);
  };

  const toggleSavedRecipeLog = async (userId: number, recipeId: number) => {
    if (!userId) return;

    const existing = savedRecipes.value.find((log) => log.recipeId === recipeId);
    if (existing?.id) {
      await removeSavedRecipeLog(existing.id);
      return;
    }

    await addSavedRecipeLog(userId, recipeId);
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
    savedRecipes,
    getSavedRecipeLogs,
    addSavedRecipeLog,
    removeSavedRecipeLog,
    isRecipeSaved,
    toggleSavedRecipeLog
  };
};

