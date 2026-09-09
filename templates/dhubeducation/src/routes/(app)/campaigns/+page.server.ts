import { getCampaignsBySearchFilter } from "$lib/db/crm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const campaigns = await getCampaignsBySearchFilter(params);

  return {
    campaigns
  };
};
