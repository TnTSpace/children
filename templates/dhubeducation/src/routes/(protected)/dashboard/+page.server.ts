import type { PageServerLoad } from './$types';
import { getAdmissionByUserId } from '$lib/db/admission';

export const load = (async ({ locals }) => {
  if (!locals.user) return { admission: null };

  const admission = await getAdmissionByUserId(locals.user.id);

  return { 
    admission 
  };
}) satisfies PageServerLoad;
