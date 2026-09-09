import type { User, Session } from "$lib/auth";

declare global {
	namespace App {
		interface Locals {
			user: User | undefined;
			session: Session | undefined;
		}
		interface PageData {
			user: User | null;
			popupCampaign?: {
				id: string;
				title: string;
				description: string;
				content: string | null;
				startDate: Date | null;
				endDate: Date | null;
				fileId: string | null;
				imageUrl?: string | null;
				createdAt: Date;
				updatedAt: Date;
			} | null;
			popupBlog?: {
				id: string;
				title: string;
				description: string;
				createdAt: Date;
				imageUrl?: string | null;
			} | null;
		}
	}
}

export {};
