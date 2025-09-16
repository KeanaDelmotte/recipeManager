"use server";
import styles from "./page.module.css";
import { auth } from "../lib/auth";
import MyRecipes from "@/components/common/MyRecipes";
import { FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getRecipes } from "@/lib/actions";
import { PageProps } from "../../.next/types/app/page";
import { LuSearchX } from "react-icons/lu";
import { FaRegCircleXmark } from "react-icons/fa6";
import Searchbar from "@/components/common/SearchBar";

export default async function Home({ searchParams }: PageProps) {
	const session = await auth();
	const user = session?.user;
	const search = (await searchParams)?.search;

	const recipesResponse = await getRecipes(search);

	if (!user) {
		return (
			<div className={cn(styles.page)}>
				<h1 className="text-4xl font-semixbold mb-10 self-start text-start w-full mt-3">
					My Recipes
				</h1>
				<div className="flex flex-col gap-3 items-center h-dvh justify-center">
					<p className="text-xl font-semibold">
						{"Looks like you're not signed in"}
					</p>
					<Button asChild>
						<Link href="/api/auth/signin">Sign In</Link>
					</Button>
				</div>
			</div>
		);
	}
	if (user && recipesResponse.status != 200) {
		return <CouldNotFetchRecipes />;
	}
	return (
		<div className={cn("!gap-0 h-full", styles.page)}>
			<main className={cn(styles.main, "w-full")}>
				<div className="w-full h-full flex flex-col gap-4">
					<div className="flex flex-row justify-between">
						<h1 className="text-4xl font-semixbold mb-10">My Recipes</h1>
						<Searchbar />
					</div>
					{search == undefined && recipesResponse.recipes ? (
						<MyRecipes recipes={recipesResponse.recipes} />
					) : (
						<NoRecipesFound />
					)}
					<Button asChild className="w-fit z-10 fixed right-5 bottom-5">
						<Link href="/createrecipe">
							<FaPlus />
							Add Recipe
						</Link>
					</Button>
				</div>
			</main>
			<footer className={styles.footer} />
		</div>
	);
}

function CouldNotFetchRecipes() {
	return (
		<div className="grow w-full flex flex-col justify-center items-center gap-3">
			<FaRegCircleXmark size={100} />
			<p className="font-semibold text-xl">Error fetching recipes</p>
		</div>
	);
}

function NoRecipesFound() {
	return (
		<div className="grow w-full flex flex-col justify-center items-center gap-3">
			<LuSearchX size={100} />
			<p className="font-semibold text-xl">
				{"No recipes found that match your search"}
			</p>
		</div>
	);
}
