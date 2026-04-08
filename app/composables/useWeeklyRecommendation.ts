import { ref } from 'vue';
import type { WeeklyRecommendation } from '~/types/weeklyRecommendation';

export const useWeeklyRecommendation = () => {

  // State
  const weeklyRecommendation = ref<WeeklyRecommendation | null>(null);
  const weeklyRecommendations = ref<WeeklyRecommendation[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const retryCount = ref<number>(0);
  const MAX_RETRIES = 3;
  let lastFetchedUserId: number | null = null;

  // Fetch weekly recommendation for a user with retry logic
  const fetchWeeklyRecommendation = async (userId: number): Promise<WeeklyRecommendation | null> => {
    // Prevent multiple simultaneous requests for the same user
    if (loading.value && lastFetchedUserId === userId) {
      console.log('Already fetching for this user, skipping duplicate request');
      return weeklyRecommendation.value;
    }

    loading.value = true;
    error.value = null;
    lastFetchedUserId = userId;

    try {
      console.log(`Fetching weekly recommendation for user ${userId} (attempt ${retryCount.value + 1})`);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const data = await $fetch<WeeklyRecommendation>(
        `http://localhost:8080/user/${userId}/weekly-recommendation`,
        {
          signal: controller.signal,
          retry: 2, // Built-in retry
          retryDelay: 500,
        }
      );

      clearTimeout(timeoutId);

      if (data) {
        weeklyRecommendation.value = data;
        console.log('Weekly recommendation received and stored:', data);
      } else {
        console.warn('No data returned from API');
        error.value = 'No recommendation available this week';
      }

      retryCount.value = 0; // Reset retry count on success
      return data || null;

    } catch (err: any) {
      console.error('Error fetching weekly recommendation:', err);

      // Determine error message
      let errorMessage = 'Failed to fetch weekly recommendation';
      if (err?.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err?.statusCode === 404) {
        errorMessage = 'No recommendation available this week';
        // Don't retry on 404
        retryCount.value = MAX_RETRIES;
      } else if (err?.statusCode === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      error.value = errorMessage;

      // Retry logic for network errors (not for 404)
      if (retryCount.value < MAX_RETRIES && (!err?.statusCode || err.statusCode !== 404)) {
        retryCount.value++;
        console.log(`Retrying in 1 second... (${retryCount.value}/${MAX_RETRIES})`);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Recursive retry
        return fetchWeeklyRecommendation(userId);
      }

      retryCount.value = 0;
      return null;

    } finally {
      loading.value = false;
    }
  };

  // Fetch all weekly recommendations for a user
  const fetchWeeklyRecommendations = async (userId: number): Promise<WeeklyRecommendation[]> => {
    if (!userId) return [];

    loading.value = true;
    error.value = null;

    try {
      console.log(`Fetching weekly recommendations for user ${userId}`);

      const data = await $fetch<WeeklyRecommendation[]>(
        `http://localhost:8080/user/${userId}/weekly-recommendations`
      );

      weeklyRecommendations.value = Array.isArray(data) ? data : [];
      console.log('Successfully fetched weekly recommendations:', weeklyRecommendations.value);
      return weeklyRecommendations.value;

    } catch (err) {
      console.error('Failed to fetch weekly recommendations:', err);
      error.value = 'Failed to fetch weekly recommendations';
      weeklyRecommendations.value = [];
      return [];

    } finally {
      loading.value = false;
    }
  };

  return {
    weeklyRecommendation,
    weeklyRecommendations,
    loading,
    error,
    retryCount,
    fetchWeeklyRecommendation,
    fetchWeeklyRecommendations,
  };
};
