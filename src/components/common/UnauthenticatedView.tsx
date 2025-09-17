import { FaTriangleExclamation } from "react-icons/fa6";
import { Button } from "../ui/button";
import Link from "next/link";

export default function UnauthenticatedView() {
	return (
		<div className="w-full h-full flex flex-col gap-3 items-center justify-center">
			<FaTriangleExclamation size={100} />
			<p className="text-xl font-semibold">
				{"Looks like you're not signed in"}
			</p>
			<p>You must be signed in to view this content</p>
			<Button className="min-w-max">
				<Link href="/api/auth/signin">Sign In</Link>
			</Button>
		</div>
	);
}
