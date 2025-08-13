"use client";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { FaClock, FaImage, FaPen, FaBookOpen, FaTrash } from "react-icons/fa6";
import { cn, timeInMinutesToReadable } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import Styles from "./MyRecipes.module.css";
import { useState } from "react";
import { deleteRecipe } from "@/lib/actions";
import { useRouter } from "next/navigation";
interface RecipeCardProps {
	id: number;
	imageURL: string;
	title: string;
	description: string;
	servings: string;
	prepTimeInMins: number;
	cookTimeInMins: number;
	ingredients: {
		id: number;
		name: string;
		quantity: string;
		unit: string;
	}[];
}

export default function RecipeCard({
	id,
	imageURL,
	title,
	description,
	servings,
	prepTimeInMins,
	cookTimeInMins,
	ingredients,
}: RecipeCardProps) {
	const [showPopup, setShowPopup] = useState(false);
	const router = useRouter();
	return (
		<Card
			className={cn(
				"flex flex-col h-80 w-72 overflow-hidden gap-0 py-0 relative",
				Styles.recipe
			)}
		>
			{/* Image Section */}
			<div className="relative w-full h-28 bg-gray-100 flex items-center justify-center flex-shrink-0">
				{imageURL ? (
					<Image src={imageURL} alt={title} fill className="object-cover" />
				) : (
					<FaImage className="text-gray-400" size={48} />
				)}
				<Button
					type="button"
					variant="ghost"
					className="absolute top-2 right-2 z-10"
					onClick={() => {
						setShowPopup(true);
					}}
				>
					<FaTrash className="text-gray-700" />
				</Button>
			</div>

			{/* Content Section */}
			<CardContent className="flex flex-col p-3 flex-grow overflow-hidden">
				{/* Header Section */}
				<div className="flex justify-between gap-2 mb-2">
					<div className="flex-grow min-w-0">
						<h3 className="font-semibold text-lg leading-tight truncate">
							{title}
						</h3>
						<p className="text-gray-500 text-sm line-clamp-1">{description}</p>
					</div>
					<div className="flex-shrink-0 text-right text-sm">
						<p className="whitespace-nowrap">{`Serves ${servings}`}</p>
						<p className="flex items-center gap-1 justify-end">
							<FaClock size={12} />
							<span className="whitespace-nowrap">
								{timeInMinutesToReadable(prepTimeInMins + cookTimeInMins)}
							</span>
						</p>
					</div>
				</div>

				{/* Ingredients Section */}
				<div className="flex-grow overflow-hidden mb-3">
					<p className="font-medium text-sm mb-1">Ingredients:</p>
					<div className="overflow-hidden">
						<ul className="space-y-1">
							{ingredients.map((ingredient) => (
								<li
									key={ingredient.id}
									className="text-xs leading-tight truncate"
								>
									<span className="text-gray-400">
										{ingredient.quantity} {ingredient.unit}
									</span>{" "}
									{ingredient.name}
								</li>
							))}
							{ingredients.length > 3 && (
								<li className="text-xs text-gray-400 italic">
									+{ingredients.length - 3} more ingredients...
								</li>
							)}
						</ul>
					</div>
				</div>

				{/* Buttons Section */}
				<div className="flex gap-2 mt-auto">
					<Button size="sm" variant="outline" className="flex-1">
						<FaPen className="mr-1" size={12} />
						Edit
					</Button>
					<Button size="sm" className="flex-1" variant="secondary" asChild>
						<Link href={`/recipes/${id}`}>
							<FaBookOpen className="mr-1" size={12} />
							View
						</Link>
					</Button>
				</div>
				{/* Popup */}
				{showPopup && (
					<div className="flex flex-col gap-5 bg-gray-200 z-10 w-full h-full items-center absolute top-0 left-0 p-3 justify-center">
						<p>Are you sure you want to delete this recipe?</p>
						<div className="flex flex-row gap-3">
							<Button
								type="button"
								variant="secondary"
								className="cursor-pointer"
								onClick={() => {
									setShowPopup(false);
								}}
							>
								Cancel
							</Button>
							<Button
								type="button"
								variant="destructive"
								className="cursor-pointer"
								onClick={async () => {
									const result = await deleteRecipe(id);
									if (result.status == 200) {
										router.refresh();
									}
								}}
							>
								Delete
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
