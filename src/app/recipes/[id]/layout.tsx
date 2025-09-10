//This needs to be here so that next can scroll to the top when navigating here
export default function RecipeLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div>{children}</div>;
}
