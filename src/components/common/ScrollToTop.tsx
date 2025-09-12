"use client";
import { useEffect } from "react";
//Somtimes nextjs doesnt act properly and scroll to the top when navigating, so scroll to top manually
export function ScrollToTop() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return null;
}
