import { getCampaignsBySearchFilter, getRecentBlogs } from "$lib/db/crm";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  const [campaignsResult, recentBlogs] = await Promise.all([
    getCampaignsBySearchFilter({}),
    getRecentBlogs(undefined, 1),
  ]);

  // campaignsResult.data has shape: { meta: {...}, data: Campaign[], total: number }
  const campaigns = campaignsResult.status === "success" ? (campaignsResult.data?.data || []) : [];
  const now = new Date();

  // Find the first active or upcoming campaign
  const popupCampaign = campaigns.find((c: any) => {
    const start = c.startDate ? new Date(c.startDate) : null;
    const end = c.endDate ? new Date(c.endDate) : null;
    if (!start) return false;
    // Active: startDate <= now <= endDate
    // Upcoming: startDate > now
    const isActive = start <= now && (!end || end >= now);
    const isUpcoming = start > now;
    return isActive || isUpcoming;
  }) || null;

  return {
    popupCampaign,
    popupBlog: recentBlogs.length > 0 ? recentBlogs[0] : null,
  };
};
