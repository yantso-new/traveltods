import "server-only";

import { fetchQuery } from "convex/nextjs";
import { unstable_rethrow } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

export type PublishedDestination = Doc<"destinations">;

export interface PublishedDestinationInventoryItem {
  name: string;
  country: string;
  lastUpdated: number;
}

// Not wrapped in try/catch on purpose: a failed lookup must surface as an error
// instead of being read as "no such destination" and returning a 404.
export async function getDestinationRecord(name: string): Promise<Doc<"destinations"> | null> {
  return fetchQuery(api.destinations.getDestination, { name }) as Promise<Doc<"destinations"> | null>;
}

export function isPublishedDestination(
  destination: Doc<"destinations"> | null
) {
  return Boolean(
    destination?.dataQuality?.hasReliableOverallScore &&
      destination.description &&
      destination.description.trim().length >= 120 &&
      destination.shortDescription &&
      destination.shortDescription.trim().length >= 40
  );
}

export async function getPublishedDestinationInventory(): Promise<PublishedDestinationInventoryItem[]> {
  try {
    return await fetchQuery(api.destinations.getPublishedDestinationInventory, {}) as PublishedDestinationInventoryItem[];
  } catch (error) {
    // Next uses thrown errors for dynamic rendering and redirects; never swallow them.
    unstable_rethrow(error);
    console.error("Unable to load published destination inventory", error);
    return [];
  }
}
