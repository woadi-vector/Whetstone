import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const mirrors = pgTable("mirrors", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  moodRaw: text("mood_raw").notNull(),
  transcript: jsonb("transcript").notNull(),
  letter: text("letter").notNull(),
  cards: jsonb("cards").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
