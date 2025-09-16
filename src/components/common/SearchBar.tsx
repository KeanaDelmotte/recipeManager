"use client";
import { FaMagnifyingGlass, FaX } from "react-icons/fa6";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Searchbar() {
	const [searchQ, setSearchQ] = useState("");
	const router = useRouter();
	const currentDir = usePathname();

	function onSearch(searchStr: string) {
		const params = new URLSearchParams(window.location.search);
		if (searchStr) {
			params.set("search", searchStr);
		} else {
			params.delete("search");
		}
		router.push(`${currentDir}?${params.toString()}`);
	}

	return (
		<div className="grid grid-cols-[repeat(fit-content)] grid-rows-1 h-fit gap-3">
			<Input
				value={searchQ}
				placeholder="Recipe Name"
				onChange={(e) => setSearchQ(e.target.value)}
				onKeyDown={(key) => {
					if (key.key == "Enter") {
						onSearch(searchQ);
					}
				}}
				className="col-start-1 row-start-1"
			/>
			<Button
				type="button"
				variant="ghost"
				onClick={() => {
					onSearch(searchQ);
				}}
				className="cursor-pointer col-start-2 z-10 row-start-1 w-fit"
			>
				<FaMagnifyingGlass />
			</Button>
			{searchQ.trim().length > 0 && (
				<Button
					type="button"
					variant="ghost"
					onClick={() => {
						setSearchQ("");
						router.push(currentDir);
					}}
					className="cursor-pointer col-start-1 row-start-1 justify-self-end w-fit rounded-s-none scale-90 hover:scale-95"
				>
					<FaX />
				</Button>
			)}
		</div>
	);
}
