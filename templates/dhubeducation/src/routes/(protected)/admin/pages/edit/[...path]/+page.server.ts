import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { Role, HomepageContent } from '$lib/constants';
import { db } from '$lib/db/drizzle';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    throw error(403, 'Forbidden');
  }

  let path = params.path;
  if (path === 'home') path = '/';
  else if (!path.startsWith('/')) path = '/' + path;

  let content = null;
  try {
    content = await db.query.pageContent.findFirst({
      where: eq(pageContent.path, path)
    });
  } catch (e) {
    console.error("Error fetching page content:", e);
  }

  // Seed default content for homepage if missing
  if (path === '/' && (!content || !content.data || content.data === '{}')) {
    const seedData = {
      hero: HomepageContent.hero,
      stats: HomepageContent.stats,
      features: HomepageContent.features,
      mission: HomepageContent.mission,
      reels: HomepageContent.reels,
      cta: HomepageContent.cta
    };

    content = {
      path,
      data: JSON.stringify(seedData),
      title: 'Home',
      description: 'Dhub Education Homepage',
      ogImage: ''
    } as any;
  }

  return {
    path,
    pageContent: content ?? { path, data: '{}', title: '', description: '', ogImage: '' }
  };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== Role.ADMIN) {
      throw error(403, 'Forbidden');
    }

    const formData = await request.formData();
    const path = formData.get('path') as string;
    const data = formData.get('data') as string;

    if (!path || data === null) return fail(400, { message: 'Missing required fields' });

    try {
      const existing = await db.query.pageContent.findFirst({
        where: eq(pageContent.path, path)
      });

      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const ogImage = formData.get('ogImage') as string;

      if (existing) {
        await db.update(pageContent)
          .set({ data, title, description, ogImage, updatedAt: new Date() })
          .where(eq(pageContent.path, path));
      } else {
        await db.insert(pageContent).values({
          id: crypto.randomUUID(),
          path,
          data,
          title,
          description,
          ogImage
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Update error:", e);
      return fail(500, { message: 'Failed to update content. Database table might be missing.' });
    }
  }
};
