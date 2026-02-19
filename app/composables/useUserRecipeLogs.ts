import { ref } from 'vue';
import type { UserRecipeLog } from '~/types/userRecipeLog';

export const useUserRecipeLogs = () => {
  const { $user } = useNuxtApp();

  const logs = ref<UserRecipeLog[]>([]);
  const loading = ref(false);
  const error = ref<unknown>(null);

  const getUserRecipeLogs = async () => {
    if (!$user || !$user.value?.id) return; // safeguard

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
  const addUserRecipeLog = async(recipeId:number,cookedAt:string)=>{
    if (!$user || !$user.value?.id) return;
    try{
        const newLog = await $fetch<UserRecipeLog>(`http://localhost:8080/user-recipe-logs`,{method:
        'POST',
        body:{
        userId:$user.value?.id,
        recipeId:recipeId,
        cookedAt:cookedAt}
        })
      logs.value = [...logs.value, newLog];
      console.log("successfully added new log",newLog);
    }catch(err){
        console.error('Failed to add log:', err);
    }
  }

  const removeUserRecipeLog = async (logId: number) => {
    if (!$user || !$user.value?.id) return;
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

  const toggleUserRecipeLog = async (recipeId: number) => {
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
    await addUserRecipeLog(recipeId, cookedAt);
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
