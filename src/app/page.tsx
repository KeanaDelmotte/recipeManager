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

export default async function Home({ searchParams }: PageProps) {
	const session = await auth();
	const user = session?.user;
	const search = (await searchParams)?.search;

	const recipesResponse = await getRecipes(search);
	const recipesResult = await recipesResponse.json();

	if (recipesResult.success && recipesResult.recipes) {
		return (
			<div className={cn("!gap-0", styles.page)}>
				<main className={cn(styles.main, "w-full")}>
					{!user && (
						<div className="flex flex-col gap-3 items-center">
							<p>{"Looks like you're not signed in"}</p>
							<Button asChild>
								<Link href="/api/auth/signin">Sign In</Link>
							</Button>
						</div>
					)}
					{user && (
						<div className="w-full flex flex-col gap-4">
							<MyRecipes recipes={recipesResult.recipes} />
							<Button asChild className="w-fit z-10 fixed right-5 bottom-5">
								<Link href="/createrecipe">
									<FaPlus />
									Add Recipe
								</Link>
							</Button>
						</div>
					)}
				</main>
				<footer className={styles.footer} />
			</div>
		);
	} else {
		return (
			<div>
				<p>Could not fetch recipes</p>
			</div>
		);
	}
}
