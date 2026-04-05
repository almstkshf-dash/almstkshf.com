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
import type * as authQueries from "../authQueries.js";
import type * as case_studies from "../case_studies.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as debug from "../debug.js";
import type * as deepSources from "../deepSources.js";
import type * as init from "../init.js";
import type * as media from "../media.js";
import type * as monitoring from "../monitoring.js";
import type * as monitoringAction from "../monitoringAction.js";
import type * as osint from "../osint.js";
import type * as osintDb from "../osintDb.js";
import type * as payments from "../payments.js";
import type * as queries from "../queries.js";
import type * as settings from "../settings.js";
import type * as userSettings from "../userSettings.js";
import type * as utils_auth from "../utils/auth.js";
import type * as utils_booleanFilter from "../utils/booleanFilter.js";
import type * as utils_checkAdmin from "../utils/checkAdmin.js";
import type * as utils_dedup from "../utils/dedup.js";
import type * as utils_email from "../utils/email.js";
import type * as utils_keys from "../utils/keys.js";
import type * as utils_qstash from "../utils/qstash.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analyses: typeof analyses;
  authQueries: typeof authQueries;
  case_studies: typeof case_studies;
  contact: typeof contact;
  crons: typeof crons;
  debug: typeof debug;
  deepSources: typeof deepSources;
  init: typeof init;
  media: typeof media;
  monitoring: typeof monitoring;
  monitoringAction: typeof monitoringAction;
  osint: typeof osint;
  osintDb: typeof osintDb;
  payments: typeof payments;
  queries: typeof queries;
  settings: typeof settings;
  userSettings: typeof userSettings;
  "utils/auth": typeof utils_auth;
  "utils/booleanFilter": typeof utils_booleanFilter;
  "utils/checkAdmin": typeof utils_checkAdmin;
  "utils/dedup": typeof utils_dedup;
  "utils/email": typeof utils_email;
  "utils/keys": typeof utils_keys;
  "utils/qstash": typeof utils_qstash;
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
