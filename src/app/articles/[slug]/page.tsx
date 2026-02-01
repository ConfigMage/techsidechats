import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getArticleBySlug, getArticleHtml, getArticleSlugs, formatDate } from "@/lib/articles";
import ReadingProgress from "@/components/ReadingProgress";
import ArticleContent from "@/components/ArticleContent";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

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
  const article = getArticleBySlug(slug);

  if (!article || !article.published) {
    notFound();
  }

  const contentHtml = await getArticleHtml(article.content);

  return (
    <>
      <ReadingProgress />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-8 sm:mb-12 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center text-warmgray hover:text-amber-accent transition-colors mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to articles
          </Link>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal dark:text-dark-text mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-warmgray dark:text-warmgray-light">
            <span className="font-medium text-charcoal dark:text-dark-text">
              ConfigMage
            </span>
            <span className="text-cream-200 dark:text-charcoal-light">•</span>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span className="text-cream-200 dark:text-charcoal-light">•</span>
            <span>{article.readingTime} min read</span>
          </div>
        </header>

        {article.image && (
          <div className="relative w-full h-64 sm:h-80 lg:h-96 mb-8 sm:mb-12 rounded-xl overflow-hidden animate-fade-in">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <ArticleContent html={contentHtml} />

        <footer className="mt-12 pt-8 border-t border-cream-200 dark:border-charcoal-light/20 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-warmgray dark:text-warmgray-light">
              Written by <span className="font-medium text-charcoal dark:text-dark-text">ConfigMage</span>
            </p>
            <Link
              href="/"
              className="text-amber-accent hover:text-amber-dark transition-colors font-medium"
            >
              More articles
            </Link>
          </div>
        </footer>
      </article>
    </>
  );
}
