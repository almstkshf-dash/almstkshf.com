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
import type * as case_studies from "../case_studies.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as deepSources from "../deepSources.js";
import type * as init from "../init.js";
import type * as media from "../media.js";
import type * as monitoring from "../monitoring.js";
import type * as monitoringAction from "../monitoringAction.js";
import type * as osint from "../osint.js";
import type * as osintDb from "../osintDb.js";
import type * as payments from "../payments.js";
import type * as phyllo from "../phyllo.js";
import type * as queries from "../queries.js";
import type * as settings from "../settings.js";
import type * as userSettings from "../userSettings.js";
import type * as utils_auth from "../utils/auth.js";
import type * as utils_checkAdmin from "../utils/checkAdmin.js";
import type * as utils_keys from "../utils/keys.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analyses: typeof analyses;
  case_studies: typeof case_studies;
  contact: typeof contact;
  crons: typeof crons;
  deepSources: typeof deepSources;
  init: typeof init;
  media: typeof media;
  monitoring: typeof monitoring;
  monitoringAction: typeof monitoringAction;
  osint: typeof osint;
  osintDb: typeof osintDb;
  payments: typeof payments;
  phyllo: typeof phyllo;
  queries: typeof queries;
  settings: typeof settings;
  userSettings: typeof userSettings;
  "utils/auth": typeof utils_auth;
  "utils/checkAdmin": typeof utils_checkAdmin;
  "utils/keys": typeof utils_keys;
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
