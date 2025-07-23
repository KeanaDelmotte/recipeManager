"use server";
import styles from "./page.module.css";
import { auth } from "../lib/auth";
import MyRecipes from "@/components/common/MyRecipes";
import { FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
	const session = await auth();
	const user = session?.user;

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				{!user && (
					<div className="flex flex-col gap-3 items-center">
						<p>{"Looks like you're not signed in"}</p>
						<Button>
							<Link href="/api/auth/signin">Sign In</Link>
						</Button>
					</div>
				)}
				{user && (
					<div>
						<MyRecipes />
						<Button asChild>
							<Link href="/createrecipe">
								<FaPlus />
								Add Recipe
							</Link>
						</Button>
					</div>
				)}
			</main>
			<footer className={styles.footer}></footer>
		</div>
	);
}
