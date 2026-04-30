/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import {
  Building2,
  Scale,
  Wand2,
  Microscope,
  Settings,
  BarChart3,
  Newspaper,
  FileText,
  Activity,
  ShieldAlert,
  Home,
  CreditCard,
  Tv,
  Database,
  Search,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href?: string;
  icon?: any;
  children?: NavigationItem[];
  description?: string;
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "landing_page",
    href: "/",
    icon: Home,
  },
  {
    label: "case_studies",
    icon: Building2,
    children: [
      {
        label: "lexcora",
        href: "/case-studies/lexcora",
        icon: Scale,
        description: "Premier ERP suite for high-net-worth law firms"
      },
      {
        label: "styling_assistant",
        href: "/case-studies/styling-assistant",
        icon: Wand2,
        description: "Smart fashion and styling recommendations"
      }
    ]
  },
  {
    label: "technical_solutions",
    icon: Microscope,
    children: [
      {
        label: "smart_media_assistant",
        href: "/technical-solutions/smart-media-assistant",
        icon: Search,
        description: "Advanced media analysis tools"
      },
      {
        label: "kyc_compliance",
        href: "/technical-solutions/kyc",
        icon: FileText,
        description: "Automated identity verification"
      },
      {
        label: "integration_hub",
        href: "/technical-solutions/integration",
        icon: Settings,
        description: "Seamless API integrations"
      }
    ]
  },
  {
    label: "media_monitoring",
    icon: Activity,
    children: [
      {
        label: "tv_radio_monitoring",
        href: "/media-monitoring/tv-radio",
        icon: Tv,
        description: "Real-time broadcast tracking"
      },
      {
        label: "press_monitoring",
        href: "/media-monitoring/press",
        icon: Newspaper,
        description: "Print and digital publication tracking"
      },
      {
        label: "central_media_repository",
        href: "/media-monitoring/central-media-repository",
        icon: Database,
        description: "Centralized digital asset management"
      },
      {
        label: "media_pulse",
        href: "/media-monitoring/media-pulse",
        icon: BarChart3,
        description: "Live media sentiment analysis"
      },
      {
        label: "crisis_management",
        href: "/media-monitoring/crisis-management",
        icon: ShieldAlert,
        description: "Strategic crisis response planning"
      },
    ]
  },
  {
    label: "pricing",
    href: "/pricing",
    icon: CreditCard,
  },
  {
    label: "faq",
    href: "/case-studies/lexcora#faq",
    icon: FileText,
  }
];
