import { json } from "@sveltejs/kit";
import { subscribeNewsletter } from "$lib/db/crm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ success: false, message: "Please enter a valid email address" }, { status: 400 });
    }

    const result = await subscribeNewsletter(email);

    if (!result.success) {
      return json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
    }

    if (result.alreadySubscribed) {
      return json({ success: true, message: "You're already subscribed! Thank you for your continued interest." });
    }

    return json({ success: true, message: "Welcome aboard! You've been successfully subscribed." });
  } catch (error) {
    return json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
};
