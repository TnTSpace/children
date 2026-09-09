import { getBlog, getRecentBlogs } from "$lib/db/crm";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import {
  articleJsonLd,
  blogPath,
  blogUrl,
  breadcrumbJsonLd,
  clamp,
  extractFaq,
  extractSeo,
  jsonLdDocument,
  organization,
  readingMinutes,
  resolveBlogId,
} from "$lib/seo";

export const load: PageServerLoad = async ({ params }) => {
  // Accepts both `/blogs/<slug>--<id>` and the legacy `/blogs/<id>`.
  const id = resolveBlogId(params.id);
  const blog = await getBlog(id);

  if (!blog) {
    throw error(404, "Blog post not found");
  }

  // Send every legacy or mistyped URL to the canonical one so ranking signals
  // consolidate on a single address.
  const canonicalPath = blogPath(blog);
  if (params.id !== canonicalPath.replace("/blogs/", "")) {
    throw redirect(301, canonicalPath);
  }

  const { seo, content } = extractSeo(blog.content);
  const faq = extractFaq(content);
  const post = { ...blog, content };

  const jsonLd = jsonLdDocument(
    organization(),
    articleJsonLd(post, seo, faq),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Insights", url: "/blogs" },
      { name: clamp(post.title, 60), url: canonicalPath },
    ]),
  );

  const relatedBlogs = await getRecentBlogs(id, 3);

  return {
    blog: post,
    relatedBlogs,
    seo,
    faq,
    jsonLd,
    canonical: blogUrl(post),
    readingMinutes: readingMinutes(content),
  };
};
