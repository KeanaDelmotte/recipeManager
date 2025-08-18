import CreateRecipe from "@/components/common/CreateRecipe";
import RecipeOverview from "@/components/common/RecipeOverview";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageProps } from "../../../../.next/types/app/page";

export default async function Recipe({ params, searchParams }: PageProps) {
	const editMode = (await searchParams).edit;
	const session = await auth();
	const user = session?.user;
	const recipe = await prisma.recipe.findUnique({
		where: { id: parseInt((await params).id) },
		include: {
			ingredients: { include: { ingredient: true } },
			notes: true,
			steps: true,
			tags: true,
		},
	});
	if (user?.id && editMode && recipe) {
		return (
			<div>
				<CreateRecipe userId={user.id} editRecipe={recipe} />
			</div>
		);
	}
	return (
		<div>
			{recipe != undefined && (
				<RecipeOverview
					recipe={recipe}
					notes={recipe.notes}
					steps={recipe.steps}
					tags={recipe.tags}
					ingredients={recipe.ingredients}
				/>
			)}
			{recipe == undefined && <p>Recipe does not exist</p>}
		</div>
	);
}
