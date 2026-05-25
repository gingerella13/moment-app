import type { Express } from "express";
import type { Server } from "node:http";
import { storage } from "./storage";
import { clientSessionInput } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // List all sessions, newest first
  app.get("/api/sessions", async (req, res) => {
    const ownerId = typeof req.query.ownerId === "string" ? req.query.ownerId : undefined;
    const ownerEmail = typeof req.query.ownerEmail === "string" ? req.query.ownerEmail : undefined;
    const guestOnly = req.query.guest === "true";
    const rows = await storage.listSessions({ ownerId, ownerEmail, guestOnly });
    res.json(rows);
  });

  // Get one session by id
  app.get("/api/sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const row = await storage.getSession(id);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  // Create a new session
  app.post("/api/sessions", async (req, res) => {
    const parsed = clientSessionInput.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }
    const data = parsed.data;
    const row = await storage.createSession({
      createdAt: Date.now(),
      feeling: data.feeling ?? "",
      body: data.body ?? "",
      hardest: data.hardest ?? "",
      integration: data.integration ?? "",
      ownerId: data.ownerId ?? null,
      ownerName: data.ownerName ?? null,
      ownerEmail: data.ownerEmail ?? null,
    });
    res.status(201).json(row);
  });

  // Update a session (e.g. add integration response after completion, attach signup)
  const patchSchema = clientSessionInput.partial();
  app.patch("/api/sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const parsed = patchSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }
    const row = await storage.updateSession(id, parsed.data);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  const claimSchema = z.object({
    ownerEmail: z.string().email(),
    ownerId: z.string().min(1),
  });

  // Attach previously saved email-tagged guest sessions to a verified auth user.
  // Production note: once Supabase keys are configured, this should verify the
  // Supabase JWT server-side before trusting ownerId/ownerEmail.
  app.post("/api/sessions/claim", async (req, res) => {
    const parsed = claimSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }
    const rows = await storage.claimSessionsByEmail(
      parsed.data.ownerEmail,
      parsed.data.ownerId
    );
    res.json(rows);
  });

  // Delete a session
  app.delete("/api/sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const ok = await storage.deleteSession(id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.status(204).end();
  });

  return httpServer;
}
