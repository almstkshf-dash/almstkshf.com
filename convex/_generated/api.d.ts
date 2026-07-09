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
import type * as collections from "../collections.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as darkWeb from "../darkWeb.js";
import type * as darkWebDb from "../darkWebDb.js";
import type * as debug from "../debug.js";
import type * as deepSources from "../deepSources.js";
import type * as dumpSettings from "../dumpSettings.js";
import type * as emails from "../emails.js";
import type * as init from "../init.js";
import type * as integrations from "../integrations.js";
import type * as keywordCollections from "../keywordCollections.js";
import type * as media from "../media.js";
import type * as monitoring from "../monitoring.js";
import type * as monitoringAction from "../monitoringAction.js";
import type * as monitoring_analytics from "../monitoring/analytics.js";
import type * as monitoring_articles from "../monitoring/articles.js";
import type * as monitoring_cleanup from "../monitoring/cleanup.js";
import type * as monitoring_helpers from "../monitoring/helpers.js";
import type * as monitoring_locks from "../monitoring/locks.js";
import type * as monitoring_notifications from "../monitoring/notifications.js";
import type * as monitoring_queue from "../monitoring/queue.js";
import type * as monitoring_reports from "../monitoring/reports.js";
import type * as monitoring_rss from "../monitoring/rss.js";
import type * as monitoring_similarweb from "../monitoring/similarweb.js";
import type * as monitoring_types from "../monitoring/types.js";
import type * as monitoring_validators from "../monitoring/validators.js";
import type * as osint from "../osint.js";
import type * as osintDb from "../osintDb.js";
import type * as payments from "../payments.js";
import type * as pressReleaseJobs from "../pressReleaseJobs.js";
import type * as prompts_analysis from "../prompts/analysis.js";
import type * as prompts_common from "../prompts/common.js";
import type * as prompts_mediaAnalysis from "../prompts/mediaAnalysis.js";
import type * as prompts_relevancy from "../prompts/relevancy.js";
import type * as queries from "../queries.js";
import type * as reportJobs from "../reportJobs.js";
import type * as searchOptimizer from "../searchOptimizer.js";
import type * as settings from "../settings.js";
import type * as sources from "../sources.js";
import type * as terroristList from "../terroristList.js";
import type * as testAction from "../testAction.js";
import type * as userActions from "../userActions.js";
import type * as userSettings from "../userSettings.js";
import type * as utils_aiRetry from "../utils/aiRetry.js";
import type * as utils_auth from "../utils/auth.js";
import type * as utils_booleanFilter from "../utils/booleanFilter.js";
import type * as utils_checkAdmin from "../utils/checkAdmin.js";
import type * as utils_collectionItemResolver from "../utils/collectionItemResolver.js";
import type * as utils_constants from "../utils/constants.js";
import type * as utils_date from "../utils/date.js";
import type * as utils_dedup from "../utils/dedup.js";
import type * as utils_email from "../utils/email.js";
import type * as utils_encoding from "../utils/encoding.js";
import type * as utils_gemini from "../utils/gemini.js";
import type * as utils_heuristics from "../utils/heuristics.js";
import type * as utils_keys from "../utils/keys.js";
import type * as utils_logger from "../utils/logger.js";
import type * as utils_qstash from "../utils/qstash.js";
import type * as utils_scraper from "../utils/scraper.js";
import type * as utils_ssrf from "../utils/ssrf.js";
import type * as utils_urlResolver from "../utils/urlResolver.js";
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
  collections: typeof collections;
  contact: typeof contact;
  crons: typeof crons;
  darkWeb: typeof darkWeb;
  darkWebDb: typeof darkWebDb;
  debug: typeof debug;
  deepSources: typeof deepSources;
  dumpSettings: typeof dumpSettings;
  emails: typeof emails;
  init: typeof init;
  integrations: typeof integrations;
  keywordCollections: typeof keywordCollections;
  media: typeof media;
  monitoring: typeof monitoring;
  monitoringAction: typeof monitoringAction;
  "monitoring/analytics": typeof monitoring_analytics;
  "monitoring/articles": typeof monitoring_articles;
  "monitoring/cleanup": typeof monitoring_cleanup;
  "monitoring/helpers": typeof monitoring_helpers;
  "monitoring/locks": typeof monitoring_locks;
  "monitoring/notifications": typeof monitoring_notifications;
  "monitoring/queue": typeof monitoring_queue;
  "monitoring/reports": typeof monitoring_reports;
  "monitoring/rss": typeof monitoring_rss;
  "monitoring/similarweb": typeof monitoring_similarweb;
  "monitoring/types": typeof monitoring_types;
  "monitoring/validators": typeof monitoring_validators;
  osint: typeof osint;
  osintDb: typeof osintDb;
  payments: typeof payments;
  pressReleaseJobs: typeof pressReleaseJobs;
  "prompts/analysis": typeof prompts_analysis;
  "prompts/common": typeof prompts_common;
  "prompts/mediaAnalysis": typeof prompts_mediaAnalysis;
  "prompts/relevancy": typeof prompts_relevancy;
  queries: typeof queries;
  reportJobs: typeof reportJobs;
  searchOptimizer: typeof searchOptimizer;
  settings: typeof settings;
  sources: typeof sources;
  terroristList: typeof terroristList;
  testAction: typeof testAction;
  userActions: typeof userActions;
  userSettings: typeof userSettings;
  "utils/aiRetry": typeof utils_aiRetry;
  "utils/auth": typeof utils_auth;
  "utils/booleanFilter": typeof utils_booleanFilter;
  "utils/checkAdmin": typeof utils_checkAdmin;
  "utils/collectionItemResolver": typeof utils_collectionItemResolver;
  "utils/constants": typeof utils_constants;
  "utils/date": typeof utils_date;
  "utils/dedup": typeof utils_dedup;
  "utils/email": typeof utils_email;
  "utils/encoding": typeof utils_encoding;
  "utils/gemini": typeof utils_gemini;
  "utils/heuristics": typeof utils_heuristics;
  "utils/keys": typeof utils_keys;
  "utils/logger": typeof utils_logger;
  "utils/qstash": typeof utils_qstash;
  "utils/scraper": typeof utils_scraper;
  "utils/ssrf": typeof utils_ssrf;
  "utils/urlResolver": typeof utils_urlResolver;
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
