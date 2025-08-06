"use client";
import { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import Searchbar from "./SearchBar";
import Styles from "./MyRecipes.module.css";
import { RecipeWithIngredients } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function MyRecipes() {
	const [recipeFilter, setRecipeFilter] = useState("");
	const [recipes, setRecipes] = useState<RecipeWithIngredients[]>();

	useEffect(() => {
		async function getRecipesForView(searchStr: string) {
			const res = await fetch(
				`/api/recipes?search=${encodeURIComponent(searchStr)}`
			);
			const data = await res.json();
			setRecipes(data);
		}
		getRecipesForView(recipeFilter);
	}, [recipeFilter]);

	return (
		<div className="w-full">
			<div className="flex flex-row justify-between">
				<h1 className="text-4xl font-bold mb-10">My Recipes</h1>
				<Searchbar onSearch={(searchQ) => setRecipeFilter(searchQ)} />
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
