import Logo from "$lib/components/icons/logo.svelte";
import type { iFetchMeta } from "$lib/interface";
import { FileText, LayoutDashboard, User, Users, Home, Book, Music, Heart, Globe, Lightbulb, Cross, Film, Sparkles, Coins, Layers, Wand2, Link2, Zap } from "@lucide/svelte";

export enum Role {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

export enum Fields { USER = 'user' }

export const MAX_ITEMS_PER_PAGE = 12;

export enum Constants {
  BRANDNAME = 'toolsntuts',
  CREDENTIAL = 'credential',
  GOOGLE = 'google',
  AFTERAUTH = '/dashboard',
  SUPPORTEMAIL = 'support@toolsntuts.com',
  BRANDWEBSITE = 'https://toolsntuts.com',
}

export type FileType = 'audio' | 'video' | 'file' | 'image';

// Site Meta for SEO/OG tags
export const SiteMeta = {
  title: 'toolsntuts — AI Productivity Studio',
  description: 'Turn any idea into a captivating 90-second video. Cinematic series, viral shorts, lesson content — generated end-to-end with AI for under $2.',
  keywords: ['ai video generator', 'ai productivity', 'toolsntuts', '90 second video', 'cinematic ai', 'lesson video ai', 'viral video generator'],
  ogimage: '/screenshot-wide.webp',
  link: 'https://toolsntuts.com',
};

// Homepage configurable content
export const HomepageContent = {
  hero: {
    subtitle: 'AI Productivity Studio',
    title: 'Turn ideas into captivating 90-second videos',
    description: 'toolsntuts is your AI productivity command centre. From cinematic series to viral content — describe your idea, we break it into scenes, generate every shot with the world\'s best AI models, and deliver a finished, narrated video. No editing. No friction.',
    primaryCta: { text: 'Get Started Free', href: '/auth/login?redirectTo=/dashboard' },
    secondaryCta: { text: 'See how it works', href: '#features' },
    loggedInCta: { text: 'Open Dashboard', href: '/dashboard' },
    backgroundImage: '/hero-bg.webp',
  },
  stats: [
    { value: '90s', label: 'Finished video, any type', emoji: '🎬', gradient: 'from-pink-500 to-rose-500' },
    { value: '$1.25', label: 'Average cost per video', emoji: '💰', gradient: 'from-[#f71002] to-[#fd6c02]' },
    { value: 'Kling · Flux', label: 'Top AI models', emoji: '✨', gradient: 'from-cyan-500 to-blue-500' },
    { value: '<2 min', label: 'Idea → first cut', emoji: '⚡', gradient: 'from-emerald-500 to-teal-500' },
  ],
  features: {
    badge: 'What you can build',
    title: 'One platform. Every kind of video.',
    description: 'Lesson series, viral shorts, cinematic narratives, product ads — any 90-second video type generated end-to-end with AI.',
    items: [
      { icon: Film, title: 'Cinematic series', description: 'Multi-episode stories with consistent characters, locations and continuity across every shot.', gradient: 'from-[#f71002] to-pink-500' },
      { icon: Zap, title: 'Viral shorts', description: 'Hook-driven 90-second content optimised for social — suspense, twist, resolution in one cut.', gradient: 'from-cyan-500 to-blue-500' },
      { icon: Layers, title: 'Lesson videos', description: 'Educational content with narration, scene breakdowns and automatic voiceover generation.', gradient: 'from-[#fd6c02] to-yellow-500' },
      { icon: Music, title: 'Voice & narration', description: 'Professional TTS narration generated and timed to your clips — no recording booth needed.', gradient: 'from-emerald-500 to-teal-500' },
    ],
  },
  mission: {
    badge: 'How it works',
    title: 'Submit a prompt. Receive a video.',
    description: 'Write your idea — a verse, a viral hook, a product description. We generate a scene-by-scene breakdown, create every clip via WaveSpeed AI, stitch them with ffmpeg, and deliver the finished video. You only pay for what you generate.',
    values: [
      { icon: Wand2, title: 'Approve before you spend', description: 'Storyboard review is free. Video credits are charged only when you approve and generate.', gradient: 'from-[#f71002] to-pink-500' },
      { icon: Link2, title: 'Shot continuity', description: 'Each clip continues from the last frame of the previous one — characters stay consistent.', gradient: 'from-cyan-500 to-blue-500' },
      { icon: Lightbulb, title: 'Any content type', description: 'Lesson series, viral hooks, cinematic episodes, product ads — all from a single text prompt.', gradient: 'from-[#fd6c02] to-yellow-500' },
    ],
    coreValues: ['Speed', 'Quality', 'Consistency', 'Affordability', 'Control'],
  },
  cta: {
    badge: 'Start for free',
    title: 'Your first video is one prompt away',
    description: 'Describe your idea and watch it become a fully narrated, stitched video in under 2 minutes.',
    buttonText: 'Start Creating',
  },
};

// Utility function for background images
export const getStyle = (imageUrl: string) => `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;

export const documentationRoles = [Role.SUPERADMIN, Role.ADMIN, Role.EDITOR, Role.USER];
export const dashboardRoles = [Role.SUPERADMIN, Role.ADMIN, Role.EDITOR, Role.USER];
// Projects, Create, Credits — admin-only (creation gate)
export const projectRoles = [Role.SUPERADMIN, Role.ADMIN];
export const usersRoles = [Role.SUPERADMIN, Role.ADMIN];
export const profileRoles = [Role.SUPERADMIN, Role.ADMIN, Role.EDITOR, Role.USER];
export const homeRoles = [Role.SUPERADMIN, Role.ADMIN, Role.EDITOR, Role.USER];

export const getNavigation = (reference: string) => {
  const isActive = (url: string) => reference === url;

  const data = {
    teams: [
      {
        name: "Homepage",
        logo: Logo,
        plan: "toolsntuts",
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
        title: "Projects",
        url: "/projects",
        roles: projectRoles,
        icon: Film,
        isActive: reference.startsWith("/projects") && reference !== "/projects/new",
      },
      {
        title: "Create",
        url: "/projects/new",
        roles: projectRoles,
        icon: Sparkles,
        isActive: isActive("/projects/new"),
      },
      {
        title: "Credits",
        url: "/credits",
        roles: projectRoles,
        icon: Coins,
        isActive: isActive("/credits"),
      },
      {
        title: "Pricing",
        url: "/pricing",
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.EDITOR, Role.USER],
        icon: Coins,
        isActive: isActive("/pricing"),
      },
      {
        title: "Users",
        url: "/users",
        roles: usersRoles,
        icon: Users,
        isActive: isActive("/users"),
      },
      {
        title: "Profile",
        url: "/profile",
        roles: profileRoles,
        icon: User,
        isActive: isActive("/profile"),
      },
    ],
    publicNav: [
      { name: 'Home', href: '/', icon: Home, roles: homeRoles },
    ],
    privateNav: [
      { name: 'Home', href: '/', icon: Home, roles: homeRoles },
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: dashboardRoles },
    ],
  };

  return data;
};

export const adminRoles = [Role.SUPERADMIN, Role.ADMIN];

export const emptyMetalist: iFetchMeta = {
  total: 0,
  meta: { cursor: '', more: false, size: 0 },
  data: []
};
