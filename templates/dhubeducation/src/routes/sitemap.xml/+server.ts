import type { RequestHandler } from "./$types";
import { db } from "$lib/db/drizzle";
import { blog, course, service } from "$lib/db/schema";
import { desc } from "drizzle-orm";
import { SITE_URL, blogPath } from "$lib/seo";

/**
 * Generated from the database on every request (cached for an hour) so a post
 * published by the daily generator is discoverable immediately, instead of
 * waiting for someone to regenerate a static file by hand.
 */

type Entry = { path: string; lastmod?: Date | string | null; changefreq: string; priority: string };

const STATIC_PAGES: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/courses", changefreq: "weekly", priority: "0.9" },
  { path: "/blogs", changefreq: "daily", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/referral-program", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/cookie-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms-of-use", changefreq: "yearly", priority: "0.3" },
];

const xmlEscape = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toEntry = (e: Entry): string => {
  const lastmod = e.lastmod ? new Date(e.lastmod).toISOString() : null;
  return [
    "  <url>",
    `    <loc>${xmlEscape(SITE_URL + e.path)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${e.changefreq}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
};

export const GET: RequestHandler = async ({ setHeaders }) => {
  const entries: Entry[] = [...STATIC_PAGES];

  try {
    const posts = await db
      .select({ id: blog.id, title: blog.title, updatedAt: blog.updatedAt, createdAt: blog.createdAt })
      .from(blog)
      .orderBy(desc(blog.createdAt));

    for (const post of posts) {
      entries.push({
        path: blogPath(post),
        lastmod: post.updatedAt ?? post.createdAt,
        changefreq: "monthly",
        priority: "0.8",
      });
    }
  } catch (e) {
    console.error("[sitemap] blog query failed:", e);
  }

  try {
    const courses = await db
      .select({ id: course.id, updatedAt: course.updatedAt })
      .from(course)
      .orderBy(desc(course.createdAt));
    for (const c of courses) {
      entries.push({ path: `/courses/${c.id}`, lastmod: c.updatedAt, changefreq: "monthly", priority: "0.7" });
    }
  } catch (e) {
    console.error("[sitemap] course query failed:", e);
  }

  try {
    const services = await db
      .select({ id: service.id, updatedAt: service.updatedAt })
      .from(service)
      .orderBy(desc(service.createdAt));
    for (const s of services) {
      entries.push({ path: `/services/${s.id}`, lastmod: s.updatedAt, changefreq: "monthly", priority: "0.6" });
    }
  } catch (e) {
    console.error("[sitemap] service query failed:", e);
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.map(toEntry).join("\n") +
    `\n</urlset>`;

  setHeaders({
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=0, s-maxage=3600",
  });

  return new Response(xml);
};
