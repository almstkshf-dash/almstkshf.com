/**
 * Official RSS Sources for the Intelligence Stream.
 * Primarily focusing on Asharq Al-Awsat (aawsat.com) categories for the Arabic-speaking demographic.
 */

export interface RSSCategory {
  id: string;
  name: string;
  url: string;
}

export const AAWSAT_SOURCES: RSSCategory[] = [
  { id: 'main', name: 'الرئيسية', url: 'https://aawsat.com/feed' },
  { id: 'news', name: 'كل الاخبار', url: 'https://aawsat.com/feed/news' },
  { id: 'world', name: 'العالم العربي', url: 'https://aawsat.com/feed/arab-world' },
  { id: 'gulf', name: 'الخليج', url: 'https://aawsat.com/feed/gulf' },
  { id: 'europe', name: 'أوروبا', url: 'https://aawsat.com/feed/europe' },
  { id: 'america', name: 'الأميركيتين', url: 'https://aawsat.com/feed/america' },
  { id: 'asia', name: 'آسيا', url: 'https://aawsat.com/feed/asia' },
  { id: 'africa', name: 'أفريقيا', url: 'https://aawsat.com/feed/africa' },
  { id: 'economy', name: 'الاقتصاد', url: 'https://aawsat.com/feed/economy' },
  { id: 'political', name: 'منوعات', url: 'https://aawsat.com/feed/political' },
  { id: 'sport', name: 'الرياضة', url: 'https://aawsat.com/feed/sport' },
  { id: 'last-page', name: 'أولى2', url: 'https://aawsat.com/feed/last-page' },
  { id: 'reviews', name: 'مراجعات', url: 'https://aawsat.com/feed/reviews' },
  { id: 'fundamentalism', name: 'منحنيات أصولية', url: 'https://aawsat.com/feed/fundamentalism' },
  { id: 'press', name: 'الإعلام', url: 'https://aawsat.com/feed/press' },
  { id: 'education', name: 'التعليم', url: 'https://aawsat.com/feed/education' },
  { id: 'hassad', name: 'الحصاد', url: 'https://aawsat.com/feed/hassad' },
  { id: 'travel', name: 'السياحة', url: 'https://aawsat.com/feed/travel' },
  { id: 'it', name: 'تقنية المعلومات', url: 'https://aawsat.com/feed/information-technology' },
  { id: 'culture', name: 'فضاءات', url: 'https://aawsat.com/feed/culture' },
  { id: 'vehicles', name: 'سيارات', url: 'https://aawsat.com/feed/vehicles' },
  { id: 'cinema', name: 'سينما', url: 'https://aawsat.com/feed/cinema' },
  { id: 'health', name: 'صحتك', url: 'https://aawsat.com/feed/health' },
  { id: 'realestate', name: 'عقارات', url: 'https://aawsat.com/feed/realestate' },
  { id: 'science', name: 'علوم', url: 'https://aawsat.com/feed/science' },
  { id: 'arts', name: 'أنغام وفنون', url: 'https://aawsat.com/feed/arts' },
  { id: 'food', name: 'مذاقات', url: 'https://aawsat.com/feed/food' },
  { id: 'fashion', name: 'لمسات', url: 'https://aawsat.com/feed/fashion' },
  { id: 'investigation', name: 'تحقيق', url: 'https://aawsat.com/feed/investigation' },
  { id: 'all', name: 'الكل', url: 'https://aawsat.com/feed/all' },
  { id: 'first', name: 'الاولى', url: 'https://aawsat.com/feed/first' },
  { id: 'opinion', name: 'الرأي', url: 'https://aawsat.com/feed/opinion' }
];
