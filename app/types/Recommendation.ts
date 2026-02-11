export interface Recommendation {
    id: number
    name: string
    ingredients: string
    img_src?: string
    missing_count?: number
    missing_ingredients?: string[]
}
