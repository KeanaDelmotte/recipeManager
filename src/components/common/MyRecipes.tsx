import { prisma } from "../../lib/prisma";
import RecipeCard from "./RecipeCard";

export default async function MyRecipes() {
	const recipes = await prisma.recipe.findMany({
		include: {
			ingredients: {
				include: {
					ingredient: true,
				},
			},
		},
	});
	return (
		<div className="w-full">
			<h1 className="text-4xl font-bold mb-5">My Recipes</h1>
			<ul className="grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] gap-8 place-items-center">
				{recipes.map((recipe) => (
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
