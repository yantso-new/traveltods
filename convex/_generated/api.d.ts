/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as destinations from "../destinations.js";
import type * as lib_api_clients from "../lib/api_clients.js";
import type * as lib_scores from "../lib/scores.js";
import type * as lib_viator from "../lib/viator.js";
import type * as seed from "../seed.js";
import type * as update_all from "../update_all.js";
import type * as viator from "../viator.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  destinations: typeof destinations;
  "lib/api_clients": typeof lib_api_clients;
  "lib/scores": typeof lib_scores;
  "lib/viator": typeof lib_viator;
  seed: typeof seed;
  update_all: typeof update_all;
  viator: typeof viator;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
