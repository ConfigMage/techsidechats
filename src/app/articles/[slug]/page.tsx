import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlugAsync, getArticleHtml, getArticleSlugs, formatDate } from "@/lib/articles";
import ReadingProgress from "@/components/ReadingProgress";
import ArticleContent from "@/components/ArticleContent";

export const revalidate = 60; // Revalidate every 60 seconds

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlugAsync(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${article.title} | Techside Chats`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlugAsync(slug);

  if (!article || !article.published) {
    notFound();
  }

  const contentHtml = await getArticleHtml(article.content);

  return (
    <>
      <ReadingProgress />
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <header className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-gray-900 mb-6 leading-[1.15]">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-gray-500">
            <span className="font-medium text-gray-900">ConfigMage</span>
            <span>·</span>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span>·</span>
            <span>{article.readingTime} min read</span>
          </div>
        </header>

        <ArticleContent html={contentHtml} />

        <footer className="mt-16 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            All articles
          </Link>
        </footer>
      </article>
    </>
  );
}
