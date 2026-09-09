import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const file = pgTable("file", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  directUrl: text("direct_url"),
  fileId: text("file_id").notNull(),
  size: text("size").notNull(),
  type: text("type"), // 'audio' | 'video' | 'file' | 'image'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const service = pgTable("service", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  fileId: text("file_id").references(() => file.id, { onDelete: "set null" }),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const blog = pgTable("blog", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").default("General"),
  fileId: text("file_id").references(() => file.id, { onDelete: "set null" }),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const campaign = pgTable("campaign", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  fileId: text("file_id").references(() => file.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const course = pgTable("course", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"), // For qualification levels like BSc (Hons)
  description: text("description").notNull(),
  fileId: text("file_id").references(() => file.id, { onDelete: "set null" }),
  imageId: text("image_id").references(() => image.id, { onDelete: "set null" }),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const image = pgTable("image", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  fileId: text("file_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const keyval = pgTable("keyval", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const newsletter = pgTable("newsletter", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const referral = pgTable("referral", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  gender: text("gender"),
  data: text("data"), // JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const referee = pgTable("referee", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  gender: text("gender"),
  data: text("data"), // JSON string
  referralId: text("referral_id").references(() => referral.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const registration = pgTable("registration", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country"),
  type: text("type"),
  data: text("data"), // JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const faq = pgTable("faq", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const partner = pgTable("partner", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website").notNull(),
  fileId: text("file_id").references(() => file.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  country: text("country").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const review = pgTable("review", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  review: text("review").notNull(),
  rating: text("rating").notNull().default("5"),
  fileId: text("file_id").references(() => file.id, { onDelete: "set null" }), // Video
  imageId: text("image_id").references(() => file.id, { onDelete: "set null" }), // Reviewer image (using file table for consistency)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pageContent = pgTable("page_content", {
  id: text("id").primaryKey(),
  path: text("path").notNull().unique(),
  title: text("title"),
  description: text("description"),
  ogImage: text("og_image"),
  data: text("data"), // JSON string for flexible content
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const admission_application = pgTable("admission_application", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),

  // Personal Information
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  maritalStatus: text("marital_status"), // "single" | "married"
  programType: text("program_type").notNull(), // "foundation" | "undergraduate" | "masters" | "research_masters"

  // Academic Information
  highestQualification: text("highest_qualification"), // "olevel" | "ond" | "hnd" | "bsc" | "msc"
  course: text("course"),
  yearOfGraduation: text("year_of_graduation"),
  grade: text("grade"),

  // Programme Preferences
  programmeInterest1: text("programme_interest_1"),
  programmeInterest2: text("programme_interest_2"),
  budget: text("budget"),
  countryChoice: text("country_choice"),
  cityChoice: text("city_choice"),

  // Additional Info
  visaRefusedBefore: text("visa_refused_before"), // "yes" | "no" + details
  dependants: text("dependants"), // Masters only: number of dependants
  personalStatement: text("personal_statement"), // Masters only
  proposal: text("proposal"), // Research masters only

  // New Fields
  appliedToOtherSchool: text("applied_to_other_school"),
  travelingWithOthers: text("traveling_with_others"),
  tuitionBudget: text("tuition_budget"),
  depositBudget: text("deposit_budget"),
  immigrationSupport: text("immigration_support").default("None"),
  accommodationSupport: text("accommodation_support").default("None"),
  jobSupport: text("job_support").default("None"),

  // Document file references (all reference the file table)
  passportFileId: text("passport_file_id").references(() => file.id, { onDelete: "set null" }),
  waecFileId: text("waec_file_id").references(() => file.id, { onDelete: "set null" }),
  ieltsFileId: text("ielts_file_id").references(() => file.id, { onDelete: "set null" }),
  transcriptFileId: text("transcript_file_id").references(() => file.id, { onDelete: "set null" }),
  certificateFileId: text("certificate_file_id").references(() => file.id, { onDelete: "set null" }),
  cvFileId: text("cv_file_id").references(() => file.id, { onDelete: "set null" }),
  referenceLetterFileId: text("reference_letter_file_id").references(() => file.id, { onDelete: "set null" }),
  referenceLetterFileId2: text("reference_letter_file_id_2").references(() => file.id, { onDelete: "set null" }), // Masters needs 2 references

  // Status tracking
  status: text("status").notNull().default("draft"), // "draft" | "submitted" | "under_review" | "approved" | "rejected" | "additional_info_required"
  adminNotes: text("admin_notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const admission_document = pgTable("admission_document", {
  id: text("id").primaryKey(),
  admissionId: text("admission_id").notNull().references(() => admission_application.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 'passport', 'waec', 'ielts', 'transcript', 'certificate', 'cv', 'referenceLetter'
  fileId: text("file_id").notNull().references(() => file.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schema = {
  user,
  session,
  account,
  verification,
  file,
  service,
  blog,
  campaign,
  course,
  faq,
  partner,
  image,
  keyval,
  newsletter,
  referral,
  referee,
  registration,
  pageContent,
  review,
  admission_application,
  admission_document,
};
