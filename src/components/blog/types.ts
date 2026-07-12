export interface BlogAuthor {
  name: string;
  bio?: string;
  avatar?: string;
}

export interface BlogImage {
  url?: string;
  size?: string;
  type?: string;
}

export interface BlogPostMeta {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: BlogImage;
  author: BlogAuthor;
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
  premium?: boolean;
}

export interface ApiPagination {
  current: number;
  pages: number;
  total: number;
}

export interface ApiResponse {
  success: boolean;
  data: {
    posts: BlogPostMeta[];
    pagination: ApiPagination;
  };
  error?: string;
}

export const CATEGORY_GRADIENTS: Record<string, string> = {
  "Jobs":         "from-sapphire-50 to-page",
  "Resume":       "from-sapphire-50 to-page",
  "Career Tips":  "from-sapphire-50 to-page",
  "Scholarships": "from-sapphire-50 to-page",
  "Study Abroad": "from-sapphire-50 to-page",
  "Interviews":   "from-sapphire-50 to-page",
  "Remote Work":  "from-sapphire-50 to-page",
  "Internships":  "from-sapphire-50 to-page",
};

export const DEFAULT_GRADIENT = "from-sapphire-50 to-page";

export function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENTS[category] ?? DEFAULT_GRADIENT;
}
