import { pgTable, text, timestamp, boolean, integer, pgEnum, primaryKey } from "drizzle-orm/pg-core";

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

// ---------------------------------------------------------------------------
// Tools n Tuts Kids — one illustrated comic story per day.
//
// Directly adapts resources/daily-blog-generator.ts's proven shape (research
// -> write -> illustrate -> store), not a from-scratch design: one story per
// day, grounded in real, Tavily-researched occurrences, cast freshly per
// story (no fixed recurring characters — consistency is enforced WITHIN a
// story via the codex mechanism, the same way daily-blog-generator.ts holds
// one character's appearance steady across that story's own beats), told as
// a present-day narrative that draws its theme from Scripture rather than
// depicting a Bible-era scene. No age-tier fan-out: one edition, read by
// everyone, comic-style throughout.
// ---------------------------------------------------------------------------

export const episodeStatusEnum = pgEnum("episode_status", ["draft", "generating", "published", "failed"]);

/**
 * One day's comic. `category` is the rotating content pillar (a biblical
 * value/theme, e.g. "Honesty Even When It Costs You") — mirrors
 * daily-blog-generator.ts's `blog.category`, used the same way: to pick the
 * least-recently-used pillar so the rotation survives restarts with no extra
 * state. `scriptureRef` is whichever verse(s) the story actually anchors on;
 * nullable because that's decided by the writer, not prescribed in advance.
 */
export const episode = pgTable("episode", {
  id: text("id").primaryKey(),
  dayNumber: integer("day_number").notNull().unique(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  scriptureRef: text("scripture_ref"),
  moral: text("moral"),
  coverImageUrl: text("cover_image_url"),
  status: episodeStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const codexKindEnum = pgEnum("codex_kind", ["character", "place", "thing"]);

/**
 * The consistency mechanism, scoped to ONE episode (not a global cast — each
 * day's story has its own fresh people and setting, same as
 * daily-blog-generator.ts's `story.characters`). One row per recurring
 * character, place or thing in that story, with a locked `appearance` string
 * replayed verbatim into every image prompt it appears in within this story.
 */
export const codexEntry = pgTable("codex_entry", {
  id: text("id").primaryKey(),
  episodeId: text("episode_id").notNull().references(() => episode.id, { onDelete: "cascade" }),
  kind: codexKindEnum("kind").notNull(),
  name: text("name").notNull(),
  role: text("role"),
  appearance: text("appearance").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * One beat of the story, in reading order — a real paragraph of prose to
 * read (`prose`), sandwiched with its own image, exactly like
 * daily-blog-generator.ts's `story.beats`. `caption` is a short
 * newspaper-style line under the image, separate from the prose itself.
 */
export const panel = pgTable("panel", {
  id: text("id").primaryKey(),
  episodeId: text("episode_id").notNull().references(() => episode.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  heading: text("heading"),
  prose: text("prose").notNull(),
  caption: text("caption"),
  sceneDescription: text("scene_description").notNull(),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Which codex entries (cast/place/thing) are present in a panel, so its image prompt can replay their locked appearance strings. */
export const panelCodexEntry = pgTable(
  "panel_codex_entry",
  {
    panelId: text("panel_id").notNull().references(() => panel.id, { onDelete: "cascade" }),
    codexEntryId: text("codex_entry_id").notNull().references(() => codexEntry.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.panelId, table.codexEntryId] })]
);

export const schema = {
  user,
  session,
  account,
  verification,
  episode,
  codexEntry,
  panel,
  panelCodexEntry,
};
