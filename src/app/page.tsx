import styles from "./page.module.css";
import { auth } from "../auth";

export default async function Home() {
	const session = await auth();
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				{!session?.user && <p>{"Looks like you're not signed in"}</p>}
				{session?.user && <p>{"You're signed in, so you can see this!"}</p>}
			</main>
			<footer className={styles.footer}></footer>
		</div>
	);
}
