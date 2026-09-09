import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { EDITABLE_PAGES, Role } from '$lib/constants';
import { db } from '$lib/db/drizzle';
import { pageContent } from '$lib/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    throw error(403, 'Forbidden');
  }

  let contents: any[] = [];
  try {
    contents = await db.select().from(pageContent);
  } catch (e) {
    console.error("Error fetching page content:", e);
  }

  return {
    editablePages: EDITABLE_PAGES.map((page) => ({
      ...page,
      lastUpdated: contents.find((c) => c.path === page.path)?.updatedAt ?? null,
      hasContent: contents.some((c) => c.path === page.path)
    }))
  };
};
