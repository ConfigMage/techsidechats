import { getAllArticlesAsync } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const articles = await getAllArticlesAsync();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-12 pb-8 border-b border-gray-200 dark:border-dark-border">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-dark-text mb-4">
          Techside Chats
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
          Making sense of technology, one article at a time. Written for everyone
          who wants to stay informed without the jargon.
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No articles yet. Check back soon.
          </p>
        </div>
      ) : (
        <section>
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </section>
      )}
    </div>
  );
}
