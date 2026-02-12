import { 
  Building2, 
  Scale, 
  Wand2, 
  Microscope, 
  Settings, 
  BarChart3, 
  Mic2, 
  Newspaper, 
  FileText, 
  Activity, 
  ShieldAlert, 
  Home 
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
        label: "lexcura_lawyer",
        href: "/case-studies/lexcura-lawyer",
        icon: Scale,
        description: "AI-powered legal assistance platform"
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
        icon: Mic2,
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
        icon: Mic2,
        description: "Real-time broadcast tracking"
      },
      {
        label: "press_monitoring",
        href: "/media-monitoring/press",
        icon: Newspaper,
        description: "Print and digital publication tracking"
      },
      {
        label: "periodic_reports",
        href: "/media-monitoring/reports",
        icon: FileText,
        description: "Comprehensive analytical reports"
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
      }
    ]
  }
];
