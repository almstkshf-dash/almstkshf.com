/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export interface LogContext {
    requestId?: string;
    keyword?: string;
    articleId?: string;
}

export class Logger {
    private context: LogContext = {};

    constructor(context?: LogContext) {
        if (context) {
            this.context = context;
        }
    }

    /**
     * Create a child logger with additional context.
     */
    child(additionalContext: LogContext): Logger {
        return new Logger({
            ...this.context,
            ...additionalContext,
        });
    }

    private log(level: "DEBUG" | "INFO" | "WARN" | "ERROR", message: string, meta?: any) {
        const payload = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...this.context,
            ...(meta ? { meta } : {}),
        };

        if (process.env.JSON_LOGS === "true") {
            console.log(JSON.stringify(payload));
        } else {
            const ctxParts: string[] = [];
            if (this.context.requestId) ctxParts.push(`req:${this.context.requestId}`);
            if (this.context.keyword) ctxParts.push(`key:${this.context.keyword}`);
            if (this.context.articleId) ctxParts.push(`art:${this.context.articleId}`);
            
            const ctxStr = ctxParts.length > 0 ? ` [${ctxParts.join("|")}]` : "";
            const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : "";
            
            const formattedMessage = `[${payload.timestamp}] [${level}]${ctxStr} ${message}${metaStr}`;
            
            if (level === "ERROR") {
                console.error(formattedMessage);
            } else if (level === "WARN") {
                console.warn(formattedMessage);
            } else {
                console.log(formattedMessage);
            }
        }
    }

    debug(message: string, meta?: any) {
        this.log("DEBUG", message, meta);
    }

    info(message: string, meta?: any) {
        this.log("INFO", message, meta);
    }

    warn(message: string, meta?: any) {
        this.log("WARN", message, meta);
    }

    error(message: string, meta?: any) {
        this.log("ERROR", message, meta);
    }
}

export const logger = new Logger();
export default logger;
