import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function recipeTimeToReadable(
	prepTime: number | null,
	cookTime: number | null
) : string {
	let totalTimeInMins = 0;

	if (prepTime) {
		totalTimeInMins += prepTime;
	}
	if (cookTime) {
		totalTimeInMins += cookTime;
	}

	const hours = Math.floor(totalTimeInMins);
	const minutes = totalTimeInMins % 60;
	const paddedMins = minutes.toString().padStart(2, "0");

	return `${hours} : ${paddedMins}`;
}
