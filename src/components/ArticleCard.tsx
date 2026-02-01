import Link from "next/link";
import { ArticleMeta, formatDate } from "@/lib/articles";

interface ArticleCardProps {
  article: ArticleMeta;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="py-8 border-b border-gray-100 dark:border-dark-border last:border-b-0">
      <Link href={`/articles/${article.slug}`} className="group block">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="font-medium text-gray-900 dark:text-dark-text">ConfigMage</span>
          <span>·</span>
          <time dateTime={article.date}>{formatDate(article.date)}</time>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-text mb-3 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          {article.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{article.readingTime} min read</span>
        </div>
      </Link>
    </article>
  );
}
