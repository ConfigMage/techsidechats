import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { list, put, del } from "@vercel/blob";

const articlesDirectory = path.join(process.cwd(), "content/articles");
const isVercel = process.env.VERCEL === "1";

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

function parseArticleContent(slug: string, fileContents: string): Article {
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
}

// Local filesystem functions
function getLocalArticleSlugs(): string[] {
  try {
    if (!fs.existsSync(articlesDirectory)) {
      return [];
    }
    const files = fs.readdirSync(articlesDirectory);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

function getLocalArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    return parseArticleContent(slug, fileContents);
  } catch {
    return null;
  }
}

// Vercel Blob functions
async function getBlobArticleSlugs(): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix: "articles/" });
    return blobs
      .map((blob) => blob.pathname.replace("articles/", "").replace(".md", ""))
      .filter((slug) => slug.length > 0);
  } catch {
    return [];
  }
}

async function getBlobArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { blobs } = await list({ prefix: `articles/${slug}.md` });
    if (blobs.length === 0) {
      return null;
    }
    const response = await fetch(blobs[0].url);
    const fileContents = await response.text();
    return parseArticleContent(slug, fileContents);
  } catch {
    return null;
  }
}

// Public API - automatically picks the right storage
export function getArticleSlugs(): string[] {
  // Always use local for build time (SSG)
  return getLocalArticleSlugs();
}

export function getArticleBySlug(slug: string): Article | null {
  // Always use local for build time (SSG)
  return getLocalArticleBySlug(slug);
}

export async function getArticleSlugsAsync(): Promise<string[]> {
  if (isVercel) {
    const blobSlugs = await getBlobArticleSlugs();
    const localSlugs = getLocalArticleSlugs();
    // Merge and deduplicate
    return [...new Set([...blobSlugs, ...localSlugs])];
  }
  return getLocalArticleSlugs();
}

export async function getArticleBySlugAsync(slug: string): Promise<Article | null> {
  if (isVercel) {
    // Try blob first, then local
    const blobArticle = await getBlobArticleBySlug(slug);
    if (blobArticle) return blobArticle;
  }
  return getLocalArticleBySlug(slug);
}

export async function getAllArticlesAsync(): Promise<ArticleMeta[]> {
  const slugs = await getArticleSlugsAsync();
  const articles: ArticleMeta[] = [];

  for (const slug of slugs) {
    const article = await getArticleBySlugAsync(slug);
    if (article && article.published) {
      const { content, ...meta } = article;
      articles.push(meta);
    }
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveArticle(
  slug: string,
  data: {
    title: string;
    date: string;
    excerpt: string;
    image?: string;
    published: boolean;
    content: string;
  }
): Promise<void> {
  const frontmatter = [
    "---",
    `title: "${data.title.replace(/"/g, '\\"')}"`,
    `date: "${data.date}"`,
    `excerpt: "${(data.excerpt || "").replace(/"/g, '\\"')}"`,
    data.image ? `image: "${data.image}"` : null,
    `published: ${data.published}`,
    "---",
    "",
    data.content,
  ]
    .filter((line) => line !== null)
    .join("\n");

  if (isVercel) {
    await put(`articles/${slug}.md`, frontmatter, {
      access: "public",
      addRandomSuffix: false,
    });
  } else {
    if (!fs.existsSync(articlesDirectory)) {
      fs.mkdirSync(articlesDirectory, { recursive: true });
    }
    fs.writeFileSync(path.join(articlesDirectory, `${slug}.md`), frontmatter, "utf8");
  }
}

export async function deleteArticle(slug: string): Promise<void> {
  if (isVercel) {
    const { blobs } = await list({ prefix: `articles/${slug}.md` });
    if (blobs.length > 0) {
      await del(blobs[0].url);
    }
  } else {
    const filePath = path.join(articlesDirectory, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

export async function articleExists(slug: string): Promise<boolean> {
  if (isVercel) {
    const { blobs } = await list({ prefix: `articles/${slug}.md` });
    return blobs.length > 0;
  }
  return fs.existsSync(path.join(articlesDirectory, `${slug}.md`));
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
