import { db } from "./drizzle";
import { blog, campaign, course, faq, partner, service, file, newsletter, registration, review, referral, referee, pageContent } from "./schema";
import { eq, desc, or, ilike, count, and, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

// --- Blogs ---

export const getBlog = async (id: string) => {
  try {
    const result = await db.select({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      category: blog.category,
      fileId: blog.fileId,
      content: blog.content,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(blog)
      .leftJoin(file, eq(blog.fileId, file.id))
      .where(eq(blog.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getBlog()", error.message);
    return null;
  }
};

export const getBlogsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0" } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(blog.title, `% ${cleanSearchTerm}% `),
        ilike(blog.description, `% ${cleanSearchTerm}% `)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(blog).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.select({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      category: blog.category,
      fileId: blog.fileId,
      content: blog.content,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(blog)
      .leftJoin(file, eq(blog.fileId, file.id))
      .where(whereCondition)
      .orderBy(desc(blog.createdAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: { cursor: results.length > 0 ? results[results.length - 1].id : '', more: hasNextPage, size: results.length },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.log("getBlogsBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const createBlog = async (data: any) => {
  try {
    const [result] = await db.insert(blog).values({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createBlog()", error.message);
    return null;
  }
};

export const updateBlog = async (id: string, data: any) => {
  try {
    // Sanitize data to remove non-database fields and stringified dates
    const { id: _, createdAt: __, updatedAt: ___, imageUrl: ____, ...dbData } = data;

    // Convert string dates back to Date objects if they exist
    if (typeof dbData.createdAt === 'string') delete dbData.createdAt;
    if (typeof dbData.updatedAt === 'string') delete dbData.updatedAt;

    const [result] = await db.update(blog).set({
      ...dbData,
      updatedAt: new Date(),
    }).where(eq(blog.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateBlog()", error.message);
    return null;
  }
};

export const deleteBlog = async (id: string) => {
  try {
    const [result] = await db.delete(blog).where(eq(blog.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteBlog()", error.message);
    return null;
  }
};

// --- Campaigns ---

export const getCampaign = async (id: string) => {
  try {
    const result = await db.select({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      content: campaign.content,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      fileId: campaign.fileId,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(campaign)
      .leftJoin(file, eq(campaign.fileId, file.id))
      .where(eq(campaign.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getCampaign()", error.message);
    return null;
  }
};

export const getCampaignsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0" } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(campaign.title, `% ${cleanSearchTerm}% `),
        ilike(campaign.description, `% ${cleanSearchTerm}% `)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(campaign).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.select({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      content: campaign.content,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      fileId: campaign.fileId,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(campaign)
      .leftJoin(file, eq(campaign.fileId, file.id))
      .where(whereCondition)
      .orderBy(desc(campaign.createdAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: { cursor: results.length > 0 ? results[results.length - 1].id : '', more: hasNextPage, size: results.length },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.log("getCampaignsBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const createCampaign = async (data: any) => {
  try {
    const { startDate, endDate, ...rest } = data;
    const [result] = await db.insert(campaign).values({
      ...rest,
      id: crypto.randomUUID(),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createCampaign()", error.message);
    return null;
  }
};

export const updateCampaign = async (id: string, data: any) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, imageUrl: ____, startDate, endDate, ...dbData } = data;
    if (typeof dbData.createdAt === 'string') delete dbData.createdAt;
    if (typeof dbData.updatedAt === 'string') delete dbData.updatedAt;

    const [result] = await db.update(campaign).set({
      ...dbData,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      updatedAt: new Date(),
    }).where(eq(campaign.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateCampaign()", error.message);
    return null;
  }
};

export const deleteCampaign = async (id: string) => {
  try {
    const [result] = await db.delete(campaign).where(eq(campaign.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteCampaign()", error.message);
    return null;
  }
};

// --- Courses ---

export const getCourse = async (id: string) => {
  try {
    const result = await db.select({
      id: course.id,
      name: course.name,
      title: course.title,
      description: course.description,
      fileId: course.fileId,
      imageId: course.imageId,
      content: course.content,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(course)
      .leftJoin(file, eq(course.fileId, file.id))
      .where(eq(course.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getCourse()", error.message);
    return null;
  }
};

export const getCoursesBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0" } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(course.name, `% ${cleanSearchTerm}% `),
        ilike(course.description, `% ${cleanSearchTerm}% `)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(course).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.select({
      id: course.id,
      name: course.name,
      title: course.title,
      description: course.description,
      fileId: course.fileId,
      imageId: course.imageId,
      content: course.content,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(course)
      .leftJoin(file, eq(course.fileId, file.id))
      .where(whereCondition)
      .orderBy(desc(course.createdAt)).limit(MAX_ITEMS_PER_PAGE).offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: { cursor: results.length > 0 ? results[results.length - 1].id : '', more: hasNextPage, size: results.length },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.log("getCoursesBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const createCourse = async (data: any) => {
  try {
    const [result] = await db.insert(course).values({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createCourse()", error.message);
    return null;
  }
};

export const updateCourse = async (id: string, data: any) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, imageUrl: ____, ...dbData } = data;
    if (typeof dbData.createdAt === 'string') delete dbData.createdAt;
    if (typeof dbData.updatedAt === 'string') delete dbData.updatedAt;

    const [result] = await db.update(course).set({
      ...dbData,
      updatedAt: new Date(),
    }).where(eq(course.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateCourse()", error.message);
    return null;
  }
};

export const deleteCourse = async (id: string) => {
  try {
    const [result] = await db.delete(course).where(eq(course.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteCourse()", error.message);
    return null;
  }
};

// --- FAQs ---

export const getFaqsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", category } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(faq.question, `% ${cleanSearchTerm}% `),
        ilike(faq.answer, `% ${cleanSearchTerm}% `),
        ilike(faq.category, `% ${cleanSearchTerm}% `)
      ));
    }
    if (category) conditions.push(eq(faq.category, category));

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(faq).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.select().from(faq).where(whereCondition)
      .orderBy(desc(faq.createdAt)).limit(MAX_ITEMS_PER_PAGE).offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: { cursor: results.length > 0 ? results[results.length - 1].id : '', more: hasNextPage, size: results.length },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.log("getFaqsBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const createFaq = async (data: any) => {
  try {
    const [result] = await db.insert(faq).values({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createFaq()", error.message);
    return null;
  }
};

export const updateFaq = async (id: string, data: any) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, ...dbData } = data;
    if (typeof dbData.createdAt === 'string') delete dbData.createdAt;
    if (typeof dbData.updatedAt === 'string') delete dbData.updatedAt;

    const [result] = await db.update(faq).set({
      ...dbData,
      updatedAt: new Date(),
    }).where(eq(faq.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateFaq()", error.message);
    return null;
  }
};

export const deleteFaq = async (id: string) => {
  try {
    const [result] = await db.delete(faq).where(eq(faq.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteFaq()", error.message);
    return null;
  }
};

// --- Partners ---

export const getPartner = async (id: string) => {
  try {
    const result = await db.select({
      id: partner.id,
      name: partner.name,
      website: partner.website,
      fileId: partner.fileId,
      type: partner.type,
      country: partner.country,
      content: partner.content,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(partner)
      .leftJoin(file, eq(partner.fileId, file.id))
      .where(eq(partner.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getPartner()", error.message);
    return null;
  }
};

export const getPartnersBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", type, country } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(partner.name, `% ${cleanSearchTerm}% `),
        ilike(partner.type, `% ${cleanSearchTerm}% `),
        ilike(partner.country, `% ${cleanSearchTerm}% `)
      ));
    }
    if (type) conditions.push(eq(partner.type, type));
    if (country) conditions.push(eq(partner.country, country));

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(partner).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.select({
      id: partner.id,
      name: partner.name,
      website: partner.website,
      fileId: partner.fileId,
      type: partner.type,
      country: partner.country,
      content: partner.content,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(partner)
      .leftJoin(file, eq(partner.fileId, file.id))
      .where(whereCondition)
      .orderBy(desc(partner.createdAt)).limit(MAX_ITEMS_PER_PAGE).offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: { cursor: results.length > 0 ? results[results.length - 1].id : '', more: hasNextPage, size: results.length },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.log("getPartnersBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const createPartner = async (data: any) => {
  try {
    const [result] = await db.insert(partner).values({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createPartner()", error.message);
    return null;
  }
};

export const updatePartner = async (id: string, data: any) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, imageUrl: ____, ...dbData } = data;
    if (typeof dbData.createdAt === 'string') delete dbData.createdAt;
    if (typeof dbData.updatedAt === 'string') delete dbData.updatedAt;

    const [result] = await db.update(partner).set({
      ...dbData,
      updatedAt: new Date(),
    }).where(eq(partner.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updatePartner()", error.message);
    return null;
  }
};

export const deletePartner = async (id: string) => {
  try {
    const [result] = await db.delete(partner).where(eq(partner.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deletePartner()", error.message);
    return null;
  }
};

// --- Services ---

export const getService = async (id: string) => {
  try {
    const result = await db.select({
      id: service.id,
      name: service.name,
      description: service.description,
      fileId: service.fileId,
      content: service.content,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(service)
      .leftJoin(file, eq(service.fileId, file.id))
      .where(eq(service.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getService()", error.message);
    return null;
  }
};

export const getServicesBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0" } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(service.name, `% ${cleanSearchTerm}% `),
        ilike(service.description, `% ${cleanSearchTerm}% `)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(service).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.select({
      id: service.id,
      name: service.name,
      description: service.description,
      fileId: service.fileId,
      content: service.content,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(service)
      .leftJoin(file, eq(service.fileId, file.id))
      .where(whereCondition)
      .orderBy(desc(service.createdAt)).limit(MAX_ITEMS_PER_PAGE).offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: { cursor: results.length > 0 ? results[results.length - 1].id : '', more: hasNextPage, size: results.length },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.log("getServicesBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const createService = async (data: any) => {
  try {
    const [result] = await db.insert(service).values({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createService()", error.message);
    return null;
  }
};

export const updateService = async (id: string, data: any) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, imageUrl: ____, ...dbData } = data;
    if (typeof dbData.createdAt === 'string') delete dbData.createdAt;
    if (typeof dbData.updatedAt === 'string') delete dbData.updatedAt;

    const [result] = await db.update(service).set({
      ...dbData,
      updatedAt: new Date(),
    }).where(eq(service.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateService()", error.message);
    return null;
  }
};

export const deleteService = async (id: string) => {
  try {
    const [result] = await db.delete(service).where(eq(service.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteService()", error.message);
    return null;
  }
};

// --- Newsletter ---

export const subscribeNewsletter = async (email: string) => {
  try {
    const [result] = await db.insert(newsletter).values({
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing({ target: newsletter.email }).returning();
    // If result is undefined, the email already existed — still a success
    return { success: true, alreadySubscribed: !result };
  } catch (error: any) {
    console.log("subscribeNewsletter()", error.message);
    return { success: false, error: error.message };
  }
};

// --- Recent Blogs (for "Read More") ---

export const getRecentBlogs = async (excludeId?: string, limit = 3) => {
  try {
    const conditions = excludeId ? ne(blog.id, excludeId) : undefined;
    const results = await db.select({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      createdAt: blog.createdAt,
      imageUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`
    })
      .from(blog)
      .leftJoin(file, eq(blog.fileId, file.id))
      .where(conditions)
      .orderBy(desc(blog.createdAt))
      .limit(limit);
    return results;
  } catch (error: any) {
    console.log("getRecentBlogs()", error.message);
    return [];
  }
};

export const createRegistration = async (data: {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  type?: string;
  data?: any;
}) => {
  try {
    const [result] = await db.insert(registration).values({
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      country: data.country,
      type: data.type,
      data: data.data ? JSON.stringify(data.data) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return { success: true, data: result };
  } catch (error: any) {
    console.log("createRegistration()", error.message);
    return { success: false, error: error.message };
  }
};

// --- Files ---

export const createFileRecord = async (data: { id: string; url: string; directUrl?: string; fileId: string; size: string; type?: string }) => {
  try {
    const [result] = await db.insert(file).values({
      id: data.id,
      url: data.url,
      directUrl: data.directUrl,
      fileId: data.fileId,
      size: data.size,
      type: data.type || 'file',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createFileRecord()", error.message);
    return null;
  }
};

export const deleteFileRecord = async (id: string) => {
  try {
    const [result] = await db.delete(file).where(eq(file.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteFileRecord()", error.message);
    return null;
  }
};

// --- Popup Subscription ---

export const subscribePopup = async (email?: string, phone?: string) => {
  try {
    if (!email && !phone) {
      return { success: false, error: "Email or phone is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const [result] = await db.insert(newsletter).values({
      id: crypto.randomUUID(),
      email: email?.toLowerCase().trim() || null,
      phone: phone?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing({ target: newsletter.email }).returning();

    return { success: true, alreadySubscribed: !result };
  } catch (error: any) {
    console.log("subscribePopup()", error.message);
    return { success: false, error: error.message };
  }
};

// --- Reviews ---

const videoFile = alias(file, "videoFile");
const imageFile = alias(file, "imageFile");

export const getReview = async (id: string) => {
  try {
    const result = await db.select({
      id: review.id,
      name: review.name,
      location: review.location,
      review: review.review,
      rating: review.rating,
      fileId: review.fileId,
      imageId: review.imageId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      videoUrl: sql<string | null>`COALESCE(${videoFile.directUrl}, ${videoFile.url})`,
      imageUrl: sql<string | null>`COALESCE(${imageFile.directUrl}, ${imageFile.url})`
    })
      .from(review)
      .leftJoin(videoFile, eq(review.fileId, videoFile.id))
      .leftJoin(imageFile, eq(review.imageId, imageFile.id))
      .where(eq(review.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getReview()", error.message);
    return null;
  }
};

export const getReviewsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0" } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(review.name, `%${cleanSearchTerm}%`),
        ilike(review.review, `%${cleanSearchTerm}%`),
        ilike(review.location, `%${cleanSearchTerm}%`)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(review).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.select({
      id: review.id,
      name: review.name,
      location: review.location,
      review: review.review,
      rating: review.rating,
      fileId: review.fileId,
      imageId: review.imageId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      videoUrl: sql<string | null>`COALESCE(${videoFile.directUrl}, ${videoFile.url})`,
      imageUrl: sql<string | null>`COALESCE(${imageFile.directUrl}, ${imageFile.url})`
    })
      .from(review)
      .leftJoin(videoFile, eq(review.fileId, videoFile.id))
      .leftJoin(imageFile, eq(review.imageId, imageFile.id))
      .where(whereCondition)
      .orderBy(desc(review.createdAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: { cursor: results.length > 0 ? results[results.length - 1].id : '', more: hasNextPage, size: results.length },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.log("getReviewsBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const createReview = async (data: any) => {
  try {
    const { id, ...rest } = data;
    const [result] = await db.insert(review).values({
      ...rest,
      fileId: data.fileId || null,
      imageId: data.imageId || null,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createReview()", error.message);
    return null;
  }
};

export const updateReview = async (id: string, data: any) => {
  try {
    const { id: _, videoUrl, imageUrl, createdAt, updatedAt, ...rest } = data;
    const [result] = await db.update(review).set({
      ...rest,
      fileId: data.fileId || null,
      imageId: data.imageId || null,
      updatedAt: new Date(),
    }).where(eq(review.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateReview()", error.message);
    return null;
  }
};

export const deleteReview = async (id: string) => {
  try {
    const [result] = await db.delete(review).where(eq(review.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteReview()", error.message);
    return null;
  }
};

// --- Referrals ---

export const getReferral = async (id: string) => {
  try {
    const result = await db.select().from(referral).where(eq(referral.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getReferral()", error.message);
    return null;
  }
};

export const getReferralByEmail = async (email: string) => {
  try {
    const result = await db.select().from(referral).where(eq(referral.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getReferralByEmail()", error.message);
    return null;
  }
};

export const getReferralsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0" } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(referral.name, `%${cleanSearchTerm}%`),
        ilike(referral.email, `%${cleanSearchTerm}%`),
        ilike(referral.phone, `%${cleanSearchTerm}%`)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(referral).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.select()
      .from(referral)
      .where(whereCondition)
      .orderBy(desc(referral.createdAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: { cursor: results.length > 0 ? results[results.length - 1].id : '', more: hasNextPage, size: results.length },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.log("getReferralsBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const createReferral = async (data: any) => {
  try {
    const [result] = await db.insert(referral).values({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createReferral()", error.message);
    return null;
  }
};

export const updateReferral = async (id: string, data: any) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, ...dbData } = data;
    const [result] = await db.update(referral).set({
      ...dbData,
      updatedAt: new Date(),
    }).where(eq(referral.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateReferral()", error.message);
    return null;
  }
};

export const deleteReferral = async (id: string) => {
  try {
    const [result] = await db.delete(referral).where(eq(referral.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteReferral()", error.message);
    return null;
  }
};

// --- Referees ---

export const getReferee = async (id: string) => {
  try {
    const result = await db.select().from(referee).where(eq(referee.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getReferee()", error.message);
    return null;
  }
};

export const getRefereesByReferralId = async (referralId: string) => {
  try {
    return await db.select().from(referee).where(eq(referee.referralId, referralId)).orderBy(desc(referee.createdAt));
  } catch (error: any) {
    console.log("getRefereesByReferralId()", error.message);
    return [];
  }
};

export const getRefereesBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", referralId } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(referee.name, `%${cleanSearchTerm}%`),
        ilike(referee.email, `%${cleanSearchTerm}%`),
        ilike(referee.phone, `%${cleanSearchTerm}%`)
      ));
    }

    if (referralId) {
      conditions.push(eq(referee.referralId, referralId));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(referee).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.select()
      .from(referee)
      .where(whereCondition)
      .orderBy(desc(referee.createdAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: { cursor: results.length > 0 ? results[results.length - 1].id : '', more: hasNextPage, size: results.length },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.log("getRefereesBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const createReferee = async (data: any) => {
  try {
    const [result] = await db.insert(referee).values({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("createReferee()", error.message);
    return null;
  }
};

export const updateReferee = async (id: string, data: any) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, ...dbData } = data;
    const [result] = await db.update(referee).set({
      ...dbData,
      updatedAt: new Date(),
    }).where(eq(referee.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateReferee()", error.message);
    return null;
  }
};

export const deleteReferee = async (id: string) => {
  try {
    const [result] = await db.delete(referee).where(eq(referee.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteReferee()", error.message);
    return null;
  }
};

// --- Page Content ---

export const getPageContent = async (path: string) => {
  try {
    const result = await db.select().from(pageContent).where(eq(pageContent.path, path)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getPageContent()", error.message);
    return null;
  }
};

export const updatePageContent = async (path: string, data: any) => {
  try {
    const { id: _, path: __, updatedAt: ___, ...dbData } = data;
    
    // Check if exists
    const existing = await getPageContent(path);
    
    if (existing) {
      const [result] = await db.update(pageContent).set({
        ...dbData,
        updatedAt: new Date(),
      }).where(eq(pageContent.path, path)).returning();
      return result;
    } else {
      const [result] = await db.insert(pageContent).values({
        ...dbData,
        id: crypto.randomUUID(),
        path,
        updatedAt: new Date(),
      }).returning();
      return result;
    }
  } catch (error: any) {
    console.log("updatePageContent()", error.message);
    return null;
  }
};
