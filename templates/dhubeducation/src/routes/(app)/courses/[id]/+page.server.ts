import { getCourse } from "$lib/db/crm";
import { getBlogsBySearchFilter } from "$lib/db/crm";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const [course, blogs] = await Promise.all([
    getCourse(params.id),
    getBlogsBySearchFilter({ limit: "3" })
  ]);

  if (!course) {
    throw error(404, "Course not found");
  }

  return {
    course,
    blogs: blogs.data
  };
};
