import { getPartner } from "$lib/db/crm";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const partner = await getPartner(params.id);

  if (!partner) {
    throw error(404, "Partner institution not found");
  }

  return {
    partner
  };
};
