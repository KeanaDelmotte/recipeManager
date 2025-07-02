"use server";

import { prisma } from "./prisma";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import { InputIngredient } from "@/components/common/CreateRecipe";

export async function createRecipe(userId: string, formData: FormData) {
	try {
		const title = formData.get("title")?.toString();
		const description = formData.get("description")?.toString();
		const servings = parseInt(formData.get("servings")?.toString() ?? "");
		const imageUrl = formData.get("file")?.toString();
		const steps = formData.get("steps")?.toString().split(",") ?? [];
		const ingredients = JSON.parse(
			formData.get("ingredients")?.toString() ??
				"{id: 1, ingredient: 'test', qunatity: 1, unit: 'cup'}"
		) as InputIngredient[];
		const notes = formData.get("notes")?.toString().split(",") ?? [];
		const cookTimeHours = parseInt(
			formData.get("cookTimeHours")?.toString() ?? "0"
		);
		const cookTimeMins = parseInt(
			formData.get("cookTimeMins")?.toString() ?? "0"
		);
		const prepTimeHours = parseInt(
			formData.get("prepTimeHours")?.toString() ?? "0"
		);
		const prepTimeMins = parseInt(
			formData.get("prepTimeMins")?.toString() ?? "0"
		);
		const tags = formData.get("tags")?.toString().split(",") ?? [];

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
							quantity: parseInt(ingredient.quantity),
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
