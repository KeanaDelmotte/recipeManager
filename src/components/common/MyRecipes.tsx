import { Recipe } from "@/generated/prisma";
import { prisma } from "../../lib/prisma";
import styles from "./MyRecipes.module.css";

export default async function MyRecipes() {
	const recipes = await prisma.recipe.findMany();
	return (
		<div className={styles.myRecipes}>
			<h2>My Recipes</h2>
			<ul className={styles.recipeList}>
				{recipes.map((recipe: Recipe) => (
					<div className={styles.recipe} key={recipe.id}>
						<p className={styles.title}>{recipe.title}</p>
					</div>
				))}
			</ul>
		</div>
	);
}
