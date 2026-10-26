import { v } from "convex/values";
import { mutation } from "./_generated/server";

const MAX_EMAIL_LENGTH = 254;
const MAX_SOURCE_LENGTH = 64;

// Abuse guards: re-submissions of the same email are a no-op inside this window,
// and the whole table accepts at most MAX_NEW_SIGNUPS_PER_MINUTE new addresses.
const RESUBMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_NEW_SIGNUPS_PER_MINUTE = 60;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isValidEmail = (email: string) =>
    email.length <= MAX_EMAIL_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const join = mutation({
    args: {
        email: v.string(),
        source: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const email = normalizeEmail(args.email);

        if (!isValidEmail(email)) {
            throw new Error("Please enter a valid email address.");
        }

        const source = args.source?.trim().slice(0, MAX_SOURCE_LENGTH) || undefined;

        const existing = await ctx.db
            .query("waitlistEmails")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        const now = Date.now();

        if (existing) {
            // Same email again: keep the upsert, but don't write more than once per
            // window so a script hammering one address can't generate write load.
            if (now - existing.updatedAt >= RESUBMIT_WINDOW_MS) {
                await ctx.db.patch(existing._id, {
                    updatedAt: now,
                    source: source ?? existing.source,
                });
            }
            return existing._id;
        }

        const recentSignups = await ctx.db
            .query("waitlistEmails")
            .withIndex("by_created_at", (q) => q.gte("createdAt", now - 60_000))
            .take(MAX_NEW_SIGNUPS_PER_MINUTE);
        if (recentSignups.length >= MAX_NEW_SIGNUPS_PER_MINUTE) {
            throw new Error("Too many sign-ups right now. Please try again in a minute.");
        }

        return await ctx.db.insert("waitlistEmails", {
            email,
            createdAt: now,
            updatedAt: now,
            source,
        });
    },
});
