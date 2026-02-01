import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const articlesDirectory = path.join(process.cwd(), "content/articles");

export interface Article {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  published: boolean;
  content: string;
  readingTime: number;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  published: boolean;
  readingTime: number;
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getArticleSlugs(): string[] {
  try {
    const files = fs.readdirSync(articlesDirectory);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString().split("T")[0],
      excerpt: data.excerpt || "",
      image: data.image || null,
      published: data.published !== false,
      content,
      readingTime: calculateReadingTime(content),
    };
  } catch {
    return null;
  }
}

export async function getArticleHtml(content: string): Promise<string> {
  const result = await remark().use(html).process(content);
  return result.toString();
}

export function getAllArticles(): ArticleMeta[] {
  const slugs = getArticleSlugs();
  const articles = slugs
    .map((slug) => {
      const article = getArticleBySlug(slug);
      if (!article || !article.published) return null;
      const { content, ...meta } = article;
      return meta;
    })
    .filter((article): article is ArticleMeta => article !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return articles;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
