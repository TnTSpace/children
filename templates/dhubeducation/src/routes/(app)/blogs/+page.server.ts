import { getBlogsBySearchFilter } from "$lib/db/crm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const blogs = await getBlogsBySearchFilter(params);

  return {
    blogs
  };
};
