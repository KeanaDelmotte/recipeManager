import RecipeCard from "./RecipeCard";
import Searchbar from "./SearchBar";
import Styles from "./MyRecipes.module.css";
import { RecipeWithIngredients } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MyRecipesProps {
	recipes: RecipeWithIngredients[];
}

export default function MyRecipes({ recipes }: MyRecipesProps) {
	return (
		<div className="w-full">
			<div className="flex flex-row justify-between">
				<h1 className="text-4xl font-bold mb-10">My Recipes</h1>
				<Searchbar />
			</div>
			<ul className={cn("flex flex-wrap", Styles.myRecipes)}>
				{recipes &&
					recipes.map((recipe) => (
						<RecipeCard
							key={recipe.id}
							id={recipe.id}
							title={recipe.title}
							description={recipe.description ?? ""}
							imageURL={recipe.imageUrl ?? ""}
							servings={recipe.servings?.toString() ?? ""}
							cookTimeInMins={recipe.cookTimeInMins ?? 0}
							prepTimeInMins={recipe.prepTimeInMins ?? 0}
							ingredients={recipe.ingredients.map((ingredient) => ({
								name: ingredient.ingredient.name,
								id: ingredient.id,
								unit: ingredient.unit ?? "",
								quantity: ingredient.quantity?.toString() ?? "",
							}))}
						/>
					))}
			</ul>
		</div>
	);
}
