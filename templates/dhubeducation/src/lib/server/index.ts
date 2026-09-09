import { adminRoles, Fields, Role } from "$lib/constants";
import type { iFetchMeta } from "$lib/interface";
import { getUsersBySearchFilter } from "$lib/db/user";
import { json } from "@sveltejs/kit";

export const fetchSearchFilterList = async (params: Record<string, string>, list: Fields) => {
  switch (list) {
    case Fields.USER:
      const usersResult = await getUsersBySearchFilter(params);
      return usersResult.data as iFetchMeta;
    case Fields.BLOG:
      const { getBlogsBySearchFilter } = await import("$lib/db/crm");
      const blogsResult = await getBlogsBySearchFilter(params);
      return blogsResult.data as iFetchMeta;
    case Fields.CAMPAIGN:
      const { getCampaignsBySearchFilter } = await import("$lib/db/crm");
      const campaignsResult = await getCampaignsBySearchFilter(params);
      return campaignsResult.data as iFetchMeta;
    case Fields.COURSE:
      const { getCoursesBySearchFilter } = await import("$lib/db/crm");
      const coursesResult = await getCoursesBySearchFilter(params);
      return coursesResult.data as iFetchMeta;
    case Fields.FAQ:
      const { getFaqsBySearchFilter } = await import("$lib/db/crm");
      const faqsResult = await getFaqsBySearchFilter(params);
      return faqsResult.data as iFetchMeta;
    case Fields.PARTNER:
      const { getPartnersBySearchFilter } = await import("$lib/db/crm");
      const partnersResult = await getPartnersBySearchFilter(params);
      return partnersResult.data as iFetchMeta;
    case Fields.SERVICE:
      const { getServicesBySearchFilter } = await import("$lib/db/crm");
      const servicesResult = await getServicesBySearchFilter(params);
      return servicesResult.data as iFetchMeta;
    case Fields.REVIEW:
      const { getReviewsBySearchFilter } = await import("$lib/db/crm");
      const reviewsResult = await getReviewsBySearchFilter(params);
      return reviewsResult.data as iFetchMeta;
    case Fields.ADMISSION:
      const { getAdmissionsBySearchFilter } = await import("$lib/db/admission");
      const admissionsResult = await getAdmissionsBySearchFilter(params);
      return admissionsResult.data as iFetchMeta;
    case Fields.REFERRAL:
      const { getReferralsBySearchFilter } = await import("$lib/db/crm");
      const referralsResult = await getReferralsBySearchFilter(params);
      return referralsResult.data as iFetchMeta;
    case Fields.REFEREE:
      const { getRefereesBySearchFilter } = await import("$lib/db/crm");
      const refereesResult = await getRefereesBySearchFilter(params);
      return refereesResult.data as iFetchMeta;
  }
}

export const authGuard = async (locals: App.Locals, authorizedPersonels?: Role[]) => {
  const user = locals.user;
  if (!user) return { authorized: false, message: 'Unauthenticated' };
  const personnels = authorizedPersonels ? authorizedPersonels : adminRoles;
  if (!personnels.includes(user.role as Role)) return { authorized: false, message: 'Unauthorized' };
  return { authorized: true, message: 'passes check' };
};

export const getSearchFilterList = async (locals: App.Locals, url: URL, field: Fields) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => { params[key] = value; });
  const list = await fetchSearchFilterList(params, field);
  return json(list);
};
