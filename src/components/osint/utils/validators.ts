/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { LookupType } from '../types';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateIp(ip: string): boolean {
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Regex);
  if (match) {
    return match.slice(1).every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255 && String(num) === octet;
    });
  }

  // IPv6 validation
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const ipv6HexCompressed = /^(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?::(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?$/;
  return ipv6Regex.test(ip) || ipv6HexCompressed.test(ip);
}

export function validateDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  const phoneRegex = /^\d{5,20}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validates search query input based on the active lookup type.
 * Returns null if valid, or a validation translation key/message if invalid.
 */
export function validateInput(type: LookupType, query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return 'empty';
  }

  switch (type) {
    case 'email':
      return validateEmail(trimmed) ? null : 'invalid_email';
    case 'ip':
      return validateIp(trimmed) ? null : 'invalid_ip';
    case 'domain':
      return validateDomain(trimmed) ? null : 'invalid_domain';
    case 'phone':
      return validatePhone(trimmed) ? null : 'invalid_phone';
    default:
      return trimmed.length >= 2 ? null : 'too_short';
  }
}
