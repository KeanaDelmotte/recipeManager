"use server";

import { prisma } from "./prisma";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import { InputIngredient } from "@/components/common/CreateRecipe";
import { auth } from "./auth";
import { isPrismaError } from "./utils";

export async function createRecipe(userId: string, formData: FormData) {
	try {
		const title = formData.get("title")?.toString();
		const description = formData.get("description")?.toString();
		const servings = parseFloat(formData.get("servings")?.toString() ?? "");
		const imageUrl = formData.get("file")?.toString();
		const steps = JSON.parse(
			formData.get("steps")?.toString() ?? ""
		) as string[];
		const ingredients = JSON.parse(
			formData.get("ingredients")?.toString() ?? ""
		) as InputIngredient[];
		const notes = JSON.parse(
			formData.get("notes")?.toString() ?? ""
		) as string[];
		const cookTimeHours = Number(
			formData.get("cookTimeHours")?.toString() ?? "0"
		);
		const cookTimeMins =
			Number(formData.get("cookTimeMins")?.toString() ?? "0") ?? 0;
		const prepTimeHours =
			Number(formData.get("prepTimeHours")?.toString() ?? "0") ?? 0;
		const prepTimeMins =
			Number(formData.get("prepTimeMins")?.toString() ?? "0") ?? 0;
		const tags = JSON.parse(formData.get("tags")?.toString() ?? "") as string[];

		const totalCookTime = cookTimeHours * 60 + cookTimeMins;
		const totalPrepTime = prepTimeHours * 60 + prepTimeMins;

		if (title != null) {
			await prisma.recipe.create({
				data: {
					title,
					description,
					servings,
					imageUrl,
					userId,
					ingredients: {
						create: ingredients.map((ingredient) => ({
							ingredient: { create: { name: ingredient.ingredient } },
							quantity: parseFloat(ingredient.quantity),
							unit: ingredient.unit,
							group: ingredient.group,
						})),
					},
					steps: {
						createMany: {
							data: steps?.map((step, index) => ({
								content: step,
								order: index,
							})),
						},
					},
					notes: {
						createMany: {
							data: notes.map((note) => ({
								content: note,
							})),
						},
					},
					cookTimeInMins: totalCookTime,
					prepTimeInMins: totalPrepTime,
					tags: { create: tags.map((tag) => ({ title: tag })) },
				},
			});
			return { success: true, message: "Successfully created recipe!" };
		} else {
			return {
				success: false,
				message: "Could not create recipe. Minimum fields not met.",
			};
		}
	} catch (error) {
		if (error instanceof Error) {
			return { success: false, message: error.message };
		}
		return { success: false, message: "Could not create recipe." };
	}
}

export async function upload(formData: FormData) {
	try {
		const file = (formData.get("file") as Blob) || null;
		const uploadDir = path.resolve(
			process.env.ROOT_PATH ?? "",
			"public/uploads"
		);
		if (file) {
			const buffer = Buffer.from(await file.arrayBuffer());
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir);
			}

			fs.writeFileSync(
				path.resolve(uploadDir, (formData.get("file") as File).name),
				buffer
			);
		} else {
			return NextResponse.json({ success: false });
		}
	} catch (e) {
		return NextResponse.json({ success: false, message: e });
	}
}

export async function deleteRecipe(id: number) {
	try {
		const session = await auth();
		const user = session?.user;

		//Check if recipe belongs to user
		if (!user) {
			return { error: "Unauthorized", status: 401 };
		}

		//Check if recipe id is valid
		if (isNaN(id)) {
			return { error: "Invalid recipe ID", status: 400 };
		}

		//Delete
		const deletedRecipe = await prisma.recipe.delete({
			where: { id: id },
		});

		return {
			message: "Successfully deleted recipe",
			deletedRecipe,
			status: 200,
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		// Prisma record not found
		if (isPrismaError(error) && error.code === "P2025") {
			return { error: "Recipe not found", status: 404 };
		}
		if (error instanceof Error) {
			return {
				error: `Failed to delete recipe: ${error.message}`,
				status: 500,
			};
		}
		return { error: "Failed to delete recipe" };
	}
}

export async function getRecipes(filter: string) {
	try {
		const filteredRecipes = await prisma.recipe.findMany({
			where: {
				title: {
					contains: filter,
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
		return NextResponse.json({ success: true, recipes: filteredRecipes });
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ success: false, message: error.message });
		}
		return NextResponse.json({
			success: false,
			message: "Could not fetch recipes",
		});
	}
}
