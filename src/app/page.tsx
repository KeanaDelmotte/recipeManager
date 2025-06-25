import styles from "./page.module.css";
import { auth } from "../lib/auth";
import MyRecipes from "@/components/MyRecipes";
import CreateRecipe from "@/components/CreateRecipe";

export default async function Home() {
	const session = await auth();
	const user = session?.user;
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				{!user && <p>{"Looks like you're not signed in"}</p>}
				{user && (
					<div>
						<MyRecipes />
						<h2>Create Recipe:</h2>
						<CreateRecipe userId={user.id ?? ""} />
					</div>
				)}
			</main>
			<footer className={styles.footer}></footer>
		</div>
	);
}
