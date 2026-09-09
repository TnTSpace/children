import { getServicesBySearchFilter } from "$lib/db/crm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const services = await getServicesBySearchFilter(params);

  return {
    services
  };
};
