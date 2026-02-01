import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";

export default function HomePage() {
  const articles = getAllArticles();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <section className="mb-12 animate-fade-in">
        <p className="text-lg sm:text-xl text-warmgray-dark dark:text-warmgray-light max-w-2xl">
          Breaking down the latest in technology, one chat at a time.
          Written for everyone who wants to stay informed without the jargon.
        </p>
      </section>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-warmgray dark:text-warmgray-light text-lg">
            No articles yet. Check back soon!
          </p>
        </div>
      ) : (
        <section className="stagger-children">
          <div className="grid gap-6 sm:gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
