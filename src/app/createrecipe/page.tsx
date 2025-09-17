import CreateRecipe from "@/components/common/CreateRecipe";
import UnauthenticatedView from "@/components/common/UnauthenticatedView";
import { auth } from "@/lib/auth";

export default async function NewRecipePage() {
	const session = await auth();

	if (!session?.user?.id) {
		return <UnauthenticatedView />;
	}

	return <CreateRecipe userId={session.user.id} />;
}
