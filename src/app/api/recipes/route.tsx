import { prisma } from "@/lib/prisma";
import { RecipeWithIngredients } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest
): Promise<NextResponse<RecipeWithIngredients[]>> {
	const search = req.nextUrl.searchParams.get("search") || "";

	const recipesRes = await prisma.recipe.findMany({
		where: {
			title: {
				contains: search,
			},
		},
		include: {
			ingredients: {
				include: {
					ingredient: true,
				},
			},
		},
	});

	return NextResponse.json(recipesRes);
}
