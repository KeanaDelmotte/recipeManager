import { Prisma } from "@/generated/prisma";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Converts a time duration from minutes to a human-readable string in "H:MM" format.
 *
 * @param timeInMinutes - The total time in minutes to convert.
 * @returns A string representing the time in hours and minutes, zero-padded for minutes (e.g., "2:05").
 */
export function timeInMinutesToReadable(timeInMinutes: number): string {
	const minutes = timeInMinutes % 60;
	const hours = Math.floor((timeInMinutes - minutes) / 60);
	const paddedMins = minutes.toString().padStart(2, "0");

	return `${hours}:${paddedMins}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPrismaError(error: any) {
	return error.constructor.name === Prisma.PrismaClientKnownRequestError.name;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPrismaValidationError(error: any) {
	return error.constructor.name === Prisma.PrismaClientValidationError.name;
}
