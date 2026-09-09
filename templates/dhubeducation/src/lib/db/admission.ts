import { db } from "./drizzle";
import { admission_application as admission, admission_document, file, user } from "./schema";
import { eq, desc, or, ilike, count, and, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { iAdmission, iAdmissionDocument, iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";
import { env } from "$env/dynamic/private";

/**
 * Robustly formats a file URL based on environment.
 * Replaces localhost with correct endpoint and ensures HTTPS in production.
 */
function formatFileUrl(url: string | null): string | null {
  if (!url) return null;
  const endpoint = env.MINIO_ENDPOINT || 'api.minio.dhubgroup.com';
  const isProd = endpoint.includes('dhubgroup.com');
  
  let formatted = url;
  
  // Replace localhost or any IP with the production endpoint if in prod
  if (isProd && (formatted.includes('localhost') || formatted.includes('127.0.0.1'))) {
    formatted = formatted.replace(/localhost(:\d+)?/, endpoint).replace(/127\.0\.0\.1(:\d+)?/, endpoint);
  } else if (!isProd && formatted.includes('api.minio.dhubgroup.com')) {
    // Reverse: if local but URL is prod, maybe useful for debugging? Usually not.
  }

  // Ensure HTTPS for production
  if (isProd && formatted.startsWith('http://')) {
    formatted = formatted.replace('http://', 'https://');
  }

  // Strip port 9000 if in production (handled by Traefik/reverse proxy)
  if (isProd && formatted.includes(':9000')) {
    formatted = formatted.replace(':9000', '');
  }

  return formatted;
}

// File aliases for each document type (Legacy support for old columns)
const passportFile = alias(file, "passportFile");
const waecFile = alias(file, "waecFile");
const ieltsFile = alias(file, "ieltsFile");
const transcriptFile = alias(file, "transcriptFile");
const certificateFile = alias(file, "certificateFile");
const cvFile = alias(file, "cvFile");
const referenceLetterFile = alias(file, "referenceLetterFile");
const referenceLetterFile2 = alias(file, "referenceLetterFile2");

const admissionSelectFields = {
  id: admission.id,
  userId: admission.userId,
  fullName: admission.fullName,
  email: admission.email,
  phone: admission.phone,
  dateOfBirth: admission.dateOfBirth,
  address: admission.address,
  maritalStatus: admission.maritalStatus,
  programType: admission.programType,
  highestQualification: admission.highestQualification,
  course: admission.course,
  yearOfGraduation: admission.yearOfGraduation,
  grade: admission.grade,
  programmeInterest1: admission.programmeInterest1,
  programmeInterest2: admission.programmeInterest2,
  budget: admission.budget,
  countryChoice: admission.countryChoice,
  cityChoice: admission.cityChoice,
  visaRefusedBefore: admission.visaRefusedBefore,
  dependants: admission.dependants,
  personalStatement: admission.personalStatement,
  proposal: admission.proposal,
  // New Fields
  appliedToOtherSchool: admission.appliedToOtherSchool,
  travelingWithOthers: admission.travelingWithOthers,
  tuitionBudget: admission.tuitionBudget,
  depositBudget: admission.depositBudget,
  immigrationSupport: admission.immigrationSupport,
  accommodationSupport: admission.accommodationSupport,
  jobSupport: admission.jobSupport,
  // Document file IDs
  passportFileId: admission.passportFileId,
  waecFileId: admission.waecFileId,
  ieltsFileId: admission.ieltsFileId,
  transcriptFileId: admission.transcriptFileId,
  certificateFileId: admission.certificateFileId,
  cvFileId: admission.cvFileId,
  referenceLetterFileId: admission.referenceLetterFileId,
  referenceLetterFileId2: admission.referenceLetterFileId2,
  status: admission.status,
  adminNotes: admission.adminNotes,
  createdAt: admission.createdAt,
  updatedAt: admission.updatedAt,
  // File URLs & Types (computed via LEFT JOIN - Legacy)
  passportUrl: sql<string | null>`COALESCE(${passportFile.directUrl}, ${passportFile.url})`,
  passportType: passportFile.type,
  waecUrl: sql<string | null>`COALESCE(${waecFile.directUrl}, ${waecFile.url})`,
  waecType: waecFile.type,
  ieltsUrl: sql<string | null>`COALESCE(${ieltsFile.directUrl}, ${ieltsFile.url})`,
  ieltsType: ieltsFile.type,
  transcriptUrl: sql<string | null>`COALESCE(${transcriptFile.directUrl}, ${transcriptFile.url})`,
  transcriptType: transcriptFile.type,
  certificateUrl: sql<string | null>`COALESCE(${certificateFile.directUrl}, ${certificateFile.url})`,
  certificateType: certificateFile.type,
  cvUrl: sql<string | null>`COALESCE(${cvFile.directUrl}, ${cvFile.url})`,
  cvType: cvFile.type,
  referenceLetterUrl: sql<string | null>`COALESCE(${referenceLetterFile.directUrl}, ${referenceLetterFile.url})`,
  referenceLetterType: referenceLetterFile.type,
  referenceLetterUrl2: sql<string | null>`COALESCE(${referenceLetterFile2.directUrl}, ${referenceLetterFile2.url})`,
  referenceLetterType2: referenceLetterFile2.type,
  // User info for admin view
  userEmail: user.email,
  userName: user.name,
  userImage: user.image,
};

function admissionBaseQuery() {
  return db
    .select(admissionSelectFields)
    .from(admission)
    .leftJoin(passportFile, eq(admission.passportFileId, passportFile.id))
    .leftJoin(waecFile, eq(admission.waecFileId, waecFile.id))
    .leftJoin(ieltsFile, eq(admission.ieltsFileId, ieltsFile.id))
    .leftJoin(transcriptFile, eq(admission.transcriptFileId, transcriptFile.id))
    .leftJoin(certificateFile, eq(admission.certificateFileId, certificateFile.id))
    .leftJoin(cvFile, eq(admission.cvFileId, cvFile.id))
    .leftJoin(referenceLetterFile, eq(admission.referenceLetterFileId, referenceLetterFile.id))
    .leftJoin(referenceLetterFile2, eq(admission.referenceLetterFileId2, referenceLetterFile2.id))
    .leftJoin(user, eq(admission.userId, user.id));
}

async function getAdmissionDocuments(admissionId: string) {
  const endpoint = env.MINIO_ENDPOINT || 'api.minio.dhubgroup.com';
  const docs = await db
    .select({
      id: admission_document.id,
      admissionId: admission_document.admissionId,
      category: admission_document.category,
      fileId: admission_document.fileId,
      fileUrl: sql<string | null>`COALESCE(${file.directUrl}, ${file.url})`,
      fileType: file.type,
      fileName: file.id,
      createdAt: admission_document.createdAt,
    })
    .from(admission_document)
    .leftJoin(file, eq(admission_document.fileId, file.id))
    .where(eq(admission_document.admissionId, admissionId));

  return docs.map(doc => ({
    ...doc,
    fileUrl: formatFileUrl(doc.fileUrl),
  }));
}

export const getAdmission = async (id: string) => {
  try {
    const result = await admissionBaseQuery().where(eq(admission.id, id)).limit(1);
    if (result.length === 0) return null;
    
    const data = result[0];
    const documents = await getAdmissionDocuments(id);
    
    // Dynamic fix for legacy document fields
    DOCUMENT_FIELDS_KEYS.forEach(key => {
      const urlKey = `${key}Url` as keyof typeof data;
      if (typeof data[urlKey] === 'string') {
        (data as any)[urlKey] = formatFileUrl(data[urlKey] as string);
      }
    });
    
    return { ...data, documents } as iAdmission;
  } catch (error: any) {
    console.log("getAdmission()", error.message);
    return null;
  }
};

const DOCUMENT_FIELDS_KEYS = ['passport', 'waec', 'ielts', 'transcript', 'certificate', 'cv', 'referenceLetter', 'referenceLetter2'];

export const getAdmissionByUserId = async (userId: string) => {
  try {
    const result = await admissionBaseQuery().where(eq(admission.userId, userId)).limit(1);
    if (result.length === 0) return null;

    const data = result[0];
    const documents = await getAdmissionDocuments(data.id);
    DOCUMENT_FIELDS_KEYS.forEach(key => {
      const urlKey = `${key}Url` as keyof typeof data;
      if (typeof data[urlKey] === 'string') {
        (data as any)[urlKey] = formatFileUrl(data[urlKey] as string);
      }
    });

    return { ...data, documents } as iAdmission;
  } catch (error: any) {
    console.log("getAdmissionByUserId()", error.message);
    return null;
  }
};

export const getOrCreateAdmission = async (user: { id: string, name?: string | null, email?: string | null }) => {
  try {
    let app = await getAdmissionByUserId(user.id);
    if (app) return app;

    // Create new application
    const id = crypto.randomUUID();
    await db.insert(admission).values({
      id,
      userId: user.id,
      status: "submitted", // Default to submitted now that we removed draft flow
      fullName: user.name || "",
      email: user.email || "",
      programType: "undergraduate",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await getAdmission(id);
  } catch (error: any) {
    console.log("getOrCreateAdmission()", error.message);
    return null;
  }
}

export const getAdmissionsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", status: statusFilter, programType: programFilter } = params;
    const offset = parseInt(offsetStr) || 0;
    const cleanSearchTerm = searchTerm.trim();

    const conditions: any[] = [];

    if (cleanSearchTerm.length > 0) {
      conditions.push(
        or(
          ilike(admission.fullName, `%${cleanSearchTerm}%`),
          ilike(admission.email, `%${cleanSearchTerm}%`),
          ilike(user.email, `%${cleanSearchTerm}%`),
          ilike(user.name, `%${cleanSearchTerm}%`)
        )
      );
    }

    if (statusFilter && statusFilter !== "all" && statusFilter !== "undefined" && statusFilter !== "null") {
      conditions.push(eq(admission.status, statusFilter));
    }
    if (programFilter && programFilter !== "all" && programFilter !== "undefined" && programFilter !== "null") {
      conditions.push(eq(admission.programType, programFilter));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: sql<string>`count(*)` })
      .from(admission)
      .leftJoin(user, eq(admission.userId, user.id))
      .where(whereCondition);

    const total = parseInt(totalResult[0]?.count || "0");

    const results = await admissionBaseQuery()
      .where(whereCondition)
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)
      .orderBy(desc(admission.updatedAt));

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    results.forEach(data => {
      DOCUMENT_FIELDS_KEYS.forEach(key => {
        const urlKey = `${key}Url` as keyof typeof data;
        if (typeof data[urlKey] === 'string') {
          (data as any)[urlKey] = formatFileUrl(data[urlKey] as string);
        }
      });
    });

    const meta: iFetchMeta = {
      total,
      meta: {
        cursor: results.length > 0 ? results[results.length - 1].id : '',
        more: hasNextPage,
        size: results.length
      },
      data: results as iAdmission[],
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.error("❌ getAdmissionsBySearchFilter Error:", error);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const getAdmissionStats = async () => {
  try {
    const totalResult = await db.select({ count: count() }).from(admission);
    const submittedResult = await db.select({ count: count() }).from(admission).where(eq(admission.status, "submitted"));
    const underReviewResult = await db.select({ count: count() }).from(admission).where(eq(admission.status, "under_review"));
    const approvedResult = await db.select({ count: count() }).from(admission).where(eq(admission.status, "approved"));
    const rejectedResult = await db.select({ count: count() }).from(admission).where(eq(admission.status, "rejected"));

    return {
      total: totalResult[0].count,
      submitted: submittedResult[0].count,
      underReview: underReviewResult[0].count,
      approved: approvedResult[0].count,
      rejected: rejectedResult[0].count,
    };
  } catch (error: any) {
    console.log("getAdmissionStats()", error.message);
    return { total: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0 };
  }
};

export const updateAdmission = async (id: string, data: Record<string, any>) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, userEmail: ____, userName: _____, userImage: ______, documents: _______, ...dbData } = data;
    Object.keys(dbData).forEach(key => {
      if (key.endsWith('Url') || key.endsWith('Url2') || key.endsWith('Type') || key.endsWith('Type2')) delete dbData[key];
    });

    const [result] = await db.update(admission).set({
      ...dbData,
      updatedAt: new Date(),
    }).where(eq(admission.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateAdmission()", error.message);
    return null;
  }
};

export const updateAdmissionStatus = async (id: string, status: string, adminNotes?: string) => {
  try {
    const updateData: any = { status, updatedAt: new Date() };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const [result] = await db.update(admission).set(updateData).where(eq(admission.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("updateAdmissionStatus()", error.message);
    return null;
  }
};

export const addAdmissionDocument = async (admissionId: string, category: string, fileId: string) => {
  try {
    const [result] = await db.insert(admission_document).values({
      id: crypto.randomUUID(),
      admissionId,
      category,
      fileId,
      createdAt: new Date(),
    }).returning();
    return result;
  } catch (error: any) {
    console.log("addAdmissionDocument()", error.message);
    return null;
  }
};

export const removeAdmissionDocument = async (id: string) => {
  try {
    const [result] = await db.delete(admission_document).where(eq(admission_document.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("removeAdmissionDocument()", error.message);
    return null;
  }
};

export const deleteAdmission = async (id: string) => {
  try {
    const [result] = await db.delete(admission).where(eq(admission.id, id)).returning();
    return result;
  } catch (error: any) {
    console.log("deleteAdmission()", error.message);
    return null;
  }
};
