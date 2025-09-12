"use server";

import { prisma } from "./prisma";
import { InputIngredient } from "@/components/common/CreateRecipe";
import { auth } from "./auth";
import { isPrismaError } from "./utils";

export async function createRecipe(formData: FormData) {
	try {
		const session = await auth();
		const user = session?.user;

		if (!user) {
			return { error: "Not authenticated", status: 401 };
		}

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
		const tags = JSON.parse(formData.get("tags")?.toString() ?? "") as string[];

		const cookTimeHours = formData.get("cookTimeHours")
			? Number(formData.get("cookTimeHours")?.toString())
			: null;
		const cookTimeMins = formData.get("cookTimeMins")
			? Number(formData.get("cookTimeMins")?.toString())
			: null;
		const prepTimeHours = formData.get("prepTimeHours")
			? Number(formData.get("prepTimeHours")?.toString())
			: null;
		const prepTimeMins = formData.get("prepTimeMins")
			? Number(formData.get("prepTimeMins")?.toString())
			: null;

		//Dont want the cook/prep time to show up as 0 if the user has not explicity set it to 0,
		//but if either the minutes or hours are set, assume the other is supposed to be 0
		let totalCookTime = null;
		let totalPrepTime = null;

		if (cookTimeHours || cookTimeMins) {
			totalCookTime = (cookTimeHours ?? 0) * 60 + (cookTimeMins ?? 0);
		}
		if (prepTimeMins || prepTimeHours) {
			totalPrepTime = (prepTimeHours ?? 0) * 60 + (prepTimeMins ?? 0);
		}

		await prisma.recipe.create({
			data: {
				title: title!,
				description,
				servings,
				imageUrl,
				userId: user.id!,
				ingredients: {
					create: ingredients.map((ingredient) => ({
						ingredient: {
							connectOrCreate: {
								where: { name: ingredient.ingredient },
								create: { name: ingredient.ingredient },
							},
						},
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
				tags: {
					connectOrCreate: tags.map((tag) => ({
						where: { title: tag },
						create: { title: tag },
					})),
				},
			},
		});
		return { message: "Successfully created recipe!", status: 201 };
	} catch (error) {
		if (error instanceof Error) {
			return { error: error.message, status: 500 };
		}
		return { error: "Could not create recipe.", status: 500 };
	}
}

export async function updateRecipe(formData: FormData, recipeId: number) {
	try {
		const session = await auth();
		const user = session?.user;

		if (!user) {
			return { error: "Not signed in", status: 401 };
		}
		const existingRecipe = await prisma.recipe.findFirstOrThrow({
			where: { userId: user.id, id: recipeId },
		});
		//Do not let user that doesn't own recipe edit it
		if (!existingRecipe) {
			return { error: "Could not update recipe.", status: 404 };
		}

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
		const tags = JSON.parse(formData.get("tags")?.toString() ?? "") as string[];

		const cookTimeHours = formData.get("cookTimeHours")
			? Number(formData.get("cookTimeHours")?.toString())
			: null;
		const cookTimeMins = formData.get("cookTimeMins")
			? Number(formData.get("cookTimeMins")?.toString())
			: null;
		const prepTimeHours = formData.get("prepTimeHours")
			? Number(formData.get("prepTimeHours")?.toString())
			: null;
		const prepTimeMins = formData.get("prepTimeMins")
			? Number(formData.get("prepTimeMins")?.toString())
			: null;

		//Dont want the cook/prep time to show up as 0 if the user has not explicity set it to 0,
		//but if either the minutes or hours are set, assume the other is supposed to be 0
		let totalCookTime = null;
		let totalPrepTime = null;

		if (cookTimeHours || cookTimeMins) {
			totalCookTime = (cookTimeHours ?? 0) * 60 + (cookTimeMins ?? 0);
		}
		if (prepTimeMins || prepTimeHours) {
			totalPrepTime = (prepTimeHours ?? 0) * 60 + (prepTimeMins ?? 0);
		}

		const updatedRecipe = await prisma.recipe.update({
			where: { id: recipeId },
			data: {
				title,
				description,
				servings,
				imageUrl,
				userId: user.id,
				ingredients: {
					//Delete all records first, then create new ones so that there's no duplicates
					deleteMany: {},
					create: ingredients.map((ingredient) => ({
						ingredient: {
							//Only create the ingredient if it doesnt already exist.
							connectOrCreate: {
								where: { name: ingredient.ingredient },
								create: { name: ingredient.ingredient },
							},
						},
						quantity: parseFloat(ingredient.quantity),
						unit: ingredient.unit,
						group: ingredient.group,
					})),
				},
				steps: {
					deleteMany: {},
					createMany: {
						data: steps?.map((step, index) => ({
							content: step,
							order: index,
						})),
					},
				},
				notes: {
					deleteMany: {},
					createMany: {
						data: notes.map((note) => ({
							content: note,
						})),
					},
				},
				cookTimeInMins: totalCookTime,
				prepTimeInMins: totalPrepTime,
				tags: {
					connectOrCreate: tags.map((tag) => ({
						where: { title: tag },
						create: { title: tag },
					})),
				},
			},
		});
		return { success: true, recipe: updatedRecipe, status: 200 };
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		if (isPrismaError(error) && error.code == "P2025") {
			return {
				error: "Could not update recipe. Recipe does not exist.",
				status: 404,
			};
		}
		if (error instanceof Error) {
			return { error: error.message, status: 500 };
		}
		return {
			error: `Could not update recipe ${recipeId}.`,
			status: 500,
		};
	}
}

// export async function upload(formData: FormData) {
// 	try {
// 		const file = (formData.get("file") as Blob) || null;
// 		const uploadDir = path.resolve(
// 			process.env.ROOT_PATH ?? "",
// 			"public/uploads"
// 		);
// 		if (file) {
// 			const buffer = Buffer.from(await file.arrayBuffer());
// 			if (!fs.existsSync(uploadDir)) {
// 				fs.mkdirSync(uploadDir);
// 			}

// 			fs.writeFileSync(
// 				path.resolve(uploadDir, (formData.get("file") as File).name),
// 				buffer
// 			);
// 		} else {
// 			return {  };
// 		}
// 	} catch (e) {
// 		return { , message: e };
// 	}
// }

export async function deleteRecipe(id: number) {
	try {
		const session = await auth();
		const user = session?.user;

		if (!user) {
			return {
				error: "You must be signed in to delete this recipe.",
				status: 401,
			};
		}
		const existingRecipe = await prisma.recipe.findFirstOrThrow({
			where: { userId: user?.id, id },
		});
		//Do not let user that doesn't own recipe delete it
		if (!existingRecipe) {
			return { error: "Recipe not found.", status: 404 };
		}

		//Check if recipe id is valid
		if (isNaN(id)) {
			return { error: "Invalid recipe ID.", status: 400 };
		}

		//Delete
		const deletedRecipe = await prisma.recipe.delete({
			where: { id: id },
		});

		return {
			message: "Successfully deleted recipe.",
			deletedRecipe,
			status: 200,
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		// Prisma record not found
		if (isPrismaError(error) && error.code === "P2025") {
			return { error: "Recipe not found.", status: 404 };
		}

		return { error: "Failed to delete recipe.", status: 500 };
	}
}

export async function getRecipes(filter: string) {
	try {
		const session = await auth();
		const user = session?.user;

		if (!user) {
			return {
				error: "You must be signed in to view your recipes.",
				status: 401,
			};
		}
		const filteredRecipes = await prisma.recipe.findMany({
			where: {
				title: {
					contains: filter,
				},
				userId: user.id,
			},
			include: {
				ingredients: {
					include: {
						ingredient: true,
					},
				},
			},
		});
		return { recipes: filteredRecipes, status: 200 };
	} catch (error) {
		if (error instanceof Error) {
			return { error: error.message, status: 500 };
		}
		return {
			error: "Could not fetch recipes.",
			status: 500,
		};
	}
}
