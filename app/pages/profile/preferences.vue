<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { usePreferences } from '~/composables/usePreferences';
import {
  DIETARY_TYPES,
  ALLERGIES,
  DISLIKED_INGREDIENTS,
  FLAVOR_PREFERENCES,
  TASTE_PREFERENCES
} from '~/types/userPreferences';
import type { UserPreferences } from '~/types/userPreferences';

const { user, isLoggedIn } = useAuth();
const { preferences, loading, error, fetchPreferences, savePreferences,updatePreferences } = usePreferences();
const router = useRouter();

const authChecked = ref(false);
const saving = ref(false);
const saveSuccess = ref(false);

// Form state
const formData = ref<Partial<UserPreferences>>({
  dietaryTypes: [],
  dietaryStrict: false,
  allergies: [],
  severeAllergies: [],
  dislikedIngredients: [],
  tastePreferences: null,
  flavourPreferences: []
});

const customDisliked = ref('');

// Wait for auth state to be checked before redirecting
onMounted(() => {
  const timeout = setTimeout(() => {
    authChecked.value = true;
    if (!isLoggedIn.value) {
      router.push('/');
    }
  }, 1000);

  let stopWatch: (() => void) | null = null;
  stopWatch = watch(user, (newUser) => {
    if (newUser) {
      authChecked.value = true;
      clearTimeout(timeout);
      if (stopWatch) stopWatch();
    }
  }, { immediate: true });
});

// Load preferences when user is available
watch(
  () => user.value?.id,
  async (userId) => {
    if (!userId) return;
    await fetchPreferences(userId);
    if (preferences.value) {
      formData.value = { ...preferences.value };
    }
  },
  { immediate: true }
);

const toggleDietaryType = (type: string) => {
  if (!formData.value.dietaryTypes) formData.value.dietaryTypes = [];
  const index = formData.value.dietaryTypes.indexOf(type);
  if (index > -1) {
    formData.value.dietaryTypes.splice(index, 1);
  } else {
    formData.value.dietaryTypes.push(type);
  }
};

const toggleAllergy = (allergy: string) => {
  if (!formData.value.allergies) formData.value.allergies = [];
  const index = formData.value.allergies.indexOf(allergy);
  if (index > -1) {
    formData.value.allergies.splice(index, 1);
    // Also remove from severe if present
    if (formData.value.severeAllergies) {
      const severeIndex = formData.value.severeAllergies.indexOf(allergy);
      if (severeIndex > -1) {
        formData.value.severeAllergies.splice(severeIndex, 1);
      }
    }
  } else {
    formData.value.allergies.push(allergy);
  }
};

const toggleSevereAllergy = (allergy: string) => {
  if (!formData.value.severeAllergies) formData.value.severeAllergies = [];
  const index = formData.value.severeAllergies.indexOf(allergy);
  if (index > -1) {
    formData.value.severeAllergies.splice(index, 1);
  } else {
    // Ensure it's also in regular allergies
    if (!formData.value.allergies?.includes(allergy)) {
      if (!formData.value.allergies) formData.value.allergies = [];
      formData.value.allergies.push(allergy);
    }
    formData.value.severeAllergies.push(allergy);
  }
};

const toggleFlavourProfile = (profile: string) => {
  if (!formData.value.flavourPreferences) formData.value.flavourPreferences = [];
  const index = formData.value.flavourPreferences.indexOf(profile);
  if (index > -1) {
    formData.value.flavourPreferences.splice(index, 1);
  } else {
    formData.value.flavourPreferences.push(profile);
  }
};

const addCustomDisliked = () => {
  if (customDisliked.value.trim()) {
    if (!formData.value.dislikedIngredients) formData.value.dislikedIngredients = [];
    if (!formData.value.dislikedIngredients.includes(customDisliked.value)) {
      formData.value.dislikedIngredients.push(customDisliked.value);
    }
    customDisliked.value = '';
  }
};

const removeDisliked = (ingredient: string) => {
  if (formData.value.dislikedIngredients) {
    const index = formData.value.dislikedIngredients.indexOf(ingredient);
    if (index > -1) {
      formData.value.dislikedIngredients.splice(index, 1);
    }
  }
};

const handleSubmit = async () => {
  if (!user.value?.id) return;
  if(preferences.value){
    saving.value = true;
    saveSuccess.value = false;
    try {
      const preferencesToSave: UserPreferences = {
        userId: user.value.id,
        dietaryTypes: formData.value.dietaryTypes || [],
        dietaryStrict: formData.value.dietaryStrict || false,
        allergies: formData.value.allergies || [],
        severeAllergies: formData.value.severeAllergies || [],
        dislikedIngredients: formData.value.dislikedIngredients || [],
        tastePreferences: formData.value.tastePreferences || null,
        flavourPreferences: formData.value.flavourPreferences || [],
        updatedAt: new Date().toISOString()
      };

      await updatePreferences(preferencesToSave);
      saveSuccess.value = true;
    console.log('Preferences updated successfully:', preferencesToSave);
      // Reset success message after 3 seconds and go back to profile
      setTimeout(() => {
        saveSuccess.value = false;
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      saving.value = false;
    }
  }else{
    saving.value = true;
    saveSuccess.value = false;
    try {
      const preferencesToSave: UserPreferences = {
        userId: user.value.id,
        dietaryTypes: formData.value.dietaryTypes || [],
        dietaryStrict: formData.value.dietaryStrict || false,
        allergies: formData.value.allergies || [],
        severeAllergies: formData.value.severeAllergies || [],
        dislikedIngredients: formData.value.dislikedIngredients || [],
        tastePreferences: formData.value.tastePreferences || null,
        flavourPreferences: formData.value.flavourPreferences || [],
        updatedAt: new Date().toISOString()
      };

      await savePreferences(preferencesToSave);
      saveSuccess.value = true;

      // Reset success message after 3 seconds and go back to profile
      setTimeout(() => {
        saveSuccess.value = false;
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      saving.value = false;
    }
  }


};
</script>

<template>
  <!-- Loading state while checking auth -->
  <div v-if="!authChecked" class="min-h-screen flex items-center justify-center bg-white">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading your preferences...</p>
    </div>
  </div>

  <!-- Main content -->
  <div v-else class="min-h-screen bg-white p-6">
    <!-- Back Button (Under Navbar) -->
    <div class="mb-6">
      <NuxtLink
          to="/profile"
          class="inline-flex items-center gap-2 text-primary-700 hover:text-primary-900 font-medium transition-colors"
      >
        <span>←</span>
        <span>Back to Profile</span>
      </NuxtLink>
    </div>
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-primary-950 mb-2">Your Baking Preferences</h1>
        <p class="text-primary-700">Customize your recipe recommendations by telling us about your dietary needs and taste preferences</p>
      </div>

      <!-- Success message -->
      <div
        v-if="saveSuccess"
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
      >
        <span class="text-2xl">✅</span>
        <p class="text-green-800">Your preferences have been saved successfully!</p>
      </div>

      <!-- Error message -->
      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
      >
        <span class="text-2xl">❌</span>
        <p class="text-red-800">{{ error }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Section 1: Dietary Types -->
        <section class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-400 hover:shadow-lg transition-all">
          <h2 class="text-xl font-bold text-primary-950 mb-4">Dietary Type</h2>
          <p class="text-primary-700 text-sm mb-4">Select one or more dietary preferences</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div v-for="type in DIETARY_TYPES" :key="type" class="flex items-center">
              <input
                :id="`dietary-${type}`"
                type="checkbox"
                :checked="formData.dietaryTypes?.includes(type)"
                @change="toggleDietaryType(type)"
                class="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-400 cursor-pointer"
              />
              <label :for="`dietary-${type}`" class="ml-3 text-primary-900 cursor-pointer font-medium">
                {{ type }}
              </label>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <input
              id="dietary-strict"
              type="checkbox"
              v-model="formData.dietaryStrict"
              class="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-400 cursor-pointer"
            />
            <label for="dietary-strict" class="text-primary-900 cursor-pointer text-sm">
              <strong>Strict mode:</strong> Only recommend recipes matching my dietary choices
            </label>
          </div>
        </section>

        <!-- Section 2: Allergies & Restrictions -->
        <section class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-400 hover:shadow-lg transition-all">
          <h2 class="text-xl font-bold text-primary-950 mb-4">Allergies & Critical Restrictions</h2>
          <p class="text-primary-700 text-sm mb-4">Tell us what you're allergic to so we never recommend it</p>

          <div class="space-y-3">
            <div v-for="allergy in ALLERGIES" :key="allergy" class="space-y-2">
              <div class="flex items-center gap-2">
                <input
                  :id="`allergy-${allergy}`"
                  type="checkbox"
                  :checked="formData.allergies?.includes(allergy)"
                  @change="toggleAllergy(allergy)"
                  class="w-4 h-4 text-red-500 rounded focus:ring-2 focus:ring-red-400 cursor-pointer"
                />
                <label :for="`allergy-${allergy}`" class="text-primary-900 cursor-pointer font-medium">
                  {{ allergy }}
                </label>
              </div>

              <!-- Severe allergy toggle for selected allergies -->
              <div
                v-if="formData.allergies?.includes(allergy)"
                class="ml-8 flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200"
              >
                <input
                  :id="`severe-${allergy}`"
                  type="checkbox"
                  :checked="formData.severeAllergies?.includes(allergy)"
                  @change="toggleSevereAllergy(allergy)"
                  class="w-4 h-4 text-red-500 rounded focus:ring-2 focus:ring-red-400 cursor-pointer"
                />
                <label :for="`severe-${allergy}`" class="text-red-700 cursor-pointer text-sm font-semibold">
                  Mark as SEVERE (never recommend)
                </label>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3: Ingredient Avoidance -->
        <section class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400 hover:shadow-lg transition-all">
          <h2 class="text-xl font-bold text-primary-950 mb-4">Ingredient Avoidance (Dislikes)</h2>
          <p class="text-primary-700 text-sm mb-4">These are ingredients you simply don't like (not allergies)</p>

          <!-- Predefined dislikes -->
          <div class="mb-6">
            <p class="text-sm font-semibold text-primary-900 mb-3">Common dislikes:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="ingredient in DISLIKED_INGREDIENTS" :key="ingredient" class="flex items-center">
                <input
                  :id="`disliked-${ingredient}`"
                  type="checkbox"
                  :checked="formData.dislikedIngredients?.includes(ingredient)"
                  @change="(e) => {
                    if ((e.target as HTMLInputElement).checked) {
                      if (!formData.dislikedIngredients) formData.dislikedIngredients = [];
                      formData.dislikedIngredients.push(ingredient);
                    } else {
                      removeDisliked(ingredient);
                    }
                  }"
                  class="w-4 h-4 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                />
                <label :for="`disliked-${ingredient}`" class="ml-3 text-primary-900 cursor-pointer font-medium">
                  {{ ingredient }}
                </label>
              </div>
            </div>
          </div>

          <!-- Custom ingredient input -->
          <div class="border-t border-gray-200 pt-4">
            <p class="text-sm font-semibold text-primary-900 mb-3">Add custom ingredients you dislike:</p>
            <div class="flex gap-2 mb-3">
              <input
                v-model="customDisliked"
                @keyup.enter="addCustomDisliked"
                type="text"
                placeholder="e.g., Licorice, Olives, etc."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-primary-900"
              />
              <button
                type="button"
                @click="addCustomDisliked"
                class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-semibold"
              >
                Add
              </button>
            </div>

            <!-- Custom ingredients list -->
            <div v-if="formData.dislikedIngredients && formData.dislikedIngredients.length" class="flex flex-wrap gap-2">
              <div
                v-for="ingredient in formData.dislikedIngredients"
                :key="ingredient"
                class="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-300"
              >
                <span>{{ ingredient }}</span>
                <button
                  type="button"
                  @click="removeDisliked(ingredient)"
                  class="ml-1 font-bold hover:text-yellow-900 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4: Sweetness Level -->
        <section class="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-400 hover:shadow-lg transition-all">
          <h2 class="text-xl font-bold text-primary-950 mb-4">Sweetness Level</h2>
          <p class="text-primary-700 text-sm mb-6">How sweet do you like your baked goods?</p>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="level in TASTE_PREFERENCES"
              :key="level.value"
              type="button"
              @click="formData.tastePreferences = level.value as any"
              :class="[
                'px-6 py-2 rounded-full font-medium transition-all duration-200 border-2 text-sm',
                formData.tastePreferences === level.value
                  ? 'bg-pink-500 text-white border-pink-600 shadow-md'
                  : 'bg-white text-primary-900 border-pink-200 hover:border-pink-400 hover:bg-pink-50'
              ]"
            >
              {{ level.label }}
            </button>
          </div>
        </section>

        <!-- Section 5: Flavor Profiles -->
        <section class="bg-white rounded-lg shadow-md p-6 border-l-4 border-violet-400 hover:shadow-lg transition-all">
          <h2 class="text-xl font-bold text-primary-950 mb-4">Flavor Profiles</h2>
          <p class="text-primary-700 text-sm mb-4">What flavors do you enjoy in baked goods? (Select multiple)</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="profile in FLAVOR_PREFERENCES" :key="profile" class="flex items-center">
              <input
                :id="`flavor-${profile}`"
                type="checkbox"
                :checked="formData.flavourPreferences?.includes(profile)"
                @change="toggleFlavourProfile(profile)"
                class="w-4 h-4 text-violet-500 rounded focus:ring-2 focus:ring-violet-400 cursor-pointer"
              />
              <label :for="`flavor-${profile}`" class="ml-3 text-primary-900 cursor-pointer font-medium">
                {{ profile }}
              </label>
            </div>
          </div>
        </section>

        <!-- Submit Button -->
        <div class="flex gap-3 pt-6 pb-12">
          <button
            type="submit"
            :disabled="saving || loading"
            class="flex-1 px-6 py-3 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            <span v-if="saving" class="flex items-center justify-center gap-2">
              <span class="animate-spin">⏳</span>
              Saving...
            </span>
            <span v-else>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
input[type="checkbox"] {
  accent-color: currentColor;
}
</style>
