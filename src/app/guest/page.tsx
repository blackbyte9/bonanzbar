"use client";

import usePrivatePageAuth from "@/lib/auth/usePrivatePageAuth";
import { Loader2 } from "lucide-react";

const ALLOWED_ROLES = ["ADMIN", "ORGANIZER", "USER", "GUEST"] as const;

export default function GuestPage() {
	const { isSessionLoading, isAuthorized, username } =
		usePrivatePageAuth(ALLOWED_ROLES);

	if (isSessionLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!isAuthorized) {
		return null;
	}

	return (
		<main className="p-4">
			<h1>Guest Area</h1>
			<p>Welcome to the guest area! This page is accessible to all users, including guests.</p>
			<p>User name: {username}</p>
		</main>
	);
};
