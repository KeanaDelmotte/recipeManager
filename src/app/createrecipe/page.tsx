
import CreateRecipe from "@/components/common/CreateRecipe";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewRecipePage() {
  const session = await auth()


  if (!session?.user?.id) {
    redirect("/login");
  }

  return <CreateRecipe userId={session.user.id} />;
}