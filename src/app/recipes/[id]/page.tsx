import CreateRecipe from "@/components/common/CreateRecipe";
import RecipeOverview from "@/components/common/RecipeOverview";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageProps } from "../../../../.next/types/app/page";
import { ScrollToTop } from "@/components/common/ScrollToTop";

export default async function Recipe({ params, searchParams }: PageProps) {
	const editMode = (await searchParams).edit;
	const session = await auth();
	const user = session?.user;
	const recipe = await prisma.recipe.findUnique({
		where: { id: parseInt((await params).id), userId: user?.id },
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
		<div className="h-full w-full">
			<ScrollToTop />
			{recipe != undefined && (
				<RecipeOverview
					recipe={recipe}
					notes={recipe.notes}
					steps={recipe.steps}
					tags={recipe.tags}
					ingredients={recipe.ingredients}
				/>
			)}
			{recipe == undefined && <RecipeNotFound />}
		</div>
	);
}

//todo center this
function RecipeNotFound() {
	return (
		<div className="h-full w-full flex flex-col justify-center items-center gap-3">
			<p className="text-3xl font-semibold">404 - Not Found</p>
			<p className="font-semibold">Recipe does not exist</p>
		</div>
	);
}
