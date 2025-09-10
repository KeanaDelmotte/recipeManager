"use client";
import Image from "next/image";
import {
	FaClock,
	FaUsers,
	FaImage,
	FaPen,
	FaTag,
	FaTrashCan,
	FaCircleXmark,
	FaCircleCheck,
} from "react-icons/fa6";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Note, Recipe, Step, Tag } from "@/generated/prisma";
import { cn, timeInMinutesToReadable } from "@/lib/utils";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { deleteRecipe } from "@/lib/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAsyncAction } from "@/lib/hooks";
import { useEffect } from "react";
import { toast } from "sonner";

type Ingredient = {
	ingredient: {
		name: string;
	};
} & {
	id: number;
	recipeId: number;
	note: string | null;
	quantity: number | null;
	unit: string | null;
	group: string | null;
};

interface RecipeOverviewProps {
	recipe: Recipe;
	ingredients: Ingredient[];
	steps: Step[];
	notes: Note[];
	tags: Tag[];
}

export default function RecipeOverview({
	recipe,
	ingredients,
	steps,
	notes,
	tags,
}: RecipeOverviewProps) {
	const totalTime = (recipe.prepTimeInMins || 0) + (recipe.cookTimeInMins || 0);
	const router = useRouter();
	const [deleteResult, deleteRecipeWithID, isPending, error] =
		useAsyncAction(deleteRecipe);

	//Seperate ingredients list into ingredients with and without group
	const ungroupedIngredients = ingredients.filter((i) => !i.group);
	const ingredientGroups = ingredients
		.filter((i) => i.group)
		.reduce((acc, curr) => {
			if (!acc[curr.group!]) {
				acc[curr.group!] = [];
			}
			acc[curr.group!].push(curr);
			return acc;
		}, {} as Record<string, Ingredient[]>);

	useEffect(() => {
		if (deleteResult?.status == 200) {
			router.push("/");
			toast.success("Recipe deleted", {
				description: deleteResult.deletedRecipe?.title
					? `The recipe "${deleteResult.deletedRecipe?.title}" was deleted successfully.`
					: "The recipe was deleted successfully.",
				icon: <FaCircleCheck className="text-secondary w-5 h-5" />,
				className:
					"border border-green-400 bg-green-50 text-green-700 shadow-lg rounded-xl",
			});
		} else if (deleteResult?.error != null || error) {
			let description = "Please try again.";

			if (deleteResult?.status != 500 && deleteResult?.error) {
				description = deleteResult?.error;
			}

			toast.error("Delete failed", {
				description:
					`The recipe ${
						deleteResult?.deletedRecipe?.title
							? '"' + deleteResult.deletedRecipe?.title + '"'
							: ""
					}  could not be deleted. ` + description,
				icon: <FaCircleXmark className="text-red-500 w-5 h-5" />,
				className:
					"border border-red-400 bg-red-50 text-red-700 shadow-lg rounded-xl",
			});
		}
	}, [deleteResult, router, recipe.title, error]);

	return (
		<Dialog>
			<DialogContent className={cn({ "bg-red-400": isPending })}>
				<div className="flex flex-col gap-3">
					<DialogTitle>Delete Recipe</DialogTitle>
					<p>Are you sure you want to delete this recipe?</p>
					<div className="flex flex-row gap-3">
						<DialogClose asChild>
							<Button variant="secondary">Cancel</Button>
						</DialogClose>
						<DialogClose asChild>
							<Button
								type="button"
								variant="destructive"
								className="cursor-pointer"
								onClick={() => {
									deleteRecipeWithID(recipe.id);
									// if (success?.status == 200) {
									// 	router.push("/");
									// }
								}}
								disabled={isPending}
							>
								Delete
							</Button>
						</DialogClose>
					</div>
				</div>
			</DialogContent>
			<div className="max-w-4xl mx-auto p-6 space-y-6">
				{/* Header Section */}
				<div className="space-y-4">
					{/* Action Buttons */}
					<div className="flex justify-end">
						<div className="flex gap-2 flex-shrink-0">
							<Button variant="outline" size="sm" asChild>
								<Link href={`/recipes/${recipe.id}?edit=true`}>
									<FaPen className="mr-2" size={14} />
									Edit
								</Link>
							</Button>

							<DialogTrigger asChild>
								<Button variant="outline">
									<FaTrashCan size={14} />
									Delete
								</Button>
							</DialogTrigger>
						</div>
					</div>

					<div className="flex flex-col lg:flex-row gap-6">
						{/* Recipe Image */}
						<div className="relative w-full lg:w-64 h-64 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
							{recipe.imageUrl ? (
								<Image
									src={recipe.imageUrl}
									alt={recipe.title}
									fill
									className="object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<FaImage className="text-gray-400" size={64} />
								</div>
							)}
						</div>

						{/* Right side content */}
						<div className="flex-1 space-y-4">
							{/* Title and Description */}
							<div className="space-y-2">
								<h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
									{recipe.title}
								</h1>
								{recipe.description && (
									<p className="text-lg text-gray-600">{recipe.description}</p>
								)}
							</div>

							{/* Tags */}
							{tags && tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{tags.map((tag, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="flex items-center gap-1"
										>
											<FaTag size={10} />
											{tag.title}
										</Badge>
									))}
								</div>
							)}

							{/* Recipe Info */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
								<div className="flex items-center gap-2">
									<FaUsers className="text-gray-400" size={16} />
									<span className="font-medium">Serves {recipe.servings}</span>
								</div>
								{recipe.prepTimeInMins && (
									<div className="flex items-center gap-2">
										<FaClock className="text-gray-400" size={16} />
										<span className="font-medium">
											Prep: {timeInMinutesToReadable(recipe.prepTimeInMins)}
										</span>
									</div>
								)}
								{recipe.cookTimeInMins && (
									<div className="flex items-center gap-2">
										<FaClock className="text-gray-400" size={16} />
										<span className="font-medium">
											Cook: {timeInMinutesToReadable(recipe.cookTimeInMins)}
										</span>
									</div>
								)}
								{totalTime > 0 && (
									<div className="flex items-center gap-2">
										<FaClock className="text-gray-400" size={16} />
										<span className="font-medium">
											Total: {timeInMinutesToReadable(totalTime)}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Ingredients */}
					<div className="lg:col-span-1 space-y-6">
						{/* Ingredients */}
						<Card>
							<CardHeader>
								<CardTitle className="text-xl">Ingredients</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									{ungroupedIngredients.map((ingredient) => (
										<li key={ingredient.id} className="flex flex-col gap-1">
											<p className="font-medium">
												<span className="text-gray-500 w-fit pr-1">
													{ingredient.quantity} {ingredient.unit}
												</span>
												{ingredient.ingredient.name}
											</p>
										</li>
									))}
								</ul>
								{Object.entries(ingredientGroups).map(
									([groupName, ingredients]) => (
										<div key={groupName} className="mt-3">
											<h2 className="font-semibold text-xl mb-2">
												{groupName}
											</h2>
											<ul className="space-y-3">
												{ingredients.map((ingredient) => (
													<li
														key={ingredient.id}
														className="flex flex-col gap-1"
													>
														<p className="font-medium">
															<span className="text-gray-500 w-fit pr-1">
																{ingredient.quantity} {ingredient.unit}
															</span>
															{ingredient.ingredient.name}
														</p>
													</li>
												))}
											</ul>
										</div>
									)
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Method and Notes */}
					<div className="lg:col-span-2 space-y-6">
						{/* Method */}
						<Card>
							<CardHeader>
								<CardTitle className="text-xl">Method</CardTitle>
							</CardHeader>
							<CardContent>
								<ol className="space-y-4">
									{steps.map((step, index) => (
										<li key={index} className="flex gap-4">
											<div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
												{index + 1}
											</div>
											<p className="text-gray-700 leading-relaxed pt-1">
												{step.content}
											</p>
										</li>
									))}
								</ol>
							</CardContent>
						</Card>

						{/* Notes */}
						{notes && (
							<Card>
								<CardHeader>
									<CardTitle className="text-xl">Notes</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
										{notes.map((note) => {
											const noteArr = note.content.split(" ");
											return (
												<p
													className="text-gray-700 leading-relaxed whitespace-pre-wrap"
													key={note.id}
												>
													<span className="font-bold p-1">{noteArr[0]}</span>
													{noteArr.slice(1).join(" ")}
												</p>
											);
										})}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</Dialog>
	);
}
