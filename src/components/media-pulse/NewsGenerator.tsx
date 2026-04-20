/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';
import clsx from 'clsx';
import * as React from 'react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAction, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search, AlertTriangle, CheckCircle2, Languages, Filter, ChevronDown, X, Globe, Sparkles, Wand2 } from "lucide-react";
import Button from "../ui/Button";
import { useLocale, useTranslations } from 'next-intl';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// FULL WORLD COUNTRIES LIST
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const ALL_COUNTRIES = [
    { code: 'AE', flag: 'ðŸ‡¦ðŸ‡ª', en: 'United Arab Emirates', ar: 'Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ù…ØªØ­Ø¯Ø©' },
    { code: 'SA', flag: 'ðŸ‡¸ðŸ‡¦', en: 'Saudi Arabia', ar: 'Ø§Ù„Ù…Ù…Ù„ÙƒØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©' },
    { code: 'EG', flag: 'ðŸ‡ªðŸ‡¬', en: 'Egypt', ar: 'Ù…ØµØ±' },
    { code: 'KW', flag: 'ðŸ‡°ðŸ‡¼', en: 'Kuwait', ar: 'Ø§Ù„ÙƒÙˆÙŠØª' },
    { code: 'QA', flag: 'ðŸ‡¶ðŸ‡¦', en: 'Qatar', ar: 'Ù‚Ø·Ø±' },
    { code: 'BH', flag: 'ðŸ‡§ðŸ‡­', en: 'Bahrain', ar: 'Ø§Ù„Ø¨Ø­Ø±ÙŠÙ†' },
    { code: 'OM', flag: 'ðŸ‡´ðŸ‡²', en: 'Oman', ar: 'Ø¹ÙÙ…Ø§Ù†' },
    { code: 'JO', flag: 'ðŸ‡¯ðŸ‡´', en: 'Jordan', ar: 'Ø§Ù„Ø£Ø±Ø¯Ù†' },
    { code: 'LB', flag: 'ðŸ‡±ðŸ‡§', en: 'Lebanon', ar: 'Ù„Ø¨Ù†Ø§Ù†' },
    { code: 'IQ', flag: 'ðŸ‡®ðŸ‡¶', en: 'Iraq', ar: 'Ø§Ù„Ø¹Ø±Ø§Ù‚' },
    { code: 'SY', flag: 'ðŸ‡¸ðŸ‡¾', en: 'Syria', ar: 'Ø³ÙˆØ±ÙŠØ§' },
    { code: 'PS', flag: 'ðŸ‡µðŸ‡¸', en: 'Palestine', ar: 'ÙÙ„Ø³Ø·ÙŠÙ†' },
    { code: 'YE', flag: 'ðŸ‡¾ðŸ‡ª', en: 'Yemen', ar: 'Ø§Ù„ÙŠÙ…Ù†' },
    { code: 'LY', flag: 'ðŸ‡±ðŸ‡¾', en: 'Libya', ar: 'Ù„ÙŠØ¨ÙŠØ§' },
    { code: 'TN', flag: 'ðŸ‡¹ðŸ‡³', en: 'Tunisia', ar: 'ØªÙˆÙ†Ø³' },
    { code: 'DZ', flag: 'ðŸ‡©ðŸ‡¿', en: 'Algeria', ar: 'Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±' },
    { code: 'MA', flag: 'ðŸ‡²ðŸ‡¦', en: 'Morocco', ar: 'Ø§Ù„Ù…ØºØ±Ø¨' },
    { code: 'SD', flag: 'ðŸ‡¸ðŸ‡©', en: 'Sudan', ar: 'Ø§Ù„Ø³ÙˆØ¯Ø§Ù†' },
    { code: 'SO', flag: 'ðŸ‡¸ðŸ‡´', en: 'Somalia', ar: 'Ø§Ù„ØµÙˆÙ…Ø§Ù„' },
    { code: 'DJ', flag: 'ðŸ‡©ðŸ‡¯', en: 'Djibouti', ar: 'Ø¬ÙŠØ¨ÙˆØªÙŠ' },
    { code: 'MR', flag: 'ðŸ‡²ðŸ‡·', en: 'Mauritania', ar: 'Ù…ÙˆØ±ÙŠØªØ§Ù†ÙŠØ§' },
    { code: 'KM', flag: 'ðŸ‡°ðŸ‡²', en: 'Comoros', ar: 'Ø¬Ø²Ø± Ø§Ù„Ù‚Ù…Ø±' },
    { code: 'US', flag: 'ðŸ‡ºðŸ‡¸', en: 'United States', ar: 'Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª Ø§Ù„Ù…ØªØ­Ø¯Ø©' },
    { code: 'GB', flag: 'ðŸ‡¬ðŸ‡§', en: 'United Kingdom', ar: 'Ø§Ù„Ù…Ù…Ù„ÙƒØ© Ø§Ù„Ù…ØªØ­Ø¯Ø©' },
    { code: 'CA', flag: 'ðŸ‡¨ðŸ‡¦', en: 'Canada', ar: 'ÙƒÙ†Ø¯Ø§' },
    { code: 'AU', flag: 'ðŸ‡¦ðŸ‡º', en: 'Australia', ar: 'Ø£Ø³ØªØ±Ø§Ù„ÙŠØ§' },
    { code: 'FR', flag: 'ðŸ‡«ðŸ‡·', en: 'France', ar: 'ÙØ±Ù†Ø³Ø§' },
    { code: 'DE', flag: 'ðŸ‡©ðŸ‡ª', en: 'Germany', ar: 'Ø£Ù„Ù…Ø§Ù†ÙŠØ§' },
    { code: 'IT', flag: 'ðŸ‡®ðŸ‡¹', en: 'Italy', ar: 'Ø¥ÙŠØ·Ø§Ù„ÙŠØ§' },
    { code: 'ES', flag: 'ðŸ‡ªðŸ‡¸', en: 'Spain', ar: 'Ø¥Ø³Ø¨Ø§Ù†ÙŠØ§' },
    { code: 'NL', flag: 'ðŸ‡³ðŸ‡±', en: 'Netherlands', ar: 'Ù‡ÙˆÙ„Ù†Ø¯Ø§' },
    { code: 'BE', flag: 'ðŸ‡§ðŸ‡ª', en: 'Belgium', ar: 'Ø¨Ù„Ø¬ÙŠÙƒØ§' },
    { code: 'CH', flag: 'ðŸ‡¨ðŸ‡­', en: 'Switzerland', ar: 'Ø³ÙˆÙŠØ³Ø±Ø§' },
    { code: 'AT', flag: 'ðŸ‡¦ðŸ‡¹', en: 'Austria', ar: 'Ø§Ù„Ù†Ù…Ø³Ø§' },
    { code: 'SE', flag: 'ðŸ‡¸ðŸ‡ª', en: 'Sweden', ar: 'Ø§Ù„Ø³ÙˆÙŠØ¯' },
    { code: 'NO', flag: 'ðŸ‡³ðŸ‡´', en: 'Norway', ar: 'Ø§Ù„Ù†Ø±ÙˆÙŠØ¬' },
    { code: 'DK', flag: 'ðŸ‡©ðŸ‡°', en: 'Denmark', ar: 'Ø§Ù„Ø¯Ù†Ù…Ø§Ø±Ùƒ' },
    { code: 'FI', flag: 'ðŸ‡«ðŸ‡®', en: 'Finland', ar: 'ÙÙ†Ù„Ù†Ø¯Ø§' },
    { code: 'PL', flag: 'ðŸ‡µðŸ‡±', en: 'Poland', ar: 'Ø¨ÙˆÙ„Ù†Ø¯Ø§' },
    { code: 'PT', flag: 'ðŸ‡µðŸ‡¹', en: 'Portugal', ar: 'Ø§Ù„Ø¨Ø±ØªØºØ§Ù„' },
    { code: 'GR', flag: 'ðŸ‡¬ðŸ‡·', en: 'Greece', ar: 'Ø§Ù„ÙŠÙˆÙ†Ø§Ù†' },
    { code: 'IE', flag: 'ðŸ‡®ðŸ‡ª', en: 'Ireland', ar: 'Ø£ÙŠØ±Ù„Ù†Ø¯Ø§' },
    { code: 'CZ', flag: 'ðŸ‡¨ðŸ‡¿', en: 'Czech Republic', ar: 'Ø§Ù„ØªØ´ÙŠÙƒ' },
    { code: 'RO', flag: 'ðŸ‡·ðŸ‡´', en: 'Romania', ar: 'Ø±ÙˆÙ…Ø§Ù†ÙŠØ§' },
    { code: 'HU', flag: 'ðŸ‡­ðŸ‡º', en: 'Hungary', ar: 'Ø§Ù„Ù…Ø¬Ø±' },
    { code: 'RU', flag: 'ðŸ‡·ðŸ‡º', en: 'Russia', ar: 'Ø±ÙˆØ³ÙŠØ§' },
    { code: 'TR', flag: 'ðŸ‡¹ðŸ‡·', en: 'Turkey', ar: 'ØªØ±ÙƒÙŠØ§' },
    { code: 'CN', flag: 'ðŸ‡¨ðŸ‡³', en: 'China', ar: 'Ø§Ù„ØµÙŠÙ†' },
    { code: 'JP', flag: 'ðŸ‡¯ðŸ‡µ', en: 'Japan', ar: 'Ø§Ù„ÙŠØ§Ø¨Ø§Ù†' },
    { code: 'KR', flag: 'ðŸ‡°ðŸ‡·', en: 'South Korea', ar: 'ÙƒÙˆØ±ÙŠØ§ Ø§Ù„Ø¬Ù†ÙˆØ¨ÙŠØ©' },
    { code: 'IN', flag: 'ðŸ‡®ðŸ‡³', en: 'India', ar: 'Ø§Ù„Ù‡Ù†Ø¯' },
    { code: 'PK', flag: 'ðŸ‡µðŸ‡°', en: 'Pakistan', ar: 'Ø¨Ø§ÙƒØ³ØªØ§Ù†' },
    { code: 'BD', flag: 'ðŸ‡§ðŸ‡©', en: 'Bangladesh', ar: 'Ø¨Ù†ØºÙ„Ø§Ø¯ÙŠØ´' },
    { code: 'ID', flag: 'ðŸ‡®ðŸ‡©', en: 'Indonesia', ar: 'Ø¥Ù†Ø¯ÙˆÙ†ÙŠØ³ÙŠØ§' },
    { code: 'MY', flag: 'ðŸ‡²ðŸ‡¾', en: 'Malaysia', ar: 'Ù…Ø§Ù„ÙŠØ²ÙŠØ§' },
    { code: 'SG', flag: 'ðŸ‡¸ðŸ‡¬', en: 'Singapore', ar: 'Ø³Ù†ØºØ§ÙÙˆØ±Ø©' },
    { code: 'TH', flag: 'ðŸ‡¹ðŸ‡­', en: 'Thailand', ar: 'ØªØ§ÙŠÙ„Ø§Ù†Ø¯' },
    { code: 'PH', flag: 'ðŸ‡µðŸ‡­', en: 'Philippines', ar: 'Ø§Ù„ÙÙ„Ø¨ÙŠÙ†' },
    { code: 'VN', flag: 'ðŸ‡»ðŸ‡³', en: 'Vietnam', ar: 'ÙÙŠØªÙ†Ø§Ù…' },
    { code: 'BR', flag: 'ðŸ‡§ðŸ‡·', en: 'Brazil', ar: 'Ø§Ù„Ø¨Ø±Ø§Ø²ÙŠÙ„' },
    { code: 'MX', flag: 'ðŸ‡²ðŸ‡½', en: 'Mexico', ar: 'Ø§Ù„Ù…ÙƒØ³ÙŠÙƒ' },
    { code: 'AR', flag: 'ðŸ‡¦ðŸ‡·', en: 'Argentina', ar: 'Ø§Ù„Ø£Ø±Ø¬Ù†ØªÙŠÙ†' },
    { code: 'CO', flag: 'ðŸ‡¨ðŸ‡´', en: 'Colombia', ar: 'ÙƒÙˆÙ„ÙˆÙ…Ø¨ÙŠØ§' },
    { code: 'CL', flag: 'ðŸ‡¨ðŸ‡±', en: 'Chile', ar: 'ØªØ´ÙŠÙ„ÙŠ' },
    { code: 'ZA', flag: 'ðŸ‡¿ðŸ‡¦', en: 'South Africa', ar: 'Ø¬Ù†ÙˆØ¨ Ø£ÙØ±ÙŠÙ‚ÙŠØ§' },
    { code: 'NG', flag: 'ðŸ‡³ðŸ‡¬', en: 'Nigeria', ar: 'Ù†ÙŠØ¬ÙŠØ±ÙŠØ§' },
    { code: 'KE', flag: 'ðŸ‡°ðŸ‡ª', en: 'Kenya', ar: 'ÙƒÙŠÙ†ÙŠØ§' },
    { code: 'GH', flag: 'ðŸ‡¬ðŸ‡­', en: 'Ghana', ar: 'ØºØ§Ù†Ø§' },
    { code: 'ET', flag: 'ðŸ‡ªðŸ‡¹', en: 'Ethiopia', ar: 'Ø¥Ø«ÙŠÙˆØ¨ÙŠØ§' },
    { code: 'TZ', flag: 'ðŸ‡¹ðŸ‡¿', en: 'Tanzania', ar: 'ØªÙ†Ø²Ø§Ù†ÙŠØ§' },
    { code: 'IL', flag: 'ðŸ‡®ðŸ‡±', en: 'Israel', ar: 'Ø¥Ø³Ø±Ø§Ø¦ÙŠÙ„' },
    { code: 'IR', flag: 'ðŸ‡®ðŸ‡·', en: 'Iran', ar: 'Ø¥ÙŠØ±Ø§Ù†' },
    { code: 'AF', flag: 'ðŸ‡¦ðŸ‡«', en: 'Afghanistan', ar: 'Ø£ÙØºØ§Ù†Ø³ØªØ§Ù†' },
    { code: 'NZ', flag: 'ðŸ‡³ðŸ‡¿', en: 'New Zealand', ar: 'Ù†ÙŠÙˆØ²ÙŠÙ„Ù†Ø¯Ø§' },
    { code: 'UA', flag: 'ðŸ‡ºðŸ‡¦', en: 'Ukraine', ar: 'Ø£ÙˆÙƒØ±Ø§Ù†ÙŠØ§' },
    { code: 'HR', flag: 'ðŸ‡­ðŸ‡·', en: 'Croatia', ar: 'ÙƒØ±ÙˆØ§ØªÙŠØ§' },
    { code: 'RS', flag: 'ðŸ‡·ðŸ‡¸', en: 'Serbia', ar: 'ØµØ±Ø¨ÙŠØ§' },
    { code: 'BG', flag: 'ðŸ‡§ðŸ‡¬', en: 'Bulgaria', ar: 'Ø¨Ù„ØºØ§Ø±ÙŠØ§' },
    { code: 'SK', flag: 'ðŸ‡¸ðŸ‡°', en: 'Slovakia', ar: 'Ø³Ù„ÙˆÙØ§ÙƒÙŠØ§' },
    { code: 'LT', flag: 'ðŸ‡±ðŸ‡¹', en: 'Lithuania', ar: 'Ù„ÙŠØªÙˆØ§Ù†ÙŠØ§' },
    { code: 'LV', flag: 'ðŸ‡±ðŸ‡»', en: 'Latvia', ar: 'Ù„Ø§ØªÙÙŠØ§' },
    { code: 'EE', flag: 'ðŸ‡ªðŸ‡ª', en: 'Estonia', ar: 'Ø¥Ø³ØªÙˆÙ†ÙŠØ§' },
    { code: 'CY', flag: 'ðŸ‡¨ðŸ‡¾', en: 'Cyprus', ar: 'Ù‚Ø¨Ø±Øµ' },
    { code: 'MT', flag: 'ðŸ‡²ðŸ‡¹', en: 'Malta', ar: 'Ù…Ø§Ù„Ø·Ø§' },
    { code: 'LU', flag: 'ðŸ‡±ðŸ‡º', en: 'Luxembourg', ar: 'Ù„ÙˆÙƒØ³Ù…Ø¨ÙˆØ±Øº' },
    { code: 'IS', flag: 'ðŸ‡®ðŸ‡¸', en: 'Iceland', ar: 'Ø¢ÙŠØ³Ù„Ù†Ø¯Ø§' },
    { code: 'PE', flag: 'ðŸ‡µðŸ‡ª', en: 'Peru', ar: 'Ø¨ÙŠØ±Ùˆ' },
    { code: 'VE', flag: 'ðŸ‡»ðŸ‡ª', en: 'Venezuela', ar: 'ÙÙ†Ø²ÙˆÙŠÙ„Ø§' },
    { code: 'EC', flag: 'ðŸ‡ªðŸ‡¨', en: 'Ecuador', ar: 'Ø§Ù„Ø¥ÙƒÙˆØ§Ø¯ÙˆØ±' },
    { code: 'UY', flag: 'ðŸ‡ºðŸ‡¾', en: 'Uruguay', ar: 'Ø£ÙˆØ±ÙˆØºÙˆØ§ÙŠ' },
    { code: 'PY', flag: 'ðŸ‡µðŸ‡¾', en: 'Paraguay', ar: 'Ø¨Ø§Ø±Ø§ØºÙˆØ§ÙŠ' },
    { code: 'BO', flag: 'ðŸ‡§ðŸ‡´', en: 'Bolivia', ar: 'Ø¨ÙˆÙ„ÙŠÙÙŠØ§' },
    { code: 'CR', flag: 'ðŸ‡¨ðŸ‡·', en: 'Costa Rica', ar: 'ÙƒÙˆØ³ØªØ§Ø±ÙŠÙƒØ§' },
    { code: 'PA', flag: 'ðŸ‡µðŸ‡¦', en: 'Panama', ar: 'Ø¨Ù†Ù…Ø§' },
    { code: 'CU', flag: 'ðŸ‡¨ðŸ‡º', en: 'Cuba', ar: 'ÙƒÙˆØ¨Ø§' },
    { code: 'DO', flag: 'ðŸ‡©ðŸ‡´', en: 'Dominican Republic', ar: 'Ø¬Ù…Ù‡ÙˆØ±ÙŠØ© Ø§Ù„Ø¯ÙˆÙ…ÙŠÙ†ÙŠÙƒØ§Ù†' },
    { code: 'GT', flag: 'ðŸ‡¬ðŸ‡¹', en: 'Guatemala', ar: 'ØºÙˆØ§ØªÙŠÙ…Ø§Ù„Ø§' },
    { code: 'HN', flag: 'ðŸ‡­ðŸ‡³', en: 'Honduras', ar: 'Ù‡Ù†Ø¯ÙˆØ±Ø§Ø³' },
    { code: 'JM', flag: 'ðŸ‡¯ðŸ‡²', en: 'Jamaica', ar: 'Ø¬Ø§Ù…Ø§ÙŠÙƒØ§' },
    { code: 'TT', flag: 'ðŸ‡¹ðŸ‡¹', en: 'Trinidad and Tobago', ar: 'ØªØ±ÙŠÙ†ÙŠØ¯Ø§Ø¯ ÙˆØªÙˆØ¨Ø§ØºÙˆ' },
    { code: 'HT', flag: 'ðŸ‡­ðŸ‡¹', en: 'Haiti', ar: 'Ù‡Ø§ÙŠØªÙŠ' },
    { code: 'SV', flag: 'ðŸ‡¸ðŸ‡»', en: 'El Salvador', ar: 'Ø§Ù„Ø³Ù„ÙØ§Ø¯ÙˆØ±' },
    { code: 'NI', flag: 'ðŸ‡³ðŸ‡®', en: 'Nicaragua', ar: 'Ù†ÙŠÙƒØ§Ø±Ø§ØºÙˆØ§' },
    { code: 'LK', flag: 'ðŸ‡±ðŸ‡°', en: 'Sri Lanka', ar: 'Ø³Ø±ÙŠÙ„Ø§Ù†ÙƒØ§' },
    { code: 'MM', flag: 'ðŸ‡²ðŸ‡²', en: 'Myanmar', ar: 'Ù…ÙŠØ§Ù†Ù…Ø§Ø±' },
    { code: 'KH', flag: 'ðŸ‡°ðŸ‡­', en: 'Cambodia', ar: 'ÙƒÙ…Ø¨ÙˆØ¯ÙŠØ§' },
    { code: 'NP', flag: 'ðŸ‡³ðŸ‡µ', en: 'Nepal', ar: 'Ù†ÙŠØ¨Ø§Ù„' },
    { code: 'UZ', flag: 'ðŸ‡ºðŸ‡¿', en: 'Uzbekistan', ar: 'Ø£ÙˆØ²Ø¨ÙƒØ³ØªØ§Ù†' },
    { code: 'KZ', flag: 'ðŸ‡°ðŸ‡¿', en: 'Kazakhstan', ar: 'ÙƒØ§Ø²Ø§Ø®Ø³ØªØ§Ù†' },
    { code: 'GE', flag: 'ðŸ‡¬ðŸ‡ª', en: 'Georgia', ar: 'Ø¬ÙˆØ±Ø¬ÙŠØ§' },
    { code: 'AZ', flag: 'ðŸ‡¦ðŸ‡¿', en: 'Azerbaijan', ar: 'Ø£Ø°Ø±Ø¨ÙŠØ¬Ø§Ù†' },
    { code: 'AM', flag: 'ðŸ‡¦ðŸ‡²', en: 'Armenia', ar: 'Ø£Ø±Ù…ÙŠÙ†ÙŠØ§' },
    { code: 'UG', flag: 'ðŸ‡ºðŸ‡¬', en: 'Uganda', ar: 'Ø£ÙˆØºÙ†Ø¯Ø§' },
    { code: 'CM', flag: 'ðŸ‡¨ðŸ‡²', en: 'Cameroon', ar: 'Ø§Ù„ÙƒØ§Ù…ÙŠØ±ÙˆÙ†' },
    { code: 'SN', flag: 'ðŸ‡¸ðŸ‡³', en: 'Senegal', ar: 'Ø§Ù„Ø³Ù†ØºØ§Ù„' },
    { code: 'CI', flag: 'ðŸ‡¨ðŸ‡®', en: 'Ivory Coast', ar: 'Ø³Ø§Ø­Ù„ Ø§Ù„Ø¹Ø§Ø¬' },
    { code: 'MG', flag: 'ðŸ‡²ðŸ‡¬', en: 'Madagascar', ar: 'Ù…Ø¯ØºØ´Ù‚Ø±' },
    { code: 'MZ', flag: 'ðŸ‡²ðŸ‡¿', en: 'Mozambique', ar: 'Ù…ÙˆØ²Ù…Ø¨ÙŠÙ‚' },
    { code: 'AO', flag: 'ðŸ‡¦ðŸ‡´', en: 'Angola', ar: 'Ø£Ù†ØºÙˆÙ„Ø§' },
    { code: 'TW', flag: 'ðŸ‡¹ðŸ‡¼', en: 'Taiwan', ar: 'ØªØ§ÙŠÙˆØ§Ù†' },
    { code: 'HK', flag: 'ðŸ‡­ðŸ‡°', en: 'Hong Kong', ar: 'Ù‡ÙˆÙ†Øº ÙƒÙˆÙ†Øº' },
    { code: 'MO', flag: 'ðŸ‡²ðŸ‡´', en: 'Macau', ar: 'Ù…Ø§ÙƒØ§Ùˆ' },
    { code: 'BN', flag: 'ðŸ‡§ðŸ‡³', en: 'Brunei', ar: 'Ø¨Ø±ÙˆÙ†Ø§ÙŠ' },
];

const LANGUAGES = [
    { code: 'en', en: 'English', ar: 'Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©' },
    { code: 'ar', en: 'Arabic', ar: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©' },
    { code: 'fr', en: 'French', ar: 'Ø§Ù„ÙØ±Ù†Ø³ÙŠØ©' },
    { code: 'de', en: 'German', ar: 'Ø§Ù„Ø£Ù„Ù…Ø§Ù†ÙŠØ©' },
    { code: 'es', en: 'Spanish', ar: 'Ø§Ù„Ø¥Ø³Ø¨Ø§Ù†ÙŠØ©' },
    { code: 'pt', en: 'Portuguese', ar: 'Ø§Ù„Ø¨Ø±ØªØºØ§Ù„ÙŠØ©' },
    { code: 'ru', en: 'Russian', ar: 'Ø§Ù„Ø±ÙˆØ³ÙŠØ©' },
    { code: 'zh', en: 'Chinese', ar: 'Ø§Ù„ØµÙŠÙ†ÙŠØ©' },
    { code: 'ja', en: 'Japanese', ar: 'Ø§Ù„ÙŠØ§Ø¨Ø§Ù†ÙŠØ©' },
    { code: 'ko', en: 'Korean', ar: 'Ø§Ù„ÙƒÙˆØ±ÙŠØ©' },
    { code: 'hi', en: 'Hindi', ar: 'Ø§Ù„Ù‡Ù†Ø¯ÙŠØ©' },
    { code: 'tr', en: 'Turkish', ar: 'Ø§Ù„ØªØ±ÙƒÙŠØ©' },
    { code: 'id', en: 'Indonesian', ar: 'Ø§Ù„Ø¥Ù†Ø¯ÙˆÙ†ÙŠØ³ÙŠØ©' },
    { code: 'ur', en: 'Urdu', ar: 'Ø§Ù„Ø£Ø±Ø¯ÙŠØ©' },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SEARCHABLE MULTI-SELECT DROPDOWN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MEMOIZED MULTI-SELECT DROPDOWN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const MultiSelectDropdown = React.memo(function MultiSelectDropdown({
    items,
    selected,
    onChange,
    placeholder,
    searchPlaceholder,
    renderItem,
    renderTag,
    icon,
    error,
    noResultsText,
    selectedText,
    clearAllText,
    "aria-labelledby": ariaLabelledBy,
    id,
}: {
    items: { id: string; label: string; searchStr: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
    searchPlaceholder: string;
    renderItem?: (item: { id: string; label: string }) => React.ReactNode;
    renderTag?: (id: string) => React.ReactNode;
    icon?: React.ReactNode;
    error?: string;
    noResultsText?: string;
    selectedText?: string;
    clearAllText?: string;
    "aria-labelledby"?: string;
    id?: string;
}) {
    const defaultRenderItem = useCallback((item: { id: string; label: string }) => <span>{item.label}</span>, []);
    const defaultRenderTag = useCallback((id: string) => {
        const item = items.find(i => i.id === id);
        return <span>{item?.label || id}</span>;
    }, [items]);

    const t = useTranslations('NewsGenerator');
    const finalRenderItem = renderItem || defaultRenderItem;
    const finalRenderTag = renderTag || defaultRenderTag;
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = React.useMemo(() => {
        return items.filter(
            (item) => search.length === 0 || item.searchStr.toLowerCase().includes(search.toLowerCase())
        );
    }, [items, search]);

    const toggle = useCallback((id_to_toggle: string) => {
        onChange(selected.includes(id_to_toggle) ? selected.filter((s) => s !== id_to_toggle) : [...selected, id_to_toggle]);
    }, [selected, onChange]);

    return (
        <div ref={ref} className="relative">
            {/* Trigger Button */}
            <div
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`${id || 'dropdown'}-listbox`}
                aria-labelledby={ariaLabelledBy}
                tabIndex={0}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                    if (e.key === 'Escape' && isOpen) {
                        setIsOpen(false);
                    }
                }}
                className={`w-full flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 text-left transition-all border cursor-pointer ${error
                    ? 'border-destructive/60 ring-2 ring-destructive/20'
                    : isOpen
                        ? 'border-primary/50 ring-2 ring-primary/20 bg-card'
                        : 'border-border hover:border-primary/40'
                    }`}
            >
                {icon && <span className="text-muted-foreground transition-colors flex-shrink-0">{icon}</span>}
                <div className="flex-1 flex flex-wrap gap-1.5 min-h-[24px]">
                    {selected.length === 0 ? (
                        <span className="text-foreground/60 text-sm transition-colors">{placeholder}</span>
                    ) : (
                        selected.map((selected_id) => (
                            <span
                                key={selected_id}
                                className="inline-flex items-center gap-1 bg-primary/10 text-blue-800 dark:text-blue-300 border border-primary/20 rounded-lg px-2 py-0.5 text-xs font-bold transition-colors"
                            >
                                {finalRenderTag(selected_id)}
                                <button
                                    type="button"
                                    aria-label={`${t('remove')} ${items.find(i => i.id === selected_id)?.label || selected_id}`}
                                    onClick={(e) => { e.stopPropagation(); toggle(selected_id); }}
                                    className="hover:text-primary/70 ml-0.5 cursor-pointer transition-colors"
                                >
                                    <X className="w-3 h-3" aria-hidden="true" />
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-foreground/70 transition-all flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1 animate-in fade-in duration-300">
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" /> {error}
                </p>
            )}

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-[90] mt-2 w-full bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/5">
                    {/* Search */}
                    <div className="p-3 border-b border-border/50 bg-muted/20">
                        <div className="relative">
                            <label htmlFor={`${id || 'dropdown'}-search`} className="sr-only">{searchPlaceholder}</label>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" aria-hidden="true" />
                            <input
                                id={`${id || 'dropdown'}-search`}
                                name={`${id || 'dropdown'}-search`}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoComplete="off"
                                className="w-full bg-background/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-2 focus:ring-primary/20 border border-border transition-all shadow-sm"
                                /* eslint-disable-next-line jsx-a11y/no-autofocus */
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Items List */}
                    <div
                        id={`${id || 'dropdown'}-listbox`}
                        role="listbox"
                        aria-multiselectable="true"
                        className="max-h-64 overflow-y-auto scrollbar-thin transition-colors"
                    >
                        {filtered.length === 0 ? (
                            <div className="py-10 text-center" role="option" aria-disabled="true">
                                <Search className="w-8 h-8 text-foreground/20 mx-auto mb-2" aria-hidden="true" />
                                <p className="text-foreground/60 text-xs font-medium">{noResultsText}</p>
                            </div>
                        ) : (
                            <div className="p-1.5 grid grid-cols-1 gap-0.5">
                                {filtered.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="option"
                                        aria-selected={selected.includes(item.id)}
                                        onClick={() => toggle(item.id)}
                                        className={clsx(
                                            "w-full flex justify-start items-center gap-3 px-3 py-2.5 text-sm rounded-lg shadow-none h-auto transition-colors focus:bg-muted focus:outline-none",
                                            selected.includes(item.id)
                                                ? 'bg-primary/10 text-blue-800 dark:text-blue-300 font-semibold'
                                                : 'text-foreground hover:bg-muted font-medium'
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all",
                                            selected.includes(item.id)
                                                ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                                                : 'border-border bg-background'
                                        )}>
                                            {selected.includes(item.id) && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground stroke-[3]" aria-hidden="true" />
                                            )}
                                        </div>
                                        <div className="flex-1 truncate text-left">{finalRenderItem(item)}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-border/50 bg-muted/10 flex items-center justify-between transition-colors">
                        <span className="text-[10px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-2">
                            {selected.length} {selectedText}
                        </span>
                        {selected.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onChange([])}
                                className="text-[10px] text-primary hover:text-primary/70 uppercase tracking-widest font-black px-2 py-1 rounded-lg hover:bg-primary/5 h-auto shadow-none"
                            >
                                {clearAllText}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN NEWS GENERATOR
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function NewsGenerator({ defaultSourceType }: { defaultSourceType?: string }) {
    const locale = useLocale();
    const t = useTranslations('NewsGenerator');
    const isAr = locale === 'ar';

    // Guard: ensure Clerk token is propagated to Convex before firing the action
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const fetchNews = useAction(api.monitoringAction.fetchNews);
    const optimizeSearch = useAction(api.searchOptimizer.optimizeQuery);

    const tOpt = useTranslations('SearchOptimizer');

    const [keyword, setKeyword] = useState('');
    const [optimizationInfo, setOptimizationInfo] = useState<{ original: string; explanation: string } | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>(['AE']);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(isAr ? ['ar', 'en'] : ['en', 'ar']);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>(
        defaultSourceType ? [defaultSourceType] : ['Online News', 'Press Release']
    );

    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const sourceTypes = useMemo(() => [
        { id: 'Online News', label: t('source_types_list.online_news'), searchStr: 'Online News Ø£Ø®Ø¨Ø§Ø± Ø¹Ø¨Ø± Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª' },
        { id: 'Press Release', label: t('source_types_list.press_release'), searchStr: 'Press Release Ø¨ÙŠØ§Ù† ØµØ­ÙÙŠ' },
        { id: 'Blog', label: t('source_types_list.blog'), searchStr: 'Blog Ù…Ø¯ÙˆÙ†Ø©' },
        { id: 'Social Media', label: t('source_types_list.social_media'), searchStr: 'Social Media ÙˆØ³Ø§Ø¦Ù„ Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠ' },
        { id: 'Print', label: t('source_types_list.print'), searchStr: 'Print ØµØ­Ø§ÙØ© Ù…Ø·Ø¨ÙˆØ¹Ø©' },
    ], [t]);
    const [result, setResult] = useState<{ count: number; skipped: number; feeds: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Validation errors
    const [errors, setErrors] = useState<{ keyword?: string; countries?: string; languages?: string }>({});

    const dateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Convert HTML date (YYYY-MM-DD) â†’ DD/MM/YYYY for backend
    const formatDateForBackend = useCallback((htmlDate: string): string => {
        if (!htmlDate) return '';
        const [y, m, d] = htmlDate.split('-');
        return `${d}/${m}/${y}`;
    }, []);

    const formatDateDisplay = useCallback((htmlDate: string): string => {
        if (!htmlDate) return '';
        const d = new Date(htmlDate);
        return d.toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }, [locale]);

    // Country helpers
    const countryItems = React.useMemo(() => ALL_COUNTRIES.map((c) => ({
        id: c.code,
        label: isAr ? c.ar : c.en,
        searchStr: `${c.en} ${c.ar} ${c.code}`,
    })), [isAr]);

    const getCountryByCode = useCallback((code: string) => ALL_COUNTRIES.find((c) => c.code === code), []);

    // Language helpers
    const languageItems = React.useMemo(() => LANGUAGES.map((l) => ({
        id: l.code,
        label: isAr ? l.ar : l.en,
        searchStr: `${l.en} ${l.ar} ${l.code}`,
    })), [isAr]);

    const getLangByCode = useCallback((code: string) => LANGUAGES.find((l) => l.code === code), []);

    const validate = useCallback((): boolean => {
        const newErrors: typeof errors = {};
        if (!keyword.trim()) newErrors.keyword = t('error_keyword_required');
        if (selectedCountries.length === 0) newErrors.countries = t('error_country_required');
        if (selectedLanguages.length === 0) newErrors.languages = t('error_language_required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [keyword, selectedCountries, selectedLanguages, t]);

    const handleGenerate = useCallback(async () => {
        if (!validate()) return;
        // Safety: never invoke an authenticated action when Convex hasn't received the token yet
        if (!isAuthenticated) {
            setErrorMsg(t('not_authenticated'));
            return;
        }
        setLoading(true);
        setResult(null);
        setErrorMsg('');
        try {
            const res = await fetchNews({
                keyword: keyword.trim(),
                countries: selectedCountries.join(','),
                languages: selectedLanguages.join(','),
                sourceTypes: selectedSourceTypes.join(','),
                dateFrom: dateFrom ? formatDateForBackend(dateFrom) : undefined,
                dateTo: dateTo ? formatDateForBackend(dateTo) : undefined,
            }) as any;

            if (res.success) {
                setResult(res);
            } else {
                setErrorMsg(res.error || t('fetch_failed'));
            }
        } catch (error: any) {
            console.error("News fetch internal error:", error);
            setErrorMsg(t('fetch_failed'));
        } finally {
            setLoading(false);
        }
    }, [validate, isAuthenticated, keyword, selectedCountries, selectedLanguages, selectedSourceTypes, dateFrom, dateTo, fetchNews, t, isAr, formatDateForBackend]);

    const clearForm = useCallback(() => {
        setKeyword('');
        setOptimizationInfo(null);
        setSelectedCountries(['AE']);
        setSelectedLanguages(isAr ? ['ar', 'en'] : ['en', 'ar']);
        setDateFrom('');
        setDateTo('');
        setResult(null);
        setErrorMsg('');
        setErrors({});
    }, [isAr]);

    const handleOptimize = async () => {
        if (!keyword.trim()) return;
        setIsOptimizing(true);
        try {
            const res = await optimizeSearch({
                keyword: keyword.trim(),
                context: 'news',
                targetLanguages: selectedLanguages
            });
            if (res && res.optimized) {
                setOptimizationInfo({
                    original: keyword,
                    explanation: res.explanation
                });
                setKeyword(res.optimized);
            }
        } catch (e) {
            console.error("Optimization failed:", e);
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <section className="relative z-20 bg-card border border-border rounded-2xl overflow-visible backdrop-blur-sm shadow-sm transition-all">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-colors">
                        <Search className="w-4.5 h-4.5 text-blue-800 dark:text-blue-300" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-foreground font-bold text-sm transition-colors">{t('monitor_keyword')}</h2>
                        <p className="text-foreground/70 text-[11px] transition-colors">{t('subtitle')}</p>
                    </div>
                </div>
                {(keyword || result || errorMsg) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearForm}
                        className="text-xs text-foreground/80 hover:text-foreground gap-1 border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50 h-auto shadow-none"
                    >
                        <X className="w-3 h-3" />
                        {t('clear')}
                    </Button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Keyword Input */}
                <div>
                    <label htmlFor="monitor_keyword" className="sr-only">{t('monitor_keyword')}</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" aria-hidden="true" />
                        <input
                            id="monitor_keyword"
                            name="monitor_keyword"
                            type="text"
                            placeholder={t('placeholder')}
                            value={keyword}
                            onChange={(e) => {
                                const val = e.target.value;
                                setKeyword(val);
                                if (errors.keyword) {
                                    setErrors(prev => ({ ...prev, keyword: undefined }));
                                }
                                if (optimizationInfo) setOptimizationInfo(null);
                            }}
                            autoComplete="on"
                            className={`w-full bg-muted/50 rounded-xl pl-11 pr-12 py-3.5 text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none placeholder:text-foreground/40 border transition-colors ${errors.keyword ? 'border-destructive/60 ring-2 ring-destructive/20' : 'border-border'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={handleOptimize}
                            disabled={isOptimizing || !keyword.trim()}
                            title={tOpt('button_tooltip')}
                            aria-label={tOpt('button_tooltip')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10 text-blue-800 dark:text-blue-300 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                        >
                            <Wand2 className={clsx("w-4 h-4", isOptimizing && "animate-pulse")} aria-hidden="true" />
                            <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-primary animate-bounce opacity-0 group-hover:opacity-100" aria-hidden="true" />
                        </button>
                    </div>

                    {optimizationInfo && (
                        <div className="mt-2 flex items-start gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <Sparkles className="w-4 h-4 text-primary mt-0.5" aria-hidden="true" />
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-primary uppercase tracking-tight">
                                    {tOpt('explanation_title')}
                                </p>
                                <p className="text-xs text-foreground/80 leading-relaxed italic">
                                    {optimizationInfo.explanation}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setKeyword(optimizationInfo.original);
                                    setOptimizationInfo(null);
                                }}
                                className="text-[10px] font-bold text-primary hover:underline"
                            >
                                {tOpt('original')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Countries */}
                    <div className="space-y-2">
                        <label id="region-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">{t('region')}</label>
                        <MultiSelectDropdown
                            id="region-select"
                            aria-labelledby="region-label"
                            items={countryItems}
                            selected={selectedCountries}
                            onChange={(v) => setSelectedCountries(v)}
                            placeholder={t('select_countries')}
                            searchPlaceholder={t('search_countries')}
                            selectedText={t('selected')}
                            icon={<Globe className="w-4 h-4" />}
                            renderItem={(item) => (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{getCountryByCode(item.id)?.flag}</span>
                                    <span>{item.label}</span>
                                </div>
                            )}
                            renderTag={(id) => (
                                <div className="flex items-center gap-1.5">
                                    <span>{getCountryByCode(id)?.flag}</span>
                                    <span>{id}</span>
                                </div>
                            )}
                        />
                    </div>

                    {/* Languages */}
                    <div className="space-y-2">
                        <label id="language-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">{t('language')}</label>
                        <MultiSelectDropdown
                            id="language-select"
                            aria-labelledby="language-label"
                            items={languageItems}
                            selected={selectedLanguages}
                            onChange={(v) => setSelectedLanguages(v)}
                            placeholder={t('select_languages')}
                            searchPlaceholder={t('search_languages')}
                            selectedText={t('selected')}
                            icon={<Languages className="w-4 h-4" />}
                            renderItem={(item) => (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold opacity-60 uppercase">{item.id}</span>
                                    <span>{item.label}</span>
                                </div>
                            )}
                            renderTag={(id) => (
                                <span className="uppercase text-[10px] font-black">{id}</span>
                            )}
                        />
                    </div>

                    {/* Source Types */}
                    <div className="space-y-2">
                        <label id="sources-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">{t('source_types')}</label>
                        <MultiSelectDropdown
                            id="sources-select"
                            aria-labelledby="sources-label"
                            items={sourceTypes}
                            selected={selectedSourceTypes}
                            onChange={(v) => setSelectedSourceTypes(v)}
                            placeholder={t('select_sources')}
                            searchPlaceholder={t('search_sources')}
                            selectedText={t('sources_selected')}
                            icon={<Filter className="w-4 h-4" />}
                        />
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <label id="date-range-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">{t('date_range')}</label>
                        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="date-range-label">
                            <div className="space-y-1">
                                <label htmlFor="date-from" className="sr-only">Date From</label>
                                <input
                                    id="date-from"
                                    name="date-from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    autoComplete="off"
                                    className="w-full bg-muted/50 border border-border rounded-xl px-2 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="date-to" className="sr-only">Date To</label>
                                <input
                                    id="date-to"
                                    name="date-to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    autoComplete="off"
                                    className="w-full bg-muted/50 border border-border rounded-xl px-2 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        {errorMsg && (
                            <div className="text-destructive text-xs flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                {errorMsg}
                            </div>
                        )}
                        {result && (
                            <div className="text-emerald-500 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                {t('result_success', { count: result.count, skipped: result.skipped, feeds: result.feeds })}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleGenerate}
                        isLoading={loading || authLoading}
                        disabled={!isAuthenticated || authLoading}
                        className="w-full md:w-auto font-bold px-10 py-3.5 shadow-xl shadow-primary/20 text-sm whitespace-nowrap"
                    >
                        {loading ? (
                            t('analyzing')
                        ) : (
                            <>{t('generate_report')}</>
                        )}
                    </Button>
                </div>
            </div>
        </section>
    );
}
