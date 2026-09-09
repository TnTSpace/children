import { getService, createRegistration } from "$lib/db/crm";
import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const service = await getService(params.id);

  if (!service) {
    throw error(404, "Service not found");
  }

  return {
    service
  };
};

export const actions: Actions = {
  requestConsultation: async ({ request, params }) => {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!name || !email) {
      return fail(400, {
        success: false,
        message: "Full name and email are required to proceed."
      });
    }

    const res = await createRegistration({
      name,
      email,
      phone,
      type: "service_consultation",
      data: { serviceId: params.id }
    });

    if (!res.success) {
      return fail(500, {
        success: false,
        message: res.error || "Something went wrong while submitting your request. Please try again."
      });
    }

    return {
      success: true,
      message: "Success! Our team will contact you within 24 hours to schedule your consultation."
    };
  }
};
