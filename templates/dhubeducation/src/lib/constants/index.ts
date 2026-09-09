import Logo from "$lib/components/icons/logo.svelte";
import type { iFetchMeta } from "$lib/interface";
import { FileText, LayoutDashboard, User, Users, Home, Book, Heart, Globe, Lightbulb, GraduationCap, Plane, ShieldCheck, MessageCircle, ClipboardList } from "@lucide/svelte";

export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

export enum Fields {
  USER = 'user',
  BLOG = 'blog',
  CAMPAIGN = 'campaign',
  COURSE = 'course',
  FAQ = 'faq',
  PARTNER = 'partner',
  SERVICE = 'service',
  REVIEW = 'review',
  ADMISSION = 'admission',
  REFERRAL = 'referral',
  REFEREE = 'referee'
}

export const editors = [Role.ADMIN, Role.EDITOR];

export const MAX_ITEMS_PER_PAGE = 12;

export enum Constants {
  BRANDNAME = 'DHUB Education',
  BRANDSLOGAN = 'Study Abroad Pathways',
  CREDENTIAL = 'credential',
  GOOGLE = 'google',
  AFTERAUTH = '/dashboard',
  SUPPORTEMAIL = 'dhubeducation@gmail.com',
  BRANDWEBSITE = 'https://www.dhubeducation.com',
  PHONE = '+447930739927',
  WHATSAPP = 'https://api.whatsapp.com/send/?phone=%2B447930739927&text=Hello',
  FACEBOOK = 'https://www.facebook.com/mydhubeducation/',
  INSTAGRAM = 'https://www.instagram.com/mydhubeducation/',
  TWITTER = 'https://twitter.com/DhubEducation',
  TIKTOK = 'https://www.tiktok.com/@mydhubeducation',
  LOCATION_URL = 'https://g.co/kgs/sahVVBt'
}

export type FileType = 'audio' | 'video' | 'file' | 'image';

// Site Meta for SEO/OG tags
export const SiteMeta = {
  title: 'Dhub Education | Study Abroad Consultants in Nigeria',
  description:
    'Dhub Education helps Nigerian students and parents study abroad with confidence — verified university admissions, visa guidance and honest advice on the UK, Canada, Ireland and beyond.',
  keywords: [
    'study abroad',
    'study abroad consultants Nigeria',
    'study in UK from Nigeria',
    'university admission Nigeria',
    'student visa Nigeria',
    'education consultancy Lagos',
    'study abroad agents Nigeria',
    'Dhub Education',
  ],
  ogimage: '/screenshot-wide.webp',
  link: 'https://dhubeducation.com',
};

export const EDITABLE_PAGES = [
  { name: 'Homepage', path: '/', description: 'Main landing page content and sections' },
  { name: 'About Us', path: '/about', description: 'Company history, mission and vision' },
  { name: 'Contact', path: '/contact', description: 'Contact information and map details' },
  { name: 'Privacy Policy', path: '/privacy-policy', description: 'Data protection and privacy guidelines' },
  { name: 'Cookie Policy', path: '/cookie-policy', description: 'Usage of cookies and tracking' },
  { name: 'Terms of Use', path: '/terms-of-use', description: 'Legal agreement and usage terms' },
];

// Homepage configurable content
export const HomepageContent = {
  hero: [
    {
      subtitle: 'Expert Educational Consultancy',
      title: 'Your Gateway to Global Education',
      description: 'Study Medicine abroad for as low as £9,000/year. We guide you through admissions, visas, and documentation with ease.',
      primaryCta: { text: 'Apply Now', href: '/auth/login?redirectTo=/dashboard' },
      secondaryCta: { text: 'Our Services', href: '#services' },
      backgroundImage: '/homepage_sliders/dhub_1600x600.webp',
    },
    {
      subtitle: 'Achieve Your Dreams',
      title: 'Empowering Your Global Future',
      description: 'DHUB Education has successfully helped thousands achieve their academic dreams worldwide. Join our community today.',
      primaryCta: { text: 'Book Consultation', href: '/auth/login?redirectTo=/dashboard' },
      secondaryCta: { text: 'Learn More', href: '/about' },
      backgroundImage: '/homepage_sliders/contact_1600x600.webp',
    },
    {
      subtitle: 'Expert Guidance',
      title: 'Jordan Recruitment Pathways',
      description: 'Navigate the path to educational excellence through our specialized recruitment programs and blog posts.',
      primaryCta: { text: 'Explore Now', href: '/blogs' },
      secondaryCta: { text: 'Learn More', href: '/contact' },
      backgroundImage: '/homepage_sliders/blog_1600x600.webp',
    }
  ],
  stats: [
    { value: '3,000+', label: 'Applications', emoji: '📝', gradient: 'from-primary/20 to-primary/5' },
    { value: '2,600+', label: 'Admissions', emoji: '🎓', gradient: 'from-secondary/20 to-secondary/5' },
    { value: '2,200+', label: 'Visas Processed', emoji: '✈️', gradient: 'from-primary/20 to-primary/5' },
    { value: '10+', label: 'Countries', emoji: '🌍', gradient: 'from-secondary/20 to-secondary/5' },
  ],
  features: {
    badge: 'Our Expertise',
    title: 'Comprehensive Support for Your Journey',
    description: 'From university selection to post-arrival support, we are with you every step of the way.',
    items: [
      { icon: GraduationCap, title: 'Admissions Guidance', description: 'Personalized university selection and application assistance for global institutions.', gradient: 'from-primary/20 to-primary/5' },
      { icon: Plane, title: 'Visa Assistance', description: 'Expert document preparation and mock interviews for higher success rates.', gradient: 'from-secondary/20 to-secondary/5' },
      { icon: ShieldCheck, title: 'Accommodation & Arrival', description: 'Comprehensive support for settling down and finding the right home abroad.', gradient: 'from-primary/20 to-primary/5' },
      { icon: MessageCircle, title: 'Career & Post-Grad Support', description: 'Guidance beyond graduation with career planning and immigration help.', gradient: 'from-secondary/20 to-secondary/5' },
    ],
  },
  mission: {
    badge: 'Our Vision',
    title: 'Bridging the Gap to Excellence',
    description: 'We strive to make world-class education accessible to every deserving student, regardless of geographical boundaries.',
    values: [
      { icon: ShieldCheck, title: 'Authenticity', description: 'Direct partnerships with recognized universities globally.', gradient: 'from-primary/20 to-primary/5' },
      { icon: Globe, title: 'Global Reach', description: 'Extensive network of educational institutions across 15+ countries.', gradient: 'from-secondary/20 to-secondary/5' },
      { icon: Lightbulb, title: 'Student-First', description: 'Committed to finding the best fit for your academic and financial needs.', gradient: 'from-primary/20 to-primary/5' },
    ],
    coreValues: ['Integrity', 'Transparency', 'Excellence', 'Reliability', 'Empowerment'],
  },
  cta: {
    badge: 'Join Dhub',
    title: 'Ready to Start Your International Career?',
    description: 'Join thousands of successful students who began their journey with Dhub Education. Your future starts here.',
    buttonText: 'Book Free Consultation',
  },
  reviews: [
    {
      name: 'Clarence Olympio',
      image: 'https://lh3.googleusercontent.com/a-/ALV-UjW95vrX4sSrbhM50EtRrA7VWUdOba6UpM3EoRwzbsP-uSELbMw=s40-c-rp-mo-br100',
      rating: 5,
      review: 'With DHUB Education, I had a truly wonderful experience. They provided essential support and guidance throughout my journey—from the moment I decided to study abroad to the day I arrived at my destination.',
      location: 'Ghana 🇬🇭'
    },
    {
      name: 'Motolani Teibo',
      image: 'https://lh3.googleusercontent.com/a/ACg8ocLe3mczX4TJRL1GBccAU4uuhy39gSniG2xsug_5Z5BvqTk4Og=s40-c-rp-mo-br100',
      rating: 5,
      review: "My experience with DHUB Education was amazing. From the onset, they handled my son's case and delivered promptly—from the school application process to the visa application.",
      location: 'Nigeria 🇳🇬'
    },
    {
      name: 'Winnie Schola',
      image: 'https://lh3.googleusercontent.com/a/ACg8ocIo0Klo2itxQMs-52BRjt9qFw3MBtDrcN_Hi-oQV5cBUUrP7g=s40-c-rp-mo-br100',
      rating: 5,
      review: 'I had a great experience with DHUB Education. Their service was exceptional, and they maintained friendly and professional communication. They are compassionate and dedicated.',
      location: 'United Kingdom 🇬🇧'
    }
  ],
  faqs: [
    {
      question: 'How do I start my study abroad application?',
      answer: 'The first step is to book a free consultation with our experts. We will assess your profile, discuss your goals, and guide you through university selection and documentation.'
    },
    {
      question: 'Can I study Medicine for £9,000 per year?',
      answer: 'Yes! We have partner universities in several European countries that offer high-quality medical programs (MBBS/MD) with tuition fees starting as low as £9,000 per year.'
    },
    {
      question: 'Do you assist with student visa applications?',
      answer: "Absolutely. Our visa experts provide comprehensive support, including document preparation, interview coaching, and guidance on financial requirements to ensure a high success rate."
    },
    {
      question: 'What services are included in your support?',
      answer: 'Our services cover university selection, admission processing, documentation (notary/apostille), visa assistance, pre-departure briefing, and post-arrival settlement support.'
    }
  ],
  partners: [
    { name: 'Middlesex University', logo: '🏫', location: 'UK' },
    { name: 'University of Canada', logo: '🏫', location: 'Canada' },
    { name: 'Finland Pathway', logo: '🏫', location: 'Finland' },
    { name: 'France Education', logo: '🏫', location: 'France' },
    { name: 'USA Global', logo: '🏫', location: 'USA' },
    { name: 'Ireland College', logo: '🏫', location: 'Ireland' },
  ],
  courses: [
    { name: 'Medicine (MBBS)', duration: '5-6 Years', price: '£9,000/yr', link: '#' },
    { name: 'Computer Science', duration: '3-4 Years', price: '£12,000/yr', link: '#' },
    { name: 'Business Management', duration: '3 Years', price: '£10,500/yr', link: '#' },
    { name: 'Engineering', duration: '4 Years', price: '£11,000/yr', link: '#' },
  ],
  reels: {
    title: 'Student Life & Success',
    description: 'Catch a glimpse of the global student experience through our curated video reels.',
    items: [
      { videoUrl: '', thumbnailUrl: '', label: 'Campus Tour' },
      { videoUrl: '', thumbnailUrl: '', label: 'Student Testimonial' },
    ]
  }
};

// Utility function for background images
export const getStyle = (imageUrl: string) => `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;

export const documentationRoles = [Role.ADMIN, Role.EDITOR, Role.USER];
export const dashboardRoles = [Role.ADMIN, Role.EDITOR, Role.USER];
export const usersRoles = [Role.ADMIN];
export const profileRoles = [Role.ADMIN, Role.EDITOR, Role.USER];
export const homeRoles = [Role.ADMIN, Role.EDITOR, Role.USER];

export const getNavigation = (reference: string) => {
  const isActive = (url: string) => reference === url;

  const data = {
    teams: [
      {
        name: "Homepage",
        logo: Logo,
        plan: "Dhub Education",
        url: "/"
      },
    ],
    navMain: [
      {
        title: "Documentation",
        url: "/documentation",
        roles: documentationRoles,
        icon: FileText,
        isActive: isActive("/documentation"),
      },
      {
        title: "Dashboard",
        url: "/dashboard",
        roles: dashboardRoles,
        icon: LayoutDashboard,
        isActive: isActive("/dashboard"),
      },

      {
        title: "Applications",
        url: "/application",
        roles: admissionsRoles,
        icon: ClipboardList,
        isActive: isActive("/application"),
      },
      {
        title: "Profile",
        url: "/profile",
        roles: profileRoles,
        icon: User,
        isActive: isActive("/profile"),
      },
      {
        title: "Referral Program",
        url: "/referral",
        roles: homeRoles,
        icon: Users,
        isActive: isActive("/referral"),
      },
      {
        title: "CRM Management",
        url: "#",
        roles: editors,
        icon: Globe,
        isActive: reference.startsWith("/admin"),
        items: [
          { title: "Users", url: "/admin/users", isActive: isActive("/admin/users"), roles: usersRoles },
          { title: "Applications", url: "/admin/application", isActive: isActive("/admin/application") },
          { title: "Blogs", url: "/admin/blogs", isActive: isActive("/admin/blogs") },
          { title: "Campaigns", url: "/admin/campaigns", isActive: isActive("/admin/campaigns") },
          { title: "Courses", url: "/admin/courses", isActive: isActive("/admin/courses") },
          { title: "FAQs", url: "/admin/faqs", isActive: isActive("/admin/faqs") },
          { title: "Partners", url: "/admin/partners", isActive: isActive("/admin/partners") },
          { title: "Services", url: "/admin/services", isActive: isActive("/admin/services") },
          { title: "Reviews", url: "/admin/reviews", isActive: isActive("/admin/reviews") },
          { title: "Referrals", url: "/admin/referrals", isActive: isActive("/admin/referrals") },
          { title: "Pages", url: "/admin/pages", isActive: isActive("/admin/pages") },
        ]
      }
    ],
    publicNav: [
      { name: 'Home', href: '/', icon: Home, roles: homeRoles },
      { name: 'About', href: '/about', icon: Users, roles: homeRoles },
      { name: 'Services', href: '/services', icon: Heart, roles: homeRoles },
      { name: 'Courses', href: '/courses', icon: GraduationCap, roles: homeRoles },
      { name: 'Partners', href: '/partners', icon: Globe, roles: homeRoles },
      { name: 'Referral', href: '/referral-program', icon: Users, roles: homeRoles },
      { name: 'Contact', href: '/contact', icon: MessageCircle, roles: homeRoles },
    ],
    privateNav: [
      { name: 'Home', href: '/', icon: Home, roles: homeRoles },
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: dashboardRoles },
      { name: 'Referral', href: '/referral-program', icon: Users, roles: homeRoles },
    ],
  };

  return data;
};

export const adminRoles = [Role.ADMIN];
export const admissionsRoles = [Role.ADMIN, Role.EDITOR, Role.USER];

export const emptyMetalist: iFetchMeta = {
  total: 0,
  meta: { cursor: '', more: false, size: 0 },
  data: []
};
