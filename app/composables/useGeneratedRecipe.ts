import { ref, computed } from 'vue'
import type { FullRecipe } from '~/types/fullRecipe'

export const useGeneratedRecipe = () => {

  // State
  const recipe = ref<FullRecipe | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Parse ingredients into individual items
  const parsedIngredients = computed(() => {
    if (!recipe.value?.ingredients) return []

    const ingredientsStr = recipe.value.ingredients

    const items: string[] = []
    let currentItem = ''
    let parenDepth = 0

    // Iterate through each character
    for (let i = 0; i < ingredientsStr.length; i++) {
      const char = ingredientsStr[i]

      if (char === '(') {
        parenDepth++
      } else if (char === ')') {
        parenDepth--
      }

      // If we hit a comma and we're not inside parentheses, it's an ingredient separator
      if (char === ',' && parenDepth === 0) {
        const trimmed = currentItem.trim()
        if (trimmed.length > 0) {
          items.push(trimmed)
        }
        currentItem = ''
      } else {
        currentItem += char
      }
    }

    // Don't forget the last item
    const trimmed = currentItem.trim()
    if (trimmed.length > 0) {
      items.push(trimmed)
    }

    return items
  })

  // Parse directions into numbered steps
  const parsedDirections = computed(() => {
    if (!recipe.value?.directions) return []

    let steps: string[] = []
    let directions = recipe.value.directions


    // Try to split by numbered pattern (1., 2., 3., etc.)
    const numberedPattern = /^\d+\.\s+/m

    if (numberedPattern.test(directions)) {
      // Split by pattern like "1. ", "2. ", etc.
      steps = directions
        .split(/(?=\d+\.\s)/) // Look ahead for number dot space
        .map(step => {
          // Remove the number prefix and trim
          return step.replace(/^\d+\.\s+/, '').trim()
        })
        .filter(step => step.length > 0)
    } else if (directions.includes('\\n\\n')) {
      steps = directions
        .split('\\n\\n')
        .map(step => step.trim())
        .filter(step => step.length > 0)
    } else if (directions.includes('\n\n')) {
      steps = directions
        .split('\n\n')
        .map(step => step.trim())
        .filter(step => step.length > 0)
    } else if (directions.includes('\\n')) {
      steps = directions
        .split('\\n')
        .map(step => step.trim())
        .filter(step => step.length > 0)
    } else {
      console.log('No newlines found, returning whole string as one step')
      steps = [directions.trim()]
    }

    return steps
  })

  // Get generated recipe from localhost:8080/generated-recipe/{id}
  const getGeneratedRecipe = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const url = `http://localhost:8080/generated-recipes/${id}`
      console.log('Fetching from:', url)
      const data = await $fetch<FullRecipe>(url)
      recipe.value = data
      console.log('Generated recipe fetched')
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch generated recipe'
      console.error('Error fetching generated recipe:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    recipe,
    loading,
    error,
    parsedIngredients,
    parsedDirections,
    getGeneratedRecipe
  }
}












