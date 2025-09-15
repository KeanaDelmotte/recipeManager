"use client";
import { User } from "next-auth";
import { signOut, signIn } from "next-auth/react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaX } from "react-icons/fa6";
import Link from "next/link";
import { Button } from "../ui/button";

interface NavbarProps {
	user: User | undefined;
}
export default function Navbar({ user }: NavbarProps) {
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const handleClickOutside = (event: MouseEvent) => {
		if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
			setShowMenu(false);
		}
	};

	useEffect(() => {
		if (showMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showMenu]);
	return (
		<div className="sticky top-0 z-50 bg-gray-900 flex flex-row justify-between p-5 ">
			{/* Right Side - Home Link */}
			<Link href="/" className="text-white text-2xl">
				Recipe Manager
			</Link>
			{/* Left Side - Login/User */}
			<div className="relative">
				{user && (
					<div className="flex justify-end">
						<Image
							src={user.image ?? "public/default-user.svg"}
							alt="user image"
							className="rounded-2xl cursor-pointer size-8"
							width={30}
							height={30}
							onClick={() => setShowMenu(true)}
						/>
						{/* <p className="text-white ml-3">{`Welcome, ${user.name}`}</p> */}
					</div>
				)}
				{!user && (
					<FaUser
						className="text-white cursor-pointer"
						onClick={() => setShowMenu(true)}
					/>
				)}
				{showMenu && (
					<UserMenu
						user={user}
						ref={menuRef}
						dismiss={() => setShowMenu(false)}
					/>
				)}
			</div>
		</div>
	);
}

interface UserMenuProps {
	user: User | undefined;
	ref: React.RefObject<HTMLDivElement | null>;
	dismiss: () => void;
}

function UserMenu({ user, ref, dismiss }: UserMenuProps) {
	return (
		<div
			className="absolute right-0 flex flex-col items-start z-10 bg-gray-900 border border-black mt-7 rounded-xl w-100"
			ref={ref}
		>
			<div className="w-full flex justify-between items-center p-3 border-b-2 border-gray-600">
				{user && <p className="text-white">{`Welcome, ${user.name}`}</p>}
				<Button
					variant="ghost"
					className="hover:bg-gray-700"
					onClick={() => {
						dismiss();
					}}
				>
					<FaX className="text-white" />
				</Button>
			</div>
			{user && (
				<button
					onClick={async () => {
						await signOut();
						dismiss();
					}}
					className="text-white cursor-pointer p-3 hover:bg-gray-700 w-full last:rounded-b-xl text-start"
				>
					Sign Out
				</button>
			)}
			{!user && (
				<button
					onClick={async () => {
						await signIn();
						dismiss();
					}}
					className="text-white cursor-pointer p-3 hover:bg-gray-700 w-full last:rounded-b-xl text-start"
				>
					Sign In
				</button>
			)}
		</div>
	);
}
