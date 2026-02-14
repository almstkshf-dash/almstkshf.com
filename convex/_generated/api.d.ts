/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analyses from "../analyses.js";
import type * as contact from "../contact.js";
import type * as init from "../init.js";
import type * as media from "../media.js";
import type * as monitoring from "../monitoring.js";
import type * as monitoringAction from "../monitoringAction.js";
import type * as payments from "../payments.js";
import type * as queries from "../queries.js";
import type * as settings from "../settings.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analyses: typeof analyses;
  contact: typeof contact;
  init: typeof init;
  media: typeof media;
  monitoring: typeof monitoring;
  monitoringAction: typeof monitoringAction;
  payments: typeof payments;
  queries: typeof queries;
  settings: typeof settings;
  waitlist: typeof waitlist;
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
