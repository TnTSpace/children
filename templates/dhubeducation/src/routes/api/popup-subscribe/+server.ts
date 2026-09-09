import { json } from "@sveltejs/kit";
import { subscribePopup } from "$lib/db/crm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, phone } = await request.json();

    if (!email && !phone) {
      return json({ success: false, message: "Email or phone is required" }, { status: 400 });
    }

    const result = await subscribePopup(email, phone);

    if (!result.success) {
      return json({ success: false, message: result.error || "Something went wrong. Please try again." }, { status: 500 });
    }

    if (result.alreadySubscribed) {
      return json({ success: true, message: "You're already subscribed! Thank you for your continued interest." });
    }

    return json({ success: true, message: "Welcome aboard! You've been successfully subscribed." });
  } catch (error: any) {
    return json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
};
