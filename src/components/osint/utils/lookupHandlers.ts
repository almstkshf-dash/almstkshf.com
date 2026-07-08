/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/**
 * Recursively removes sensitive properties from an object (e.g. API keys, secrets, tokens).
 */
export function sanitizeResult(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResult(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    const sensitiveKeys = [
      'apikey',
      'token',
      'secret',
      'password',
      'key',
      'auth',
      'api_key',
      'access_token',
      'accesstoken',
      'bearer',
      'client_secret',
      'clientsecret',
      'privatekey',
      'private_key',
    ];

    for (const key of Object.keys(data)) {
      const value = data[key];
      const lowerKey = key.toLowerCase();

      const isSensitive = sensitiveKeys.some((sk) => lowerKey.includes(sk));

      if (isSensitive) {
        continue;
      }

      sanitized[key] = sanitizeResult(value);
    }
    return sanitized;
  }

  return data;
}
