import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const memos = pgTable("memos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  imageUrls: text("image_urls").array().default([]).notNull(), // 複数画像
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Memo = typeof memos.$inferSelect
export type NewMemo = typeof memos.$inferInsert
