"use client";
import { FaMagnifyingGlass, FaX } from "react-icons/fa6";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

interface SearchbarProps {
	onSearch: (queryStr: string) => void;
}

export default function Searchbar({ onSearch }: SearchbarProps) {
	const [searchQ, setSearchQ] = useState("");

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
					}}
					className="cursor-pointer col-start-1 row-start-1 justify-self-end w-fit rounded-s-none scale-90 hover:scale-95"
				>
					<FaX />
				</Button>
			)}
		</div>
	);
}

{
	/* <div className="flex flex-row gap-5">
			<Input
				placeholder="Recipe Name"
				onChange={(e) => setSearchQ(e.target.value)}
				onKeyDown={(key) => {
					if (key.key == "Enter") {
						onSearch(searchQ);
					}
				}}
			/>
			<div className="flex flex-row gap-5">
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
				{searchQ.trim().length > 0 && (
					<Button
						type="button"
						variant="ghost"
						onClick={() => {
							setSearchQ("");
						}}
						className="cursor-pointer"
					>
						<FaX />
					</Button>
				)}
			</div>
		</div> */
}
