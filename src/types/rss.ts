export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  content?: string;
  author?: string;
  categories?: string[];
  guid?: string;
  isoDate?: string;
}

export interface FeedResponse {
  success: boolean;
  data?: FeedItem[];
  error?: string;
  source?: string;
}
