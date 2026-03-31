import { ref } from 'vue';
import type { WeeklyRecommendation } from '~/types/weeklyRecommendation';

export const useWeeklyRecommendation = () => {

  // State
  const weeklyRecommendation = ref<WeeklyRecommendation | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Fetch weekly recommendation for a user
  const fetchWeeklyRecommendation = async (userId: number) => {
    loading.value = true;
    error.value = null;
    try {
      console.log('Fetching weekly recommendation ');
      const data = await $fetch<WeeklyRecommendation>(`http://localhost:8080/weekly-recommendations/user/${userId}`);
      weeklyRecommendation.value = data;
      console.log('Weekly recommendation received:', data);
      return data;
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch weekly recommendation';
      console.error('Error fetching weekly recommendation:', err);
      // Don't throw, allow the card to display with error state
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    weeklyRecommendation,
    loading,
    error,
    fetchWeeklyRecommendation,
  };
};


