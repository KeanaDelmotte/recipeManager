"use client";
import { User } from "next-auth";
import { signOut, signIn } from "next-auth/react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa6";
import Link from "next/link";

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
		<div className="sticky top-0 z-10 bg-black flex flex-row justify-between p-2">
			{/* Right Side - Home Link */}
			<Link href="/" className="text-white text-2xl">
				Recipe Manager
			</Link>
			{/* Left Side - Login/User */}
			<div>
				{user && (
					<div className="flex">
						<Image
							src={user.image ?? "public/default-user.svg"}
							alt="user image"
							className="rounded-2xl cursor-pointer size-8"
							width={30}
							height={30}
							onClick={() => setShowMenu(true)}
						/>
						<p className="text-white ml-3">{`Welcome, ${user.name}`}</p>
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
			className="flex flex-col p-1 absolute right-0 z-10 bg-black border border-black"
			ref={ref}
		>
			{user && (
				<button
					onClick={async () => {
						await signOut();
						dismiss();
					}}
					className="text-white cursor-pointer"
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
					className="text-white cursor-pointer"
				>
					Sign In
				</button>
			)}
		</div>
	);
}
