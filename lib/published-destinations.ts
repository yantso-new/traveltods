import "server-only";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

export type PublishedDestination = Doc<"destinations">;

export interface PublishedDestinationInventoryItem {
  name: string;
  country: string;
  lastUpdated: number;
}

async function getDestinationRecord(name: string): Promise<Doc<"destinations"> | null> {
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

export async function getPublishedDestination(name: string) {
  try {
    const destination = await getDestinationRecord(name);
    return isPublishedDestination(destination) ? destination : null;
  } catch (error) {
    console.error("Unable to load published destination for server rendering", error);
    return null;
  }
}

export async function getPublishedDestinationInventory(): Promise<PublishedDestinationInventoryItem[]> {
  try {
    return await fetchQuery(api.destinations.getPublishedDestinationInventory, {}) as PublishedDestinationInventoryItem[];
  } catch (error) {
    console.error("Unable to load published destination inventory", error);
    return [];
  }
}
