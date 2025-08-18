import { Note, Recipe, RecipeIngredient, Step, Tag } from "@/generated/prisma";

export interface RecipeIngredientWithIngredient extends RecipeIngredient {
	ingredient: {
		name: string;
	};
}
export interface RecipeWithIngredients extends Recipe {
	ingredients: RecipeIngredientWithIngredient[];
}

export interface FullRecipe extends RecipeWithIngredients {
	steps: Step[];
	notes: Note[];
	tags: Tag[];
}
