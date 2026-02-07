import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { BrandStyle } from "@/types/brand";
import type { GenerationMetadata, GenerationStatus, AssetType } from "@/types/generation";

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------
export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  style: jsonb("style").$type<BrandStyle>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New Conversation"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Messages (within conversations)
// ---------------------------------------------------------------------------
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Generations
// ---------------------------------------------------------------------------
export const generations = pgTable("generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id")
    .references(() => brands.id, { onDelete: "cascade" })
    .notNull(),
  conversationId: uuid("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt"),
  status: text("status", {
    enum: ["pending", "processing", "completed", "failed"],
  })
    .$type<GenerationStatus>()
    .notNull()
    .default("pending"),
  metadata: jsonb("metadata").$type<GenerationMetadata>().default({}),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// Assets (generated images / uploaded references)
// ---------------------------------------------------------------------------
export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id")
    .references(() => brands.id, { onDelete: "cascade" })
    .notNull(),
  generationId: uuid("generation_id").references(() => generations.id, {
    onDelete: "set null",
  }),
  type: text("type", {
    enum: ["logo", "banner", "social", "illustration", "custom"],
  })
    .$type<AssetType>()
    .notNull()
    .default("custom"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  name: text("name").notNull(),
  width: integer("width"),
  height: integer("height"),
  canvasX: real("canvas_x"),
  canvasY: real("canvas_y"),
  canvasScale: real("canvas_scale").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const brandsRelations = relations(brands, ({ many }) => ({
  conversations: many(conversations),
  generations: many(generations),
  assets: many(assets),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  brand: one(brands, {
    fields: [conversations.brandId],
    references: [brands.id],
  }),
  messages: many(messages),
  generations: many(generations),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const generationsRelations = relations(generations, ({ one, many }) => ({
  brand: one(brands, {
    fields: [generations.brandId],
    references: [brands.id],
  }),
  conversation: one(conversations, {
    fields: [generations.conversationId],
    references: [conversations.id],
  }),
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  brand: one(brands, {
    fields: [assets.brandId],
    references: [brands.id],
  }),
  generation: one(generations, {
    fields: [assets.generationId],
    references: [generations.id],
  }),
}));
