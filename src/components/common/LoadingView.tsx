import { ReactNode } from "react";
import Spinner from "../ui/spinner";

interface LoadingViewProps {
	children?: ReactNode;
}

export default function LoadingView({ children }: LoadingViewProps) {
	return (
		<div className="flex flex-col gap-3 w-full justify-center content-center items-center h-dvh">
			<Spinner />
			{children}
		</div>
	);
}
