import { getBlogsBySearchFilter, getCoursesBySearchFilter, getCampaignsBySearchFilter, getServicesBySearchFilter, getFaqsBySearchFilter, getPartnersBySearchFilter, getReviewsBySearchFilter } from "$lib/db/crm";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/db/drizzle";
import { pageContent } from "$lib/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async () => {
  // Fetch small batches for the homepage
  const [blogs, courses, campaigns, services, faqs, partners, reviews, dynamicPage] = await Promise.all([
    getBlogsBySearchFilter({ limit: "3" }),
    getCoursesBySearchFilter({ limit: "4" }),
    getCampaignsBySearchFilter({ limit: "3" }),
    getServicesBySearchFilter({ limit: "6" }),
    getFaqsBySearchFilter({ limit: "5" }),
    getPartnersBySearchFilter({ limit: "6" }),
    getReviewsBySearchFilter({ limit: "6" }),
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, '/')
    })
  ]);

  return {
    blogs: blogs.data.data,
    courses: courses.data.data,
    campaigns: campaigns.data.data,
    services: services.data.data,
    faqs: faqs.data.data,
    partners: partners.data.data,
    reviews: reviews.data.data,
    pageContent: dynamicPage
  };
};
