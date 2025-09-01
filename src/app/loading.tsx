import LoadingView from "@/components/common/LoadingView";

export default function Loading() {
	return (
		<LoadingView>
			<p className="text-xl font-semibold">Fetching Recipes</p>
		</LoadingView>
	);
}
