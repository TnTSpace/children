import type { PageServerLoad } from './$types';
import { getPageContent } from '$lib/db/crm';

export const load: PageServerLoad = async () => {
  const content = await getPageContent('/referral-program');
  return {
    content
  };
};
