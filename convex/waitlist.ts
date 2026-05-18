import { v } from "convex/values";
import { mutation } from "./_generated/server";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isValidEmail = (email: string) =>
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

        const existing = await ctx.db
            .query("waitlistEmails")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                updatedAt: now,
                source: args.source ?? existing.source,
            });
            return existing._id;
        }

        return await ctx.db.insert("waitlistEmails", {
            email,
            createdAt: now,
            updatedAt: now,
            source: args.source,
        });
    },
});
