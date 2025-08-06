"use client";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

interface SearchbarProps {
	onSearch: (queryStr: string) => void;
}

export default function Searchbar({ onSearch }: SearchbarProps) {
	const [searchQ, setSearchQ] = useState("");

	return (
		<div className="flex flex-row gap-5">
			<Input
				placeholder="Recipe Name"
				onChange={(e) => setSearchQ(e.target.value)}
				onKeyDown={(key) => {
					if (key.key == "Enter") {
						onSearch(searchQ);
					}
				}}
			/>
			<Button
				type="button"
				variant="ghost"
				onClick={() => {
					onSearch(searchQ);
				}}
				className="cursor-pointer"
			>
				<FaMagnifyingGlass />
			</Button>
		</div>
	);
}
