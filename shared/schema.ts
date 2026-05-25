import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sessions: a single reflection moment
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at").notNull(), // unix ms
  feeling: text("feeling").notNull().default(""),
  body: text("body").notNull().default(""),
  hardest: text("hardest").notNull().default(""),
  integration: text("integration").notNull().default(""),
  // optional account metadata
  ownerId: text("owner_id"),
  ownerName: text("owner_name"),
  ownerEmail: text("owner_email"),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// A more lenient client-facing schema where all prompt responses are optional strings
export const clientSessionInput = z.object({
  feeling: z.string().default(""),
  body: z.string().default(""),
  hardest: z.string().default(""),
  integration: z.string().default(""),
  ownerId: z.string().nullable().optional(),
  ownerName: z.string().nullable().optional(),
  ownerEmail: z.string().nullable().optional(),
});

export type ClientSessionInput = z.infer<typeof clientSessionInput>;
