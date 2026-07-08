/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

// Domain re-exports to completely preserve the external Convex API contracts (api.monitoring.* / internal.monitoring.*)

export {
    getArticles,
    checkDuplicate,
    saveArticle,
    updateArticleAfterAnalysis,
    getArticle,
    deleteArticle,
    updateArticle,
    deleteAllArticles,
    deleteArticles,
    updateSentiment,
    updateKeyword,
    getArticlesSince
} from "./monitoring/articles";

export {
    getRssArticles,
    saveRssArticle,
    scheduleRssSync
} from "./monitoring/rss";

export {
    getAnalyticsOverview,
    getEmotionAggregates,
    getGeographyAggregates
} from "./monitoring/analytics";

export {
    createNotification,
    getUnreadNotifications,
    markNotificationAsRead
} from "./monitoring/notifications";

export {
    getPressReleaseOnlineNewsReports,
    getPressReleaseSocialMediaReports
} from "./monitoring/reports";

export {
    getPendingQueueBatch,
    updateQueueItemStatus
} from "./monitoring/queue";

export {
    acquireQueueLock,
    releaseQueueLock
} from "./monitoring/locks";

export {
    purgeOldData
} from "./monitoring/cleanup";

export {
    getCachedDomainTraffic,
    saveCachedDomainTraffic
} from "./monitoring/similarweb";
