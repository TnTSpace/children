export interface iMeta {
  title: string;
  keywords: string[];
  description: string;
  ogimage: string;
  link: string;
}

export interface iFetchMeta {
  meta: { cursor: string; more: boolean; size: number; };
  data: any[];
  total: number;
  lastIndex?: number;
}

export interface iBlog {
  id: string;
  title: string;
  description: string;
  category?: string;
  fileId: string | null;
  imageUrl?: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface iCampaign {
  id: string;
  title: string;
  description: string;
  content: string | null;
  startDate: Date | null;
  endDate: Date | null;
  fileId: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface iCourse {
  id: string;
  name: string;
  title: string | null;
  description: string;
  fileId: string | null;
  imageUrl?: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface iFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface iPartner {
  id: string;
  name: string;
  website: string | null;
  fileId: string | null;
  imageUrl?: string | null;
  type: string;
  country: string | null;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface iService {
  id: string;
  name: string;
  description: string;
  fileId: string | null;
  imageUrl?: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface iReview {
  id: string;
  name: string;
  location: string | null;
  review: string;
  rating: number;
  fileId: string | null;      // Video file
  imageId: string | null;     // Reviewer image
  imageUrl?: string | null;   // Joined reviewer image URL
  videoUrl?: string | null;   // Joined video URL
  createdAt: Date;
  updatedAt: Date;
}

export interface iAdmissionDocument {
  id: string;
  admissionId: string;
  category: string;
  fileId: string;
  fileUrl?: string | null;
  fileType?: string | null;
  fileName?: string | null;
  createdAt: Date;
}

export interface iAdmission {
  id: string;
  userId: string;
  // Personal Information
  fullName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  address: string | null;
  maritalStatus: string | null;
  programType: string;
  // Academic Information
  highestQualification: string | null;
  course: string | null;
  yearOfGraduation: string | null;
  grade: string | null;
  // Programme Preferences
  programmeInterest1: string | null;
  programmeInterest2: string | null;
  budget: string | null;
  countryChoice: string | null;
  cityChoice: string | null;
  // Additional Info
  visaRefusedBefore: string | null;
  dependants: string | null;
  personalStatement: string | null;
  proposal: string | null;
  // New Fields
  appliedToOtherSchool: string | null;
  travelingWithOthers: string | null;
  tuitionBudget: string | null;
  depositBudget: string | null;
  immigrationSupport: string | null;
  accommodationSupport: string | null;
  jobSupport: string | null;
  // Legacy document file IDs (kept for backward compat)
  passportFileId: string | null;
  waecFileId: string | null;
  ieltsFileId: string | null;
  transcriptFileId: string | null;
  certificateFileId: string | null;
  cvFileId: string | null;
  referenceLetterFileId: string | null;
  referenceLetterFileId2: string | null;
  // Multi-document support
  documents?: iAdmissionDocument[];
  // Status
  status: string;
  adminNotes: string | null;
  // Legacy computed URLs (kept for backward compat)
  passportUrl?: string | null;
  waecUrl?: string | null;
  ieltsUrl?: string | null;
  transcriptUrl?: string | null;
  certificateUrl?: string | null;
  cvUrl?: string | null;
  referenceLetterUrl?: string | null;
  referenceLetterUrl2?: string | null;
  // User info (admin view)
  userEmail?: string | null;
  userName?: string | null;
  userImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
