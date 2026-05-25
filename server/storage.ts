import { sessions } from "@shared/schema";
import type { Session, InsertSession } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { desc, eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Ensure table exists (safety net so the app works even before drizzle-kit push runs)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at INTEGER NOT NULL,
    feeling TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    hardest TEXT NOT NULL DEFAULT '',
    integration TEXT NOT NULL DEFAULT '',
    owner_id TEXT,
    owner_name TEXT,
    owner_email TEXT
  );
`);

const sessionColumns = sqlite.prepare("PRAGMA table_info(sessions)").all() as Array<{ name: string }>;
if (!sessionColumns.some((col) => col.name === "owner_id")) {
  sqlite.exec("ALTER TABLE sessions ADD COLUMN owner_id TEXT;");
}

export const db = drizzle(sqlite);

export interface IStorage {
  listSessions(filters?: {
    ownerId?: string;
    ownerEmail?: string;
    guestOnly?: boolean;
  }): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(data: InsertSession): Promise<Session>;
  updateSession(id: number, patch: Partial<InsertSession>): Promise<Session | undefined>;
  claimSessionsByEmail(ownerEmail: string, ownerId: string): Promise<Session[]>;
  deleteSession(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async listSessions(filters: {
    ownerId?: string;
    ownerEmail?: string;
    guestOnly?: boolean;
  } = {}): Promise<Session[]> {
    if (filters.ownerId) {
      return db
        .select()
        .from(sessions)
        .where(eq(sessions.ownerId, filters.ownerId))
        .orderBy(desc(sessions.createdAt))
        .all();
    }

    if (filters.ownerEmail) {
      return db
        .select()
        .from(sessions)
        .where(eq(sessions.ownerEmail, filters.ownerEmail))
        .orderBy(desc(sessions.createdAt))
        .all();
    }

    if (filters.guestOnly) {
      return sqlite
        .prepare("SELECT * FROM sessions WHERE owner_id IS NULL ORDER BY created_at DESC")
        .all()
        .map((row: any) => ({
          id: row.id,
          createdAt: row.created_at,
          feeling: row.feeling,
          body: row.body,
          hardest: row.hardest,
          integration: row.integration,
          ownerId: row.owner_id,
          ownerName: row.owner_name,
          ownerEmail: row.owner_email,
        })) as Session[];
    }

    return db.select().from(sessions).orderBy(desc(sessions.createdAt)).all();
  }

  async getSession(id: number): Promise<Session | undefined> {
    return db.select().from(sessions).where(eq(sessions.id, id)).get();
  }

  async createSession(data: InsertSession): Promise<Session> {
    return db.insert(sessions).values(data).returning().get();
  }

  async updateSession(id: number, patch: Partial<InsertSession>): Promise<Session | undefined> {
    const updated = db
      .update(sessions)
      .set(patch)
      .where(eq(sessions.id, id))
      .returning()
      .get();
    return updated;
  }

  async claimSessionsByEmail(ownerEmail: string, ownerId: string): Promise<Session[]> {
    db
      .update(sessions)
      .set({ ownerId })
      .where(eq(sessions.ownerEmail, ownerEmail))
      .run();

    return this.listSessions({ ownerId });
  }

  async deleteSession(id: number): Promise<boolean> {
    const res = db.delete(sessions).where(eq(sessions.id, id)).run();
    return res.changes > 0;
  }
}

export const storage = new DatabaseStorage();
