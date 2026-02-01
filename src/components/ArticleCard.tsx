import Link from "next/link";
import Image from "next/image";
import { ArticleMeta, formatDate } from "@/lib/articles";

interface ArticleCardProps {
  article: ArticleMeta;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <article className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-cream-200 dark:border-charcoal-light/20">
        {article.image && (
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm text-warmgray dark:text-warmgray-light mb-3">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span className="text-cream-200 dark:text-charcoal-light">•</span>
            <span>{article.readingTime} min read</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-charcoal dark:text-dark-text mb-3 group-hover:text-amber-accent transition-colors">
            {article.title}
          </h2>
          <p className="text-warmgray-dark dark:text-warmgray-light line-clamp-2">
            {article.excerpt}
          </p>
          <div className="mt-4 flex items-center text-amber-accent font-medium">
            <span className="group-hover:mr-2 transition-all">Read more</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
