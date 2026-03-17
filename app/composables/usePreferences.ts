import { ref, computed } from 'vue';
import type { UserPreferences } from '~/types/userPreferences';

const preferences = ref<UserPreferences | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

export const usePreferences = () => {
  const fetchPreferences = async (userId: number) => {
    if (!userId) return;

    loading.value = true;
    error.value = null;
    try {

      // For now, return empty preferences
      preferences.value = await $fetch<UserPreferences>(`http://localhost:8080/user-preferences/${userId}`);
      console.log('Successfully fetched preferences');

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch preferences';
    } finally {
      loading.value = false;
    }
  };

  const savePreferences = async (userPreferences: UserPreferences) => {
    loading.value = true;
    error.value = null;
    try {
      preferences.value = await $fetch<UserPreferences>(`http://localhost:8080/user-preferences`, {
        method: 'POST',
        body: userPreferences
      });
      console.log('Successfully saved preferences');

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save preferences';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!preferences.value) return;
    const updated = { ...preferences.value, ...updates };
    await savePreferences(updated);
  };

  return {
    preferences: computed(() => preferences.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchPreferences,
    savePreferences,
    updatePreferences
  };
};

