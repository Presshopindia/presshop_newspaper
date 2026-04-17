export type NewsCategory =
  | "politics"
  | "crime"
  | "sport"
  | "tech"
  | "business"
  | "entertainment";

export interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: NewsCategory | string;
  date: string;
  publishedAt?: string;
  imageUrl?: string;
  content: string;
  trending?: boolean;
}

export interface NewsListResponse {
  data: NewsItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdItem {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  type: "banner" | "square";
  key: string;
}
