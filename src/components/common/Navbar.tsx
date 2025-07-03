"use client";
import { User } from "next-auth";
import { signOut, signIn } from "next-auth/react";
import Image from "next/image";
import styles from "./Navbar.module.css";
import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa6";
import { cn } from "@/lib/utils";
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
		<div className={styles.navbar}>
			<Link href="/" className={cn(styles.title, "text-white")}>
				Recipe Manager
			</Link>

			<div className={styles.options}>
				{user && (
					<div className={styles.user}>
						<Image
							src={user.image ?? "public/default-user.svg"}
							alt="user image"
							className={cn(styles.userImage, "rounded-2xl")}
							width={30}
							height={30}
							onClick={() => setShowMenu(true)}
						/>
						<p className="text-white ml-3">{`Welcome, ${user.name}`}</p>
					</div>
				)}
				{!user && (
					<FaUser
						className={styles.userImage}
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
		<div className={styles.userMenu} ref={ref}>
			{user && (
				<button
					onClick={async () => {
						await signOut();
						dismiss();
					}}
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
				>
					Sign In
				</button>
			)}
		</div>
	);
}
