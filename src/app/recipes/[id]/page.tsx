import RecipeOverview from "@/components/common/RecipeOverview";
import { prisma } from "@/lib/prisma";

export default async function Recipe({ params }: { params: { id: string } }) {
	const recipe = await prisma.recipe.findUnique({
		where: { id: parseInt(params.id) },
		include: { ingredients: {include: {ingredient: true}}, notes: true, steps: true, tags: true },
	});

	return (
		<div>
			{recipe != undefined && <RecipeOverview recipe={recipe} notes={recipe.notes} steps={recipe.steps} tags={recipe.tags} ingredients={recipe.ingredients}/>}
			{recipe == undefined && <p>Recipe does not exist</p>}
		</div>
	);
}
