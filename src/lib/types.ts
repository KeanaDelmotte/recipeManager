import { Recipe, RecipeIngredient } from "@/generated/prisma";

export interface RecipeIngredientWithIngredient extends RecipeIngredient {
	ingredient: {
		name: string;
		id: number;
	};
}
export interface RecipeWithIngredients extends Recipe {
	ingredients: RecipeIngredientWithIngredient[];
}
