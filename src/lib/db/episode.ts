import { db } from "./drizzle";
import { episode } from "./schema";
import { eq, desc, asc, or, ilike, count, and, gt, lt } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export type EpisodeSort = "newest" | "oldest" | "title";

const episodeCard = {
  id: episode.id,
  dayNumber: episode.dayNumber,
  category: episode.category,
  title: episode.title,
  description: episode.description,
  scriptureRef: episode.scriptureRef,
  coverImageUrl: episode.coverImageUrl,
  createdAt: episode.createdAt,
};

/**
 * PUBLIC episode search/filter/sort — mirrors getUsersBySearchFilter's
 * shape (same iFetchMeta contract, same offset/MAX_ITEMS_PER_PAGE
 * pagination) but deliberately has no auth gate, since stories are public
 * content, not an admin resource. Only ever returns published episodes.
 */
export const getEpisodesBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", sort = "newest", category } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [eq(episode.status, "published")];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(episode.title, `%${cleanSearchTerm}%`),
        ilike(episode.description, `%${cleanSearchTerm}%`),
        ilike(episode.category, `%${cleanSearchTerm}%`),
        ilike(episode.scriptureRef, `%${cleanSearchTerm}%`)
      ));
    }
    if (category) conditions.push(eq(episode.category, category));

    const whereCondition = and(...conditions);
    const orderBy = sort === "oldest" ? asc(episode.dayNumber) : sort === "title" ? asc(episode.title) : desc(episode.dayNumber);

    const totalResult = await db.select({ count: count() }).from(episode).where(whereCondition);
    const total = totalResult[0].count;

    const episodes = await db.select(episodeCard).from(episode).where(whereCondition)
      .orderBy(orderBy).limit(MAX_ITEMS_PER_PAGE).offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const episodesMeta: iFetchMeta = {
      total,
      meta: { cursor: episodes.length > 0 ? episodes[episodes.length - 1].id : '', more: hasNextPage, size: episodes.length },
      data: episodes,
    };

    return { status: "success", data: episodesMeta };
  } catch (error: any) {
    console.log("getEpisodesBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

/** SSR-side equivalent of the first page, for the crawlable initial render. */
export const getFirstEpisodePage = async (params: Record<string, string> = {}) => {
  const result = await getEpisodesBySearchFilter({ ...params, offset: "0" });
  return result.data as iFetchMeta;
};

export const getAllCategories = async () => {
  const rows = await db.selectDistinct({ category: episode.category }).from(episode).where(eq(episode.status, "published"));
  return rows.map((r) => r.category).sort();
};

/** For the homepage's auto-scrolling carousel — every published episode, capped for payload sanity. */
export const getCarouselEpisodes = async (limit = 60) => {
  return db.select(episodeCard).from(episode).where(eq(episode.status, "published")).orderBy(desc(episode.dayNumber)).limit(limit);
};

/**
 * The published episode immediately before/after a given dayNumber, for the
 * blog detail page's Previous/Next navigation. dayNumber is unique and
 * densely ordered (see schema), so adjacency by dayNumber is simpler and
 * more meaningful to readers than createdAt — it always matches the "Day N"
 * badge shown on the page itself.
 */
export const getAdjacentEpisodes = async (dayNumber: number) => {
  const [prev] = await db.select(episodeCard).from(episode)
    .where(and(eq(episode.status, "published"), lt(episode.dayNumber, dayNumber)))
    .orderBy(desc(episode.dayNumber)).limit(1);

  const [next] = await db.select(episodeCard).from(episode)
    .where(and(eq(episode.status, "published"), gt(episode.dayNumber, dayNumber)))
    .orderBy(asc(episode.dayNumber)).limit(1);

  return { prev: prev ?? null, next: next ?? null };
};
