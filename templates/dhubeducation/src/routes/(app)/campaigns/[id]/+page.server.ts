import { getCampaign } from "$lib/db/crm";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const campaign = await getCampaign(params.id);

  if (!campaign) {
    throw error(404, "Campaign not found");
  }

  return {
    campaign
  };
};
